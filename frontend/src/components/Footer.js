import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
      <nav>
        <Link href="/" style={{ margin: '0 10px' }}>
          index Page
        </Link>
        <Link href="/login" style={{ margin: '0 10px' }}>
            ログイン
        </Link>
        <Link href="/photo" style={{ margin: '0 10px' }}>
            投稿ページ
        </Link>
        <Link href="/settings" style={{ margin: '0 10px' }}>
            設定ページ
        </Link>
        <Link href="/diary" style={{ margin: '0 10px' }}>
            日記ページ
        </Link>
        <Link href="/home" style={{ margin: '0 10px' }}>
            ホーム
        </Link>
        {/* 他のページリンクもここに追加 */}
      </nav>
      <p style={{ marginTop: '10px', fontSize: '12px' }}>
        &copy; {new Date().getFullYear()} My Next.js App
      </p>
    </footer>
  );
}