import React from 'react';
import './page.css'; // スタイルを別ファイルから読み込みます

function App() {
  return (
    <div className="container">
      {/*
      <header className="app-header">
        <h1 className="title cute-title">Emolog</h1>
      </header>
      */}
      
      {/* ヘッダーとフッターの間だけ背景を表示するラッパー */}
      <div className="content-wrapper">
        
        {/* 左側のメインコンテンツ */}
        <main className="main-content">
          <p className="tagline-large">
            〜あなたの感情が
          </p>
          <p className="tagline-large tagline-offset">
            世界を笑顔に変えていく〜
          </p>
          <p className="description">
            Emologは、AIによる感情分析とリキャップによるセルフケア・ジャーナリングアプリです。
            日々の感情を記録するだけでなく、AIが写真に対してコメントを返し、それらがリキャップとして映像になることで、
            至高のエモいを体感します。
          </p>
        </main>

        {/* 右側のナビゲーション */}
        <nav className="navigation">
          <a href="/login" className="nav-link login-button">Logon/Login</a>
        </nav>

      </div>

    
    </div>
  );
}

export default App;