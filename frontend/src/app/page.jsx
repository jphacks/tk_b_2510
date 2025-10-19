import React from 'react';
import './globals.css'; // スタイルを別ファイルから読み込みます

function App() {
  return (
    <div className="container">
      {/*
      <header className="app-header">
        <h1 className="title cute-title">Emolog</h1>
      </header>
      */}
      
      {/* メインコンテンツとナビゲーションを左右に並べるためのラッパー */}
      <div className="content-wrapper">
        
        {/* 左側のメインコンテンツ */}
        <main className="main-content">
          <p className="tagline-large">
            〜あなたの感情が
          </p>
          <p className="tagline-large">
            世界を緑に変えていく〜
          </p>
          <p className="description">
            Emologは、AIによる感情分析とアバター育成要素を組み合わせた、まったく新しいセルフケア・ジャーナリングアプリです。日々の感情を記録するだけでなく、その感情と継続が「あなただけの世界」を育てる体験を提供します。
          </p>
        </main>

        {/* 右側のナビゲーション */}
        <nav className="navigation">
          <a href="/login" className="nav-link login-button">Login</a>
          <a href="/register" className="nav-link register-link">新規登録はこちらから</a>
        </nav>

      </div>
    </div>
  );
}

export default App;