'use client'; 

import React from 'react';
import AuthGuard from '../../lib/AuthGuard';

// スタイルオブジェクトの定義
const styles = {
  // ⭐️ 修正: bodyBaseを画面全体をカバーし、コンテンツを中央に配置するFlexコンテナとして調整
  bodyBase: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    padding: 0,
    backgroundColor: '#fafafa',
    color: '#262626',
    minHeight: '100vh',
    display: 'flex',            // Flexboxを有効化
    justifyContent: 'center',   // 左右中央寄せ
    alignItems: 'center',       // 上下中央寄せ
  },
  // ⭐️ 修正: contentContainerのmaxWidthを1200pxに拡大
  contentContainer: {
    maxWidth: '1200px', // 935pxから1200pxに拡大
    width: '100%',
    margin: '0 auto',  
    padding: '20px',
    position: 'relative',
    // 中央寄せは親のbodyBaseに任せるため、margin: '0 auto'は残しつつ、
    // 中央に固定されたブロック要素として振る舞う
    flexShrink: 0, // 縮小を防ぐ
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
    objectFit: 'cover',
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
    outline: 'none',
  },
  bioName: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  bioText: {
    fontSize: '16px',
  },
  editForm: {
    padding: '20px',
    border: '1px solid #dbdbdb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #dbdbdb',
    boxSizing: 'border-box',
    marginTop: '5px',
  },
  saveButton: {
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  photoEditButton: {
    backgroundColor: '#fff',
    color: '#0095f6',
    border: '1px solid #0095f6',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
    marginBottom: '15px',
  },
  
  settingsTitle: {
    fontSize: '26px',
    fontWeight: 300,
    marginBottom: '30px',
    borderBottom: '1px solid #dbdbdb',
    paddingBottom: '10px',
  },
  settingsItem: {
    padding: '15px 0',
    borderBottom: '1px solid #efefef',
  },
  settingsItemH3: {
    fontSize: '18px',
    marginBottom: '5px',
    marginTop: 0,
  },
  settingsItemP: {
    fontSize: '14px',
    color: '#8e8e8e',
    marginBottom: '10px',
  },
  settingsButton: {
    backgroundColor: '#0095f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
  settingsDangerButton: {
    backgroundColor: 'transparent',
    color: 'red',
    border: '1px solid red',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
  settingsCheckboxLabel: {
    display: 'block',
    marginTop: '10px',
    fontSize: '14px',
  }
};

// 歯車アイコンのコンポーネント (変更なし)
const SettingsIcon = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false); 
  const iconStyle = {
    ...styles.settingsIcon,
    ...(isHovered ? styles.settingsIconHover : {}),
  };

  const handleClick = (e) => {
    e.preventDefault(); 
    onClick(); 
  };

  return (
    <a 
      href="#" 
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

// 設定画面コンポーネント
const SettingsPage = ({ onGoBack }) => {
  return (
    <div style={styles.contentContainer}>
      <h2 style={styles.settingsTitle}>設定とプライバシー</h2>
      
      <button 
        style={{...styles.editButton, marginBottom: '20px'}}
        onClick={onGoBack}
      >
        ← プロフィールに戻る
      </button>

      <div>
        {/* パスワード変更 */}
        <div style={styles.settingsItem}>
          <h3 style={styles.settingsItemH3}>パスワード変更</h3>
          <p style={styles.settingsItemP}>安全のため、定期的にパスワードを変更してください。</p>
          <button 
            style={styles.settingsButton}
            onClick={() => alert('パスワード変更フォームへ移動')}
          >
            変更
          </button>
        </div>

        {/* 通知設定 */}
        <div style={styles.settingsItem}>
          <h3 style={styles.settingsItemH3}>通知設定</h3>
          <p style={styles.settingsItemP}>メール通知やプッシュ通知のオン/オフを設定します。</p>
          <label style={styles.settingsCheckboxLabel}>
            <input type="checkbox" defaultChecked /> メール通知を受け取る
          </label>
        </div>
        
        {/* プライバシー設定 */}
        <div style={styles.settingsItem}>
          <h3 style={styles.settingsItemH3}>プライバシー設定</h3>
          <p style={styles.settingsItemP}>投稿の公開範囲などを設定します。</p>
          <button 
            style={styles.settingsButton}
            onClick={() => alert('プライバシー設定ページへ移動')}
          >
            設定
          </button>
        </div>
        
        {/* アカウント削除 */}
        <div style={{...styles.settingsItem, borderBottom: 'none'}}>
          <h3 style={styles.settingsItemH3}>アカウント削除</h3>
          <p style={styles.settingsItemP}>アカウントを完全に削除します。</p>
          <button 
            style={styles.settingsDangerButton}
            onClick={() => confirm('本当にアカウントを削除しますか？')}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
};


// メインコンポーネント (MyProfile)
const MyProfile = () => {
  const [profile, setProfile] = React.useState({
    username: 'user_name_42',
    name: 'ユーザー 太郎',
    bio: '写真を撮るのが好きです。旅行とグルメが趣味。🌍🍜',
    photoUrl: 'https://via.placeholder.com/150/d3d3d3/000000?text=P+P',
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [view, setView] = React.useState('profile'); // 'profile' or 'settings'

  const fileInputRef = React.useRef(null);

  // 画面全体の背景と中央寄せのスタイル
  const bodyStyle = styles.bodyBase;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSave = () => {
    alert('プロフィールを保存しました！');
    setIsEditing(false);
  };
  
  const handlePhotoUploadTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      
      setProfile(prevProfile => ({
        ...prevProfile,
        photoUrl: newUrl,
      }));
      
      alert(`ファイル ${file.name} を選択しました。表示を更新します。`);
    }
  };
  
  // 画面レンダリングの分岐
  if (view === 'settings') {
    return (
      <div style={bodyStyle}>
        <SettingsPage onGoBack={() => setView('profile')} />
      </div>
    );
  }

  // view === 'profile' の場合、プロフィール画面をレンダリング
  return (
    // 画面全体をカバーし、コンテンツを中央に配置する
    <div style={bodyStyle}>
      {/* 最大幅1200pxの中央寄せコンテンツコンテナ */}
      <div style={styles.contentContainer}>
        
        {/* ⚙️ 歯車アイコン（設定）の追加 - クリックで画面切り替え */}
        <SettingsIcon onClick={() => setView('settings')} />

        {/* 隠されたファイルアップロードのInput要素 */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          onClick={(e) => e.currentTarget.value = null} 
          style={{ display: 'none' }} 
        />

        {/* プロフィールヘッダー */}
        <div style={styles.profileHeader}>
          <div style={styles.profilePhotoArea}>
            <img 
              src={profile.photoUrl} 
              alt="プロフィール写真" 
              style={styles.profilePhoto} 
              title="プロフィール写真" 
            />
          </div>
          <div style={styles.profileInfoArea}>
            <div style={styles.userActions}>
              <h2 style={styles.username}>{profile.username}</h2> 
              
              <button 
                style={styles.editButton} 
                onClick={() => setIsEditing(true)}
              >
                プロフィールを編集
              </button>
            </div>
            
            <p style={styles.bioName}>{profile.name}</p>
            <p style={styles.bioText}>{profile.bio}</p>
          </div>
        </div>

        {/* ------------------------------------------ */}
        {/* 編集フォーム */}
        {isEditing && (
          <div style={styles.editForm}>
            <h3>プロフィール編集</h3>
            
            <div style={styles.formGroup}>
              <label>プロフィール写真:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <img 
                  src={profile.photoUrl} 
                  alt="現在のプロフィール写真" 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <button 
                  type="button" 
                  style={styles.photoEditButton}
                  onClick={handlePhotoUploadTrigger} 
                >
                  プロフィール写真を変更
                </button>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label>ユーザーネーム:</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>名前:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>自己紹介:</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows="3"
                style={{...styles.input, resize: 'vertical'}}
              />
            </div>
            
            <button 
              style={styles.saveButton} 
              onClick={handleSave}
            >
              保存
            </button>
            <button 
              type="button"
              style={{...styles.editButton, marginLeft: '10px'}} 
              onClick={() => setIsEditing(false)}
            >
              キャンセル
            </button>
          </div>
        )}
        {/* ------------------------------------------ */}

      </div>
    </div>
  );
};

export default function SettingsWrapper() {
  return (
    <AuthGuard>
      <MyProfile />
    </AuthGuard>
  );
}