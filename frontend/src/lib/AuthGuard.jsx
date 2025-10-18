"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        // まず Supabase のセッションを取得
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.warn("supabase getSession error:", error.message);
        }

        // セッションがなければ localStorage のアクセストークンを確認
        if (!session) {
          const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
          if (token) {
            // トークンがあれば supabase.auth.setAuth() 相当の手続きは不要（supabase-js v2 はクライアントが自動で扱う）
            // ここでは token があることで認証済みとみなす (簡易フォールバック)
            if (mounted) setChecking(false);
            return;
          }

          // 存在しない場合は login へリダイレクト
          router.push("/login");
        } else {
          if (mounted) setChecking(false);
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    }

    check();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
