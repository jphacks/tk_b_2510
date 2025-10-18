import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
      <nav>
        <Link href="/" style={{ margin: '0 10px' }}>
          ホーム
        </Link>
        <Link href="/login" style={{ margin: '0 10px' }}>
          ログイン
        </Link>
        <Link href="/home" style={{ margin: '0 10px' }}>
          マイページ
        </Link>
        <Link href="/photo" style={{ margin: '0 10px' }}>
          投稿
        </Link>
        <Link href="/settings" style={{ margin: '0 10px' }}>
          設定
        </Link>
        {/* 他のページリンクもここに追加 */}
      </nav>
      <p style={{ marginTop: '10px', fontSize: '12px' }}>
        &copy; {new Date().getFullYear()} My Next.js App
      </p>
    </footer>
  );
}