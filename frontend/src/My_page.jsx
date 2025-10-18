import React from 'react';

// スタイルオブジェクトの定義
// CSSと異なり、プロパティ名はキャメルケース (例: backgroundColor) になります。
const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    padding: 0,
    backgroundColor: '#fafafa',
    color: '#262626',
  },
  container: {
    maxWidth: '935px',
    margin: '0 auto',
    padding: '20px',
    position: 'relative', // ⚙️ 歯車アイコンの配置基準
  },
  settingsIcon: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '24px',
    color: '#262626',
    textDecoration: 'none',
    cursor: 'pointer',
    zIndex: 10,
  },
  settingsIconHover: {
    color: '#8e8e8e',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '44px',
    paddingTop: '10px',
  },
  profilePhotoArea: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    paddingRight: '30px',
  },
  profilePhoto: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#dbdbdb',
    border: '1px solid #ccc',
  },
  profileInfoArea: {
    flex: 2,
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  username: {
    fontSize: '28px',
    fontWeight: 300,
    marginRight: '20px',
  },
  editButton: {
    backgroundColor: '#efefef',
    color: '#262626',
    border: '1px solid #dbdbdb',
    borderRadius: '4px',
    padding: '5px 12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    // ボタンのデフォルトのborder/outlineをリセット（必要に応じて）
    outline: 'none',
  },
  bioName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  bioText: {
    fontSize: '16px',
  },
};

// 歯車アイコンのホバー状態を管理するための状態を簡易的に定義します
const SettingsIcon = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const iconStyle = {
    ...styles.settingsIcon,
    ...(isHovered ? styles.settingsIconHover : {}),
  };

  // 実際には history.push('/settings') などを使いますが、ここではプレースホルダとしています
  const handleClick = () => {
    alert('設定ページへ移動します (settings.html)');
    // window.location.href = 'settings.html';
  };

  return (
    <a 
      href="settings.html" 
      style={iconStyle} 
      title="設定"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      ⚙️
    </a>
  );
};

// メインコンポーネント
const MyProfile = () => {
  // スタイルを<body>に適用するためにラッパーを用意
  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {/* ⚙️ 歯車アイコン（設定）の追加 */}
        <SettingsIcon />

        {/* プロフィールヘッダー */}
        <div style={styles.profileHeader}>
          <div style={styles.profilePhotoArea}>
            <div style={styles.profilePhoto} title="プロフィール写真"></div>
          </div>
          <div style={styles.profileInfoArea}>
            <div style={styles.userActions}>
              <h2 style={styles.username}>user_name_42</h2>
              
              {/* 編集ボタン */}
              <button 
                style={styles.editButton} 
                onClick={() => alert('プロフィール編集画面へ移動します')}
              >
                プロフィールを編集
              </button>
            </div>
            
            <p style={styles.bioName}>ユーザー 太郎</p>
            <p style={styles.bioText}>写真を撮るのが好きです。旅行とグルメが趣味。🌍🍜</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

// ------------------------------------------
// (このコンポーネントをブラウザで表示するためのコード例 - 実行環境によって異なります)
/*
// 例: index.js または App.js
import React from 'react';
import ReactDOM from 'react-dom';
import MyProfile from './MyProfile'; // MyProfileコンポーネントをインポート

ReactDOM.render(<MyProfile />, document.getElementById('root'));
*/