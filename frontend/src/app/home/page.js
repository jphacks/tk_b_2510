"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import AuthGuard from "../../lib/AuthGuard";

function HomeContent() {
  const [username, setUsername] = useState('あなた');
  const [streakDays, setStreakDays] = useState(365);

  useEffect(() => {
    try {
      const name = localStorage.getItem('username') || localStorage.getItem('user') || 'あなた';
      setUsername(name);
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  return (
    <>
      <header className={styles.header}>
          <div className={styles.brand}><h1>Emolog</h1></div>
          <p className={styles.tag}>～写真が語る感情～</p>
          <div className={styles.headerButtons}>
            <button className={styles.btn}>カレンダー</button>
            <button className={styles.btn}>マイページ</button>
          </div>
        </header>
      <main className={styles.mainGrid}>
        <aside className={styles.userPanel}>
          <div className={styles.userAvatar} aria-hidden>U</div>
          <h2 className={styles.userName}>{username}</h2>
          <p className={styles.userMeta}>投稿数: 12</p>
        </aside>

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
