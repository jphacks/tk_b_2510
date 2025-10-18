'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css'; // 💡 CSS Modules のインポートはこれが正しい
import AuthGuard from '../../lib/AuthGuard';
import { supabase } from '../../lib/supabaseClient'; 

function HomeContent() {
  const [username, setUsername] = useState('あなた'); 
  const [userEmail, setUserEmail] = useState('未認証');
  const [userIdShort, setUserIdShort] = useState('---');
  const [postCount, setPostCount] = useState(12); 
  const [streakDays, setStreakDays] = useState(365); 

  // 💡 ユーザーセッションと情報を取得する
  useEffect(() => {
    const fetchUserData = async () => {
      // Supabaseから現在のセッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        const user = session.user;
        const userId = user.id; // ユーザーIDを取得
        const shortId = user.id.substring(0, 8) + '...';
        const namePart = user.email ? user.email.split('@')[0] : 'ユーザー';
        
        setUsername(namePart);
        setUserEmail(user.email);
        setUserIdShort(shortId);
        
        // --- 💡 ユーザー統計情報の取得 ---
        const API_ENDPOINT = `http://localhost:8000/user-stats?user_id=${encodeURIComponent(userId)}`;

        try {
            const res = await fetch(API_ENDPOINT);
            if (res.ok) {
                const stats = await res.json();
                setPostCount(stats.post_count); 
                setStreakDays(stats.streak_days); 
            } else {
                console.error("Failed to fetch user stats:", res.status);
            }
        } catch (error) {
            console.error("API connection error for user stats:", error);
        }
        // --- 💡 追加ここまで ---
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <header className={styles.header}>
          <div className={styles.brand}><h1>Emolog</h1></div>
          <p className={styles.tag}>～写真が語る感情～</p>
          <div className={styles.headerButtons}>
            {/* 既存のボタンをリンクに修正（CSSはstyles.btnで維持） */}
            <a href="/diary" className={styles.btn}>カレンダー</a> {/* /diary へ */}
            <a href="/settings" className={styles.btn}>マイページ</a> {/* /settings へ */}
          </div>
        </header>
      <main className={styles.mainGrid}>
        {/* ユーザー情報パネルの更新 */}
        <aside className={styles.userPanel}>
          {/* ユーザーアバターの頭文字を動的に表示 */}
          <div className={styles.userAvatar} aria-hidden>{username.charAt(0).toUpperCase()}</div> 
          <h2 className={styles.userName}>{username}</h2>
          
          {/* ユーザーメタデータの追加/置き換え */}
          <p className={styles.userMeta}>Email: {userEmail}</p>
          <p className={styles.userMeta}>UserID: {userIdShort}</p>
          <p className={styles.userMeta}>投稿数: {postCount}</p>
        </aside>

        {/* 連続投稿日数の更新 */}
        <section className={styles.streakColumn}>
          <div className={styles.modalWrap}>
            <div className={styles.modalCard} role="region" aria-labelledby="big-streak">
              <div className={styles.bigNumber} id="big-streak">{streakDays}</div>
              <h3 className={styles.bigHeadline}>{streakDays}日連続投稿！</h3>
              <p className={styles.description}><strong>{username}</strong> さんの次回作も楽しみです！</p>

              <div className={styles.modalDivider} />
            </div>
          </div>
        </section>
      </main>
        <footer>
        
        </footer>
    </>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}