'use client';
import React, { useState } from 'react';
import './page.css'; // ← ここを修正しました

const PostPage = () => {
    // 状態（State）の定義: ページの状態を覚えるための箱
    const [selectedFile, setSelectedFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState('');      
    const [caption, setCaption] = useState('');            
    const [isLoading, setIsLoading] = useState(false);     

    // 写真を選ぶ「動き」の関数
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file) {
            setSelectedFile(file); 
            // プレビュー用の「一時的な住所（URL）」を作る
            setPreviewUrl(URL.createObjectURL(file)); 
        } else {
            // ファイルが選ばれなかったらリセット
            setSelectedFile(null);
            setPreviewUrl('');
        }
    };
    
    // 投稿する「動き」の関数
    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('写真をアップロードしてください。');
            return;
        }

        setIsLoading(true); 

        // サーバーに送るデータ（写真とコメント）を準備
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('caption', caption);

        console.log("--- 投稿処理を開始 ---");

        try {
            // ★【チーム連携ポイント】ここは、チームのバックエンドAPI通信に置き換えてください！
            // 例: const response = await fetch('/api/post/new', { method: 'POST', body: formData });
            
            // 3秒待機するシミュレーション
            await new Promise(resolve => setTimeout(resolve, 3000));

            const mockResponse = { emotion: "和む", points: 50 }; // サーバーからの返答の例
            alert(`🎉 投稿が完了！感情: ${mockResponse.emotion}が記録されました！+${mockResponse.points}Pゲット！`);

            // フォームをきれいにする
            setSelectedFile(null);
            setPreviewUrl('');
            setCaption('');
            
            // 成功後、ホーム画面などへ移動する処理を追加 (例: window.location.href = '/home';)
            
        } catch (error) {
            console.error('投稿エラー:', error);
            alert("🚨 投稿に失敗しました。");
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="post-container">
            <h2>今日の感情を記録する</h2>

            {/* 写真選択/プレビューエリア */}
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

            {/* コメント（キャプション）入力エリア */}
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

            {/* 投稿ボタン */}
            <button 
                id="submit-button" 
                onClick={handleSubmit} 
                disabled={!selectedFile || isLoading} 
            >
                {isLoading ? '感情を読み取り中...' : '世界を育てる✨'}
            </button>

            {/* ローディング表示 */}
            {isLoading && (
                <div className="loading-overlay">
                    <p>感情を読み取っています...</p>
                </div>
            )}
        </div>
    );
};

export default PostPage;