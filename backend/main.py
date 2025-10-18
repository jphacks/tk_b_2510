import os
import io
from fastapi import FastAPI, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client as SupabaseClient
from google import genai
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- JWT 設定 ---
SECRET_KEY = os.environ.get("JWT_SECRET", "dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7日

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
# .envファイルなどで管理することを推奨
# 環境変数からAPIキーやURLを読み込む
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
BUCKET_NAME = "diary_images" # Supabase Storageで使うバケット名

# FastAPIアプリケーションのインスタンス作成
app = FastAPI()

# CORS設定（Next.jsフロントエンドからのアクセスを許可）
origins = [
    "http://localhost:3000",  # Next.js開発サーバーのオリジン
    # "https://your-frontend-domain.vercel.app", # デプロイ後のオリジン
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GeminiとSupabaseクライアントの初期化
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Supabaseクライアントを依存性注入で使用
def get_supabase_client() -> SupabaseClient:
    """Supabaseクライアントを返す"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase環境変数が設定されていません")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# --- 2. レスポンスのデータモデル定義 (Pydantic) ---
class DiaryResponse(BaseModel):
    """フロントエンドに返すデータの構造"""
    comment: str
    image_url: str
    diary_id: int


# --- 認証用モデル ---
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
    user_id: str,  # 認証後にフロントエンドから渡されると想定
    supabase: SupabaseClient = Depends(get_supabase_client)
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
        # アップロード失敗時の処理
        raise HTTPException(status_code=500, detail=f"画像アップロード失敗: {e}")

    # 3.3. Gemini APIでの解析とコメント生成
    try:
        # 画像データをBytesIOでラップし、Geminiに渡す
        image_stream = io.BytesIO(file_contents)
        image_part = genai.types.Part.from_bytes(
            data=image_stream.read(),
            mime_type=image.content_type
        )

        # プロンプト（AIへの指示）の定義
        prompt = (
            "この画像から読み取れる感情や感性を分析し、"
            "その日の出来事を記録するような、暖かくて短い日記コメントを100文字以内の日本語で生成してください。"
            "日記の最後は『素敵な一日でした。』で締めくくってください。"
        )

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([image_part, prompt])
        generated_comment = response.text.strip()
    except Exception as e:
        # Gemini処理失敗時の処理
        print(f"Gemini APIエラー: {e}")
        raise HTTPException(status_code=500, detail="AI解析中にエラーが発生しました。")

    # 3.4. Supabase DBに結果を保存
    try:
        data, count = supabase.table("diaries").insert({
            "user_id": user_id,
            "image_url": image_url,
            "comment": generated_comment,
        }).execute()
        
        # 挿入されたレコードのIDを取得
        new_diary_id = data[0][0]['id'] 

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB保存失敗: {e}")

    # 3.5. フロントエンドへのレスポンス
    return DiaryResponse(
        comment=generated_comment,
        image_url=image_url,
        diary_id=new_diary_id
    )


@app.post('/api/login', response_model=Token)
async def login(form: LoginForm):
    """
    シンプルなログインエンドポイント。
    - このサンプルではユーザー情報はハードコード/環境変数で管理します。
    - 本番ではDBでユーザーを管理してください。
    """
    # テスト用ハードコードユーザ: 環境変数で上書き可能
    demo_email = os.environ.get('DEMO_USER_EMAIL', 'user@example.com')
    demo_password_hash = os.environ.get('DEMO_USER_PASSWORD_HASH')
    demo_password_plain = os.environ.get('DEMO_USER_PASSWORD')

    # パスワードハッシュが未指定で平文があればハッシュ化して使う
    if not demo_password_hash and demo_password_plain:
        demo_password_hash = get_password_hash(demo_password_plain)

    # ここでは email と password を比較
    # Always verify password, even if email is invalid, to avoid timing attacks
    # Use a dummy hash if email does not match or password hash is missing
    DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeOe5F2bY6b2b1Z6b2b1Z6b2b1Z6b2b1Z6b2"  # bcrypt hash for "dummy"
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