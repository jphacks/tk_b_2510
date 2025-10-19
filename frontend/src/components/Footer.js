import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '12px' }}>
        &copy; {new Date().getFullYear()} My Emolog Website. All rights reserved.
      </p>
    </footer>
  );
}