import './globals.css'; // グローバルなスタイルをインポート (必要に応じて)
import Footer from '../components/Footer'; // 作成したFooterコンポーネントをインポート

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <main>
          {children} {/* 各ページのコンテンツがここにレンダリングされる */}
        </main>
        <Footer /> {/* 全てのページで共通のフッターを配置 */}
      </body>
    </html>
  );
}