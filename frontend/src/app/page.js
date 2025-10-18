import Link from 'next/link';
import { appRoutes } from '../routes'; // 作成したファイルパスに応じて調整

export default function Home() {
  return (
    <div>
      <h1>🚀 アプリケーション ルート一覧</h1>
      <ul>
        {appRoutes.map((route) => (
          <li key={route.path}>
            <Link href={route.path}>
              {route.name} ({route.path})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}