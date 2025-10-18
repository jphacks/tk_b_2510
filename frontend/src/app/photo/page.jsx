'use client';
import React, { useState } from 'react';
import './page.css'; // 見た目（CSS）を読み込みます

const PostPage = () => {
    // ページの状態（選んだ写真、コメントなど）を覚えるための箱を用意
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    // 投稿ハンドラ（ダミー実装）
    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('写真をアップロードしてください。');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('caption', caption);

        try {
            // TODO: 実際のAPIエンドポイントへ送信するコードに置き換えてください
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const mockResponse = { emotion: '和む', points: 50 };
            alert(`🎉 投稿が完了！感情: ${mockResponse.emotion}が記録されました！+${mockResponse.points}Pゲット！`);

            // リセット
            setSelectedFile(null);
            setPreviewUrl('');
            setCaption('');
        } catch (error) {
            console.error('投稿エラー:', error);
            alert('🚨 投稿に失敗しました。');
        } finally {
            setIsLoading(false);
        }
    };

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

            <button id="submit-button" onClick={handleSubmit} disabled={!selectedFile || isLoading}>
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

export default PostPage;