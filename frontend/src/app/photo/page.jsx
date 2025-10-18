'use client';
import React, { useState, useEffect } from 'react';
// ⚠️ 実際のパスに合わせてください
import { supabase } from '../../lib/supabaseClient';
import './page.css'; // 見た目（CSS）を読み込みます
import AuthGuard from '../../lib/AuthGuard';

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

    // 投稿ハンドラ (Supabase実装)
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

        // 1. Storageに画像をアップロードする
        let publicUrl = '';
        const fileExtension = selectedFile.name.split('.').pop();
        // ユーザーIDとタイムスタンプを使ってユニークなファイル名を生成
        const filePath = `${userId}/${Date.now()}.${fileExtension}`; 

        try {
            const { data: uploadData, error: uploadError } = await supabase.storage
                // ⚠️ バケット名を 'post_photos' に変更してください
                .from('post_photos') 
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }

            // ⚠️ Storageの公開設定に基づいて、公開URLを取得します
            const { data: { publicUrl: url } } = supabase.storage
                .from('post_photos') 
                .getPublicUrl(filePath);
            
            publicUrl = url;

        // 2. Databaseに投稿レコードを挿入する
            const { data: postData, error: insertError } = await supabase
                // ⚠️ テーブル名を 'posts' に変更してください
                .from('posts') 
                .insert([
                    { 
                        user_id: userId,
                        photo_url: publicUrl,
                        caption: caption,
                        // 他のフィールド（例: emotion, pointsなど）があればここに追加
                    },
                ]);

            if (insertError) {
                throw insertError;
            }


            // 成功メッセージ（感情分析などはダミーのままにしてあります）
            const mockResponse = { emotion: '和む', points: 50 };
            alert(`🎉 投稿が完了！感情: ${mockResponse.emotion}が記録されました！+${mockResponse.points}Pゲット！`);

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