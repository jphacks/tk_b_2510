import os
import io
import time
import base64
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from supabase import create_client, Client
from PIL import Image

# Google Gemini関連のライブラリ
from google import genai
from google.genai import types

# -----------------
# 1. 環境設定と初期化
# -----------------
# .env.localファイルから環境変数を読み込む
load_dotenv(".../.env.local")

# 環境変数から設定値を取得
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Supabaseクライアントの初期化
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Supabase環境変数が設定されていません。")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
BUCKET_NAME = "post_photos"

# Geminiクライアントの初期化
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEYが設定されていません。")
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
# 使用するモデル
GEMINI_MODEL = "gemini-2.5-flash"


app = FastAPI()

# -----------------
# 2. CORSミドルウェア
# -----------------
# フロントエンド(localhost:3000)からのアクセスを許可
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 全てのHTTPメソッドを許可
    allow_headers=["*"], # 全てのHTTPヘッダーを許可
)

# -----------------
# 4. コア機能：AI分析と保存エンドポイント (P1タスク)
# -----------------
# 写真ファイルとユーザーIDを受け取り、AI分析してDBに保存
@app.post("/analyze-and-save")
async def analyze_and_save(
    image: UploadFile = File(...),
    user_id: str = Form(...),
):
    try:
        # 1. 画像ファイルをメモリ上に読み込む
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data))
        
        # 2. Geminiへのプロンプト定義
        prompt = (
            "あなたはプロの感情分析AIです。この写真を見て、ユーザーがどんな感情を抱いているか分析してください。"
            "そして、その感情を表現する日記のコメントを、親しみやすい文体で日本語で30文字程度で生成してください。"
            "回答は必ずJSON形式で、キーを 'emotion' (分析した感情), 'comment' (生成したコメント) としてください。"
            "例: {\"emotion\": \"楽しそう\", \"comment\": \"最高の一日！こんな日はいつまでも続いてほしいな。\"}"
        )
        
        # 3. Gemini APIの呼び出し
        gemini_response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt, pil_image], # プロンプトと画像の両方を渡す
            config=types.GenerateContentConfig(
                response_mime_type="application/json", # JSON形式の出力を要求
                # response_schemaを定義することも可能だが、ここではMIME Type指定でシンプルに
            ),
        )

        # 4. GeminiのJSONレスポンスをパース
        # レスポンステキストはJSON形式になっているはず
        import json
        analysis_result = json.loads(gemini_response.text)
        emotion_text = analysis_result.get("emotion", "分析不能")
        comment_text = analysis_result.get("comment", "日記コメント生成失敗")

        # 5. 画像をSupabase Storageにアップロード
        # ファイル名を 'ユーザーID/タイムスタンプ.jpg' の形式で作成
        file_path = f"{user_id}/{int(time.time())}_{image.filename}"
        
        # Storageにアップロード
        supabase.storage.from_(BUCKET_NAME).upload(
            file=image_data, 
            path=file_path, 
            file_options={"content-type": image.content_type}
        )
        
        # アップロードした画像の公開URLを取得（RSLポリシー設定が必要な場合あり）
        image_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)

        # 6. 分析結果とURLをSupabase Databaseに保存
        data, count = supabase.table("posts").insert({
            "user_id": user_id,
            "emotion": emotion_text,
            "comment": comment_text,
            "image_url": image_url,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }).execute()

        # 7. 成功レスポンスをフロントエンドに返す
        return {
            "message": "Analysis successful and data saved",
            "emotion": emotion_text,
            "comment": comment_text,
            "image_url": image_url
        }

    except Exception as e:
        # エラーログを出力し、フロントエンドにHTTP 500エラーを返す
        print(f"An error occurred: {e}")
        # 詳細なエラー情報はログに残し、フロントエンドには一般的なメッセージを返す
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# -----------------
# 5. ヘルスチェック
# -----------------
@app.get("/")
def read_root():
    return {"status": "ok", "service": "Emolog Backend"}

# -----------------
# 6. (不足) 日記表示用のAPI
# -----------------
# P2タスクで必要となるが、現状は実装されていないエンドポイント
# @app.get("/api/photos") 
# async def get_user_diaries(user_id: str):
#     ...