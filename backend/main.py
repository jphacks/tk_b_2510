import os
import io
from fastapi import FastAPI, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client as SupabaseClient
from google import genai
from pydantic import BaseModel

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
genai.configure(api_key=GEMINI_API_KEY)

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