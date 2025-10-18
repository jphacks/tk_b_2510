// /tkb/frontend/lib/supabaseClient.js (例)
import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_プレフィックスを付けて定義した環境変数を参照する
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が取得できなかった場合にエラーを投げる処理
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables! Check .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
