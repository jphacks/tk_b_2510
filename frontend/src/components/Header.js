import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ background: '#eeaee9', padding: '12px 18px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              margin: 0,
              fontSize: '40px',
              lineHeight: 1,
              color: '#ff4e8a',
              fontWeight: 800,
              fontFamily: 'Georgia, serif'
            }}>
              Emolog
            </h1>
          </Link>
        </div>

        <nav>
          <Link href="/" style={{ margin: '0 10px' }}>Welcome</Link>
          <Link href="/login" style={{ margin: '0 10px' }}>Logon/Login</Link>
          <Link href="/user-home" style={{ margin: '0 10px' }}>UserHome</Link>
          <Link href="/post" style={{ margin: '0 10px' }}>Post</Link>
          <Link href="/diary" style={{ margin: '0 10px' }}>Diary</Link>
          <Link href="/settings" style={{ margin: '0 10px' }}>Settings</Link>

        </nav>
      </div>
    </header>
  );
}
