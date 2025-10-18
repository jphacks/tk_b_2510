import os
import io
import time
import json # JSON解析のためにインポート
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client as SupabaseClient
from google import genai
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging
# PIL (Pillow) をインポートに追加
from PIL import Image

# --- JWT 設定 (フロントエンドがSupabase Authを使用しているため、このブロックは不要だが、一旦保持) ---
SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7日

# Set up logging
logging.basicConfig(level=logging.INFO)

# Check for insecure default secret key
ENV = os.environ.get("ENV", os.environ.get("PYTHON_ENV", "production")).lower()
if SECRET_KEY == "dev-secret":
    if ENV == "production":
        raise RuntimeError("JWT_SECRET environment variable must be set in production. Using default 'dev-secret' is insecure.")
    else:
        logging.warning("Using default JWT secret key 'dev-secret'. This is insecure and should only be used for development.")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 1. 環境設定と初期化 ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
BUCKET_NAME = "post_photos" # Supabase Storageで使うバケット名

# FastAPIアプリケーションのインスタンス作成
app = FastAPI()

# CORS設定（Next.jsフロントエンドからのアクセスを許可）
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Geminiクライアントの初期化 (APIキーがない場合は後続でエラーを出す)
try:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    logging.error(f"Gemini client initialization failed: {e}")

# Supabaseクライアントを依存性注入で使用
def get_supabase_client() -> SupabaseClient:
    """Supabaseクライアントを返し、環境変数がない場合はエラーを発生させる"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Supabase環境変数が設定されていません")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# --- 2. レスポンスのデータモデル定義 (Pydantic) ---
class DiaryResponse(BaseModel):
    """フロントエンドに返すデータの構造"""
    comment: str
    image_url: str
    diary_id: str # IDをUUID型に対応させるため、strに変更


# --- 認証用モデル (中略) ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginForm(BaseModel):
    email: str
    password: str

# --- 3. APIエンドポイントの定義 ---

@app.post("/analyze-and-save", response_model=DiaryResponse)
async def analyze_and_save_diary(
    image: UploadFile, 
    user_id: str = Form(...), # 💡 user_idをFormデータとして受け取る
    supabase: SupabaseClient = Depends(get_supabase_client) # 💡 依存性注入
):
    """
    画像を処理し、Geminiで解析・コメント生成を行い、Supabaseに保存する。
    """
    
    # 3.1. 画像ファイルの読み込みとチェック
    file_contents = await image.read()
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="画像ファイルではありません")

    # 3.2. Supabase Storageに画像をアップロード
    try:
        file_path = f"{user_id}/{image.filename}"
        supabase.storage.from_(BUCKET_NAME).upload(
            file=file_contents,
            path=file_path,
            file_options={"content-type": image.content_type}
        )
        # 公開URLを取得
        image_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"画像アップロード失敗: {e}")

    # 3.3. Gemini APIでの解析とコメント生成
    try:
        # Pillowを使って画像を読み込む
        pil_image = Image.open(io.BytesIO(file_contents))
        
        # プロンプト（AIへの指示）の定義
        prompt = (
            "あなたはプロの感情分析AIです。この写真を見て、ユーザーがどんな感情を抱いているか分析してください。"
            "そして、その感情を表現する日記のコメントを、親しみやすい文体で日本語で30文字程度で生成してください。"
            "回答は必ずJSON形式で、キーを 'emotion' (分析した感情), 'comment' (生成したコメント) としてください。"
            "例: {\"emotion\": \"楽しそう\", \"comment\": \"最高の一日！こんな日はいつまでも続いてほしいな。\"}"
        )

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([pil_image, prompt])
        
        # JSONレスポンスをパース
        analysis_result = json.loads(response.text.strip())
        emotion_text = analysis_result.get("emotion", "分析不能")
        generated_comment = analysis_result.get("comment", "日記コメント生成失敗")

    except Exception as e:
        print(f"Gemini APIエラー: {e}")
        # 長文エラーを避けるため、一般的なエラーを返す
        raise HTTPException(status_code=500, detail="AI解析中にエラーが発生しました。詳細はサーバーログを確認してください。")

    # 3.4. Supabase DBに結果を保存
    try:
        # ⚠️ テーブル名を 'posts' に統一
        data, count = supabase.table("posts").insert({
            "user_id": user_id,
            "image_url": image_url,
            "comment": generated_comment,
            "emotion": emotion_text,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }).execute()
        
        # 挿入されたレコードのIDを取得
        # SupabaseのIDカラムをUUIDにした場合、'id'として取得される
        new_diary_id = data[0][0]['id'] if data and data[0] and data[0][0] else None

    except Exception as e:
        logging.error(f"DB保存失敗: {e}")
        raise HTTPException(status_code=500, detail=f"DB保存失敗: {e}")

    # 3.5. フロントエンドへのレスポンス
    return DiaryResponse(
        comment=generated_comment,
        image_url=image_url,
        diary_id=new_diary_id if new_diary_id else "unknown"
    )


# --- 4. 日記表示用API (P2タスク) ---
@app.get("/api/photos")
async def get_user_diaries(
    user_id: str, # クエリパラメータとして user_id を受け取る
    supabase: SupabaseClient = Depends(get_supabase_client) # 💡 依存性注入
):
    """
    指定されたユーザーIDの日記エントリ（写真とコメント）をすべて取得する。
    """
    try:
        # DBからデータを取得: 'posts'テーブルを使用
        # 必要なカラム: id, image_url, comment(caption), created_at
        result = supabase.table("posts").select(
            "id, image_url, comment, created_at"
        ).eq("user_id", user_id).order("created_at", desc=True).execute()

        # result.data からレコードのリストを取得 (supabase-pyの新しいバージョンではdata[1]ではなく.dataを使うことがある)
        data = result.data if hasattr(result, 'data') else result[1] 

        # データをフロントエンドの期待する形式に変換
        formatted_diaries = []
        for item in data:
            created_at_str = item["created_at"]
            # YYYY-MM-DD 形式に変換
            ymd_date = created_at_str.split('T')[0]
            
            formatted_diaries.append({
                "id": item["id"],
                "url": item["image_url"],
                "date": ymd_date,
                "caption": item["comment"],
            })
        
        return formatted_diaries

    except Exception as e:
        # DB接続やクエリのエラーはここで捕捉
        logging.error(f"Error fetching diaries for user {user_id}: {e}")
        # 長文エラーを避けるため、一般的なエラーを返す
        raise HTTPException(status_code=500, detail=f"日記データの取得中に予期せぬエラーが発生しました。詳細はサーバーログを確認してください。")


# --- 5. 認証用エンドポイント (フロントエンドがSupabase Authを使用しているため、このブロックは不要だが、一旦保持) ---
@app.post('/api/login', response_model=Token)
async def login(form: LoginForm):
    # ... (既存の login ロジックは省略) ...
    # このエンドポイントは、フロントエンドがSupabase認証を使用しているため、現在使用されていません。
    # 削除を推奨します。
    demo_email = os.environ.get('DEMO_USER_EMAIL', 'user@example.com')
    demo_password_hash = os.environ.get('DEMO_USER_PASSWORD_HASH')
    demo_password_plain = os.environ.get('DEMO_USER_PASSWORD')
    if not demo_password_hash and demo_password_plain:
        demo_password_hash = get_password_hash(demo_password_plain)
    DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeOe5F2bY6b2b1Z6b2b1Z6b2b1Z6b2b1Z6b2"
    password_hash_to_check = demo_password_hash if form.email == demo_email and demo_password_hash else DUMMY_HASH
    if not verify_password(form.password, password_hash_to_check):
        raise HTTPException(status_code=401, detail='認証に失敗しました')
    if form.email != demo_email or not demo_password_hash:
        raise HTTPException(status_code=401, detail='認証に失敗しました')
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- 6. ヘルスチェック ---
@app.get("/")
def read_root():
    return {"status": "ok", "service": "Emolog Backend"}