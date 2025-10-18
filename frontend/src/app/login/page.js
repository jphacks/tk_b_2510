"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email) return "メールアドレスを入力してください";
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(email)) return "有効なメールアドレスを入力してください";
    if (!password) return "パスワードを入力してください";
    if (password.length < 6) return "パスワードは6文字以上で入力してください";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "ログインに失敗しました");
      }

      const data = await res.json();
      // 受け取ったトークンを localStorage に保存
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        // 簡易的にホームへリダイレクト
        window.location.href = "/";
      } else {
        throw new Error("トークンが返却されませんでした");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "ログイン中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>ログイン</h1>

        <label className={styles.label} htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <label className={styles.label} htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
        />

        {error && <div role="alert" className={styles.error}>{error}</div>}

        <button
          className={styles.button}
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          aria-busy={loading}
        >
          {loading ? "送信中..." : "ログイン"}
        </button>

        <div className={styles.footer}>
          <button type="button" className={styles.link} onClick={() => alert('仮のパスワード再発行リンク')}>パスワードを忘れた場合</button>
        </div>
      </form>
    </div>
  );
}
