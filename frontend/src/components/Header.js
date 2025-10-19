import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ background: '#eeaee9', padding: '18px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            margin: 0,
            fontSize: '56px',
            lineHeight: 1,
            color: '#ff4e8a',
            fontWeight: 800,
            fontFamily: 'Georgia, serif'
          }}>
            Emolog
          </h1>
        </Link>
      </div>
    </header>
  );
}
