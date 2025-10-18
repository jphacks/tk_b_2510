'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './page.css'; 
import AuthGuard from '../../lib/AuthGuard';

const API_ENDPOINT = 'http://localhost:8000/analyze-and-save'; 

const PostPage = () => {
    // ページの状態（選んだ写真、コメントなど）を覚えるための箱を用意
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null); // ユーザーIDを保持する状態

    // 💡 コンポーネントロード時にログインユーザーのIDを取得
    useEffect(() => {
        const fetchUser = async () => {
            // 現在の認証セッションを取得
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("ユーザー情報の取得エラー:", error.message);
                return;
            }

            if (session) {
                setUserId(session.user.id);
            } else {
                // ユーザーがログインしていない場合の処理（例: ログインページへのリダイレクトなど）
                // alert('ログインが必要です。');
                console.log('ログインユーザーがいません。');
            }
        };

        fetchUser();
    }, []);

    // ファイル選択ハンドラ
    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl('');
        }
    };

    // 投稿ハンドラ (FastAPI連携実装)
    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('写真をアップロードしてください。');
            return;
        }
        
        if (!userId) {
             alert('ユーザー情報が取得できませんでした。ログイン状態を確認してください。');
             return;
        }

        setIsLoading(true);

        // FormDataオブジェクトを作成し、FastAPIに送信するデータを準備
        const formData = new FormData();
        // ⚠️ FastAPI側が期待するフィールド名: 'image'
        formData.append('image', selectedFile, selectedFile.name);
        // ⚠️ FastAPI側が期待するフィールド名: 'user_id'
        // FastAPI側ではAuthの検証は行わず、フロントエンドからの user_id を信用している点に注意
        formData.append('user_id', userId); 
        // キャプションは現状FastAPI側では使用されないため送らなくても良いが、拡張性を考慮し残しても良い

        try {
            // FastAPIのエンドポイントにデータを送信
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                // Content-Type: 'multipart/form-data' は FormData使用時は自動で設定されるため不要
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                // FastAPIからエラーが返された場合
                throw new Error(result.detail || 'バックエンド処理中にエラーが発生しました');
            }

            // 成功メッセージ（Geminiによって生成されたコメントをアラート表示）
            alert(`🎉 投稿が完了！\nAIコメント: 「${result.comment}」が記録されました！`);
            // ここでホーム画面などへリダイレクトしても良い (router.push('/home'))

            // リセット
            setSelectedFile(null);
            setPreviewUrl('');
            setCaption('');
        } catch (error) {
            console.error('投稿エラー:', error);
            // ユーザーフレンドリーなエラーメッセージ
            alert(`🚨 投稿に失敗しました。\nエラー詳細: ${error.message || '不明なエラー'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 省略（JSXの部分は変更なし） ---
    return (
        <div className="post-container">
            <h2>今日の感情を記録する</h2>

            <div className="photo-area">
                {previewUrl ? (
                    <img src={previewUrl} alt="プレビュー画像" className="preview-image" />
                ) : (
                    <label htmlFor="photo-upload" className="upload-label">
                        📸 写真を選択・撮影
                    </label>
                )}

                <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            <div className="caption-area">
                <label htmlFor="caption">📝 コメント（optional）</label>
                <textarea
                    id="caption"
                    placeholder="写真にまつわる気持ちを書いてみましょう..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <button 
                id="submit-button" 
                // userIdがまだ取得できていない場合も無効にする
                onClick={handleSubmit} 
                disabled={!selectedFile || isLoading || !userId}
            >
                {isLoading ? '感情を読み取り中...' : '世界を育てる✨'}
            </button>

            {isLoading && (
                <div className="loading-overlay">
                    <p>感情を読み取っています...</p>
                </div>
            )}
        </div>
    );
};

export default function PhotoPageWrapper() {
    return (
        <AuthGuard>
            <PostPage />
        </AuthGuard>
    );
}