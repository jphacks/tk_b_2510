// frontend/src/app/post/page.jsx

'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './page.css'; 
import AuthGuard from '../../lib/AuthGuard';

const API_ENDPOINT = 'http://localhost:8000/analyze-and-save'; 

// 💡 追加: 分析結果を表示するためのモーダルコンポーネント
const ResultModal = ({ data, onClose }) => {
    const { emotion, comment } = data;

    // 感情によってクラスを分ける (CSSで色とアニメーションを制御)
    const emotionClass = (e) => {
        if (e.includes('楽し') || e.includes('喜')) return 'emotion-happy';
        if (e.includes('悲し')) return 'emotion-sad';
        if (e.includes('怒り') || e.includes('不満')) return 'emotion-anger';
        if (e.includes('穏や') || e.includes('落ち着')) return 'emotion-calm';
        return 'emotion-default';
    };

    return (
        <div className="result-modal-overlay" onClick={onClose}>
            <div className={`result-modal-card ${emotionClass(emotion)}`} onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>✕</button>
                <div className="result-icon">
                    {/* 感情に対応するエモいアイコン */}
                    {emotion.includes('楽し') || emotion.includes('喜') ? '🎉' :
                     emotion.includes('悲し') ? '😢' :
                     emotion.includes('怒り') || emotion.includes('不満') ? '😡' :
                     emotion.includes('穏や') || emotion.includes('落ち着') ? '😌' :
                     '✨'}
                </div>
                <h3 className="result-title">感情を記録しました！</h3>
                <p className="result-emotion">あなたの気持ち: <span>{emotion}</span></p>
                
                <div className="ai-comment-box">
                    <p className="ai-comment-label">AIのコメント:</p>
                    <p className="ai-comment-text">『{comment}』</p>
                </div>

                <div className="result-footer">
                    <button className="ok-button" onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};
// 💡 ResultModalコンポーネントの定義終わり


const PostPage = () => {
    // ページの状態（選んだ写真、コメントなど）を覚えるための箱を用意
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null); // ユーザーIDを保持する状態
    // 💡 修正箇所: この行が未定義エラーの原因です。必ずPostPageコンポーネントの直下に追加してください。
    const [resultData, setResultData] = useState(null); // { emotion, comment, image_url } を保持

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

            // 💡 変更: alert() を削除し、結果をステートに保存してモーダルを表示
            setResultData(result); 

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

    // --- JSXの部分 ---
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

            {/* 💡 結果モーダルを追加 */}
            {resultData && (
                <ResultModal data={resultData} onClose={() => setResultData(null)} />
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