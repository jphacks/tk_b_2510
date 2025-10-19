"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { supabase } from '../../lib/supabaseClient';
import AuthGuard from '../../lib/AuthGuard';

export default function HomePage() {
  const [username, setUsername] = useState('あなた');
  const [streakDays, setStreakDays] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // タイムスタンプ文字列をローカルタイムゾーンのYYYY-MM-DD形式に変換するヘルパー関数
  const getLocalYMD = (dateString) => {
    // Supabaseの日付はISO 8601文字列 (例: 2025-10-19T05:00:00.000000+00:00)
    const d = new Date(dateString);
    
    // YYYY-MM-DD形式に整形し、タイムゾーンの考慮はDateオブジェクトに任せる
    // toLocaleDateStringはローカルタイムゾーンを考慮してくれる
    // ただし、環境依存を避けるため、ISO文字列を調整する手法を採用
    const offset = d.getTimezoneOffset() * 60000; // ローカルタイムゾーンのオフセット（ミリ秒）
    const localTime = new Date(d.getTime() - offset);
    return localTime.toISOString().slice(0, 10);
  };
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Supabase から現在のユーザーを取得
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn('supabase getUser error', error.message || error);
        }
        const user = data?.user || null;
        if (!user) {
          if (mounted) {
            setUsername('あなた');
            setPostCount(0);
            setStreakDays(0);
            setLoading(false);
          }
          return;
        }

        // 表示名をユーザーメタデータの full_name / user_metadata.name / email の順で取得
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'あなた';
        if (mounted) setUsername(name);

        // photos テーブルからこのユーザーの投稿データ（日付のみ）を取得
        const { data: photos, error: photosError } = await supabase
          .from('photos')
          .select('date') // 連続日数計算には日付のみでOK
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (photosError) {
          console.warn('supabase photos fetch error', photosError.message || photosError);
          if (mounted) {
            setPostCount(0);
            setStreakDays(0);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          // 投稿数の計算
          const count = Array.isArray(photos) ? photos.length : 0;
          setPostCount(count);

          // 連続日数計算ロジック
          // 1. 投稿日をローカルタイムゾーンのYYYY-MM-DD形式に正規化し、重複を排除
          const uniqueLocalDates = new Set(
            (photos || [])
              .map(p => p.date ? getLocalYMD(p.date) : null)
              .filter(date => date)
          );

          let streak = 0;
          let dateToCheck = new Date();
          dateToCheck.setHours(0, 0, 0, 0); // ローカルタイムで「今日」の0時0分0秒に設定
          
          // 連続日数のチェック開始点を決定
          const todayYMD = getLocalYMD(dateToCheck);
          const isTodayPosted = uniqueLocalDates.has(todayYMD);

          if (isTodayPosted) {
            // 投稿が今日ある場合、連続日数は1日目からスタート
            streak = 1;
            // 次にチェックするのは「昨日」
            dateToCheck.setDate(dateToCheck.getDate() - 1);
          }
          
          // 昨日の日付をチェック
          const yesterdayYMD = getLocalYMD(dateToCheck);
          const isYesterdayPosted = uniqueLocalDates.has(yesterdayYMD);

          // 今日投稿が無く、昨日投稿がある場合は、連続が途切れているため0日
          // 今日投稿がある場合（isTodayPosted=true）は、昨日から連続をチェック開始
          // 今日投稿が無い場合（isTodayPosted=false）は、昨日投稿があればそこでストップ（連続0日）
          if (!isTodayPosted && isYesterdayPosted) {
              // 今日投稿がないが、昨日投稿がある場合は連続は途切れているため、ループは不要
              // 既に streak = 0 のため何もしない
          }
          
          // 昨日の前日（一昨日）から遡ってチェック
          if (isTodayPosted || isYesterdayPosted) {
              if (!isTodayPosted && isYesterdayPosted) {
                  // 今日投稿がないが、昨日投稿がある場合（連続なし）
                  // ループ開始位置は、今日投稿がなければ昨日まででチェック終了
              } else {
                  // 今日投稿がある場合、昨日以前の連続をチェック
                  // ループは既に昨日から開始するよう設定されている
                  while (true) {
                      const ymd = getLocalYMD(dateToCheck);
                      
                      // 過去の投稿日で日付セットに含まれていない、かつ、今日の日付ではない場合は連続終了
                      if (uniqueLocalDates.has(ymd)) {
                          streak += 1;
                          // 1日戻す
                          dateToCheck.setDate(dateToCheck.getDate() - 1);
                      } else {
                          // 連続が途切れた
                          break; 
                      }
                  }
              }
          }

          setStreakDays(streak);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setUsername('あなた');
          setPostCount(0);
          setStreakDays(0);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
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
          <div className={styles.modalWrap}>
            <div className={styles.modalCard} role="region" aria-labelledby="user-card">
              <div className={styles.userAvatar} aria-hidden>{username ? username.charAt(0).toUpperCase() : 'U'}</div>
              <h2 className={styles.userName} id="user-card">{username}</h2>
              <p className={styles.userMeta}>投稿数: {loading ? '…' : postCount}</p>
            </div>
          </div>
        </aside>

        <section className={styles.streakColumn}>
          <div className={styles.modalWrap}>
            <div className={styles.modalCard} role="region" aria-labelledby="big-streak">
              <div className={styles.bigNumber} id="big-streak">{loading ? '…' : streakDays}</div>
              <h3 className={styles.bigHeadline}>{loading ? '読み込み中…' : `${streakDays}日連続投稿！`}</h3>
              <p className={styles.description}><strong>{username}</strong> さんの次回作も楽しみです！</p>

              <div className={styles.modalDivider} />
            </div>
          </div>
        </section>
      </main>
        <footer>
          <div className={styles.footerGrass} role="contentinfo" aria-label="footer grass">
              {Array.from({ length: 30 }).map((_, i) => {
                const grown = !loading && i < Math.min(30, Math.max(0, streakDays));
                return (
                  <img
                    key={i}
                    src="/images/grass.png"
                    className={`${styles.grassImg} ${grown ? styles.grown : ''}`}
                    alt=""
                    aria-hidden
                    style={{ animationDelay: `${(i % 6) * 80}ms` }}
                  />
                );
              })}
            </div>
          </footer>
    </>
  );
}

export default function HomeWrapper() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}