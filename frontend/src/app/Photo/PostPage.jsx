import React, { useState } from 'react';
import './PostPage.css'; // 見た目（CSS）を読み込みます

const PostPage = () => {
    // ページの状態（選んだ写真、コメントなど）を覚えるための箱を用意
    const [selectedFile, setSelectedFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState('');      
    const [caption, setCaption] = useState('');            
    const [isLoading, setIsLoading] = useState(false);     

    // ステップ2で作成する「動き」の関数を定義する場所
    const handleFileChange = (event) => { // PostPage.jsx 内の handleFileChange 関数
const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
        // 1. ファイルを記憶する
        setSelectedFile(file); 
        // 2. プレビュー用の「一時的な住所（URL）」を作る
        setPreviewUrl(URL.createObjectURL(file)); 
    } else {
        // ファイルが選ばれなかったらリセット
        setSelectedFile(null);
        setPreviewUrl('');
    }
};/* ... ステップ2のコードが入ります ... */ };
    const handleSubmit = async () => { // PostPage.jsx 内の handleSubmit 関数
const handleSubmit = async () => {
    if (!selectedFile) {
        alert('写真をアップロードしてください。');
        return;
    }

    // 投稿処理開始の合図
    setIsLoading(true); 

    // サーバーに送るデータ（写真とコメント）を準備
    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('caption', caption);

    console.log("--- 投稿処理を開始 ---");

    try {
        // **********************************************
        // ここが、チームのバックエンドとの連携ポイントです！
        // チームで決めたAPIの住所にデータを送る処理に置き換えてください
        // 例: const response = await fetch('/api/post/new', { method: 'POST', body: formData });
        // **********************************************
        
        // 【プログラミング初心者向け】3秒待って成功したと見なすシミュレーション
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 成功時の処理
        const mockResponse = { emotion: "和む", points: 50 }; // サーバーからの返答の例
        alert(`🎉 投稿が完了！感情: ${mockResponse.emotion}が記録されました！+${mockResponse.points}Pゲット！`);

        // フォームをきれいにする
        setSelectedFile(null);
        setPreviewUrl('');
        setCaption('');
        
        // ホーム画面などへ移動する処理（例：window.location.href = '/home';）
        
    } catch (error) {
        // 失敗時の処理
        console.error('投稿エラー:', error);
        alert("🚨 投稿に失敗しました。時間をおいて再度お試しください。");
    } finally {
        // 成功しても失敗しても、ローディングは必ず終了する
        setIsLoading(false); 
    }
};/* ... ステップ2のコードが入ります ... */ };

    return (
        <div className="post-container">
            <h2>今日の感情を記録する</h2>

            {/* 写真選択/プレビューエリア */}
            <div className="photo-area">
                {/* プレビュー画像 または 写真選択ボタンを表示 */}
                {previewUrl ? (
                    // 写真が選ばれたら、プレビュー画像を表示
                    <img src={previewUrl} alt="プレビュー画像" className="preview-image" />
                ) : (
                    // 写真が未選択なら、大きな選択ボタンを表示
                    <label htmlFor="photo-upload" className="upload-label">
                        📸 写真を選択・撮影
                    </label>
                )}
                
                {/* 実際にファイルを選ぶための隠れたボタン */}
                <input 
                    type="file" 
                    id="photo-upload" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleFileChange} // 写真を選ぶと、ステップ2の関数が動くように設定
                />
            </div>

            {/* コメント（キャプション）入力エリア */}
            <div className="caption-area">
                <label htmlFor="caption">📝 コメント（optional）</label>
                <textarea 
                    id="caption" 
                    placeholder="写真にまつわる気持ちを書いてみましょう..."
                    value={caption}
                    // 入力内容が変わるたびに、上の 'caption' の状態を更新
                    onChange={(e) => setCaption(e.target.value)} 
                    disabled={isLoading}
                />
            </div>

            {/* 投稿ボタン */}
            <button 
                id="submit-button" 
                onClick={handleSubmit} // クリックすると、ステップ2の投稿関数が動くように設定
                // 写真が未選択の場合 or 投稿処理中の場合は、ボタンを押せないようにする
                disabled={!selectedFile || isLoading} 
            >
                {/* 処理中の状態によってボタンのテキストを切り替える */}
                {isLoading ? '感情を読み取り中...' : '世界を育てる✨'}
            </button>

            {/* ローディング表示 (isLoadingが true のときだけ表示) */}
            {isLoading && (
                <div className="loading-overlay">
                    <p>感情を読み取っています...</p>
                </div>
            )}
        </div>
    );
};

export default PostPage;