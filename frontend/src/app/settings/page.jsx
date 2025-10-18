'use client'; 

import React from 'react';

// スタイルオブジェクトの定義
const styles = {
  bodyBase: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    padding: 0,
    backgroundColor: '#ffffff',
    color: '#262626',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    flexShrink: 0,
    border: '6px solid #80deea',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
    position: 'relative',
  },
  profilePhoto: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#dbdbdb',
    border: '1px solid #ccc',
    objectFit: 'cover',
    zIndex: 1,
  },
  cameraIcon: {
    position: 'absolute',
    top: '45%',
    left: '41.5%',
    transform: 'translate(-50%, -50%)',
    fontSize: '60px',
    color: '#00bcd4',
    zIndex: 2,
    pointerEvents: 'none',
  },
  profileInfoArea: {
    flex: 2,
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    minHeight: '40px',
  },
  username: {
    fontSize: '28px',
    fontWeight: 300,
    marginRight: '20px',
    alignSelf: 'center',
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
    alignSelf: 'center',
  },
  bioName: {
    display: 'none',
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
    marginTop: '0',
    marginBottom: '0',
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
  },
  // パスワード変更フォームのスタイル
  passwordChangeForm: {
    marginTop: '15px',
    padding: '15px',
    border: '1px solid #dbdbdb',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
};

// 歯車アイコン
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

// 設定画面コンポーネント（パスワード変更フォーム追加）
const SettingsPage = ({ onGoBack }) => {
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      alert('全てのフィールドを入力してください。');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert('新しいパスワードが一致しません。');
      return;
    }

    // ここで実際のAPIコールなどを行う（今回はシミュレーション）
    console.log('パスワード更新リクエスト:', passwordData);
    alert('パスワードが正常に更新されました！');

    // フォームをリセットして非表示にする
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setIsChangingPassword(false);
  };

  return (
    <div style={styles.contentContainer}>
      <h2 style={styles.settingsTitle}>設定</h2>
      
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
          
          {/* フォーム表示/非表示ボタン */}
          <button 
            style={styles.settingsButton}
            onClick={() => setIsChangingPassword(prev => !prev)}
          >
            {isChangingPassword ? 'キャンセル' : '変更'}
          </button>

          {/* パスワード変更フォーム */}
          {isChangingPassword && (
            <div style={styles.passwordChangeForm}>
              <div style={styles.formGroup}>
                <label>現在のパスワード:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>新しいパスワード:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>新しいパスワード（確認）:</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  style={styles.input}
                />
              </div>
              
              <button 
                style={styles.saveButton} 
                onClick={handlePasswordUpdate}
              >
                パスワードを更新
              </button>
            </div>
          )}
        </div>

        {/* 通知設定 */}
        <div style={styles.settingsItem}>
          <h3 style={styles.settingsItemH3}>通知設定</h3>
          <p style={styles.settingsItemP}>メール通知やプッシュ通知のオン/オフを設定します。</p>
          <label style={styles.settingsCheckboxLabel}>
            <input type="checkbox" defaultChecked /> メール通知を受け取る
          </label>
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

// メインコンポーネント
const MyProfile = () => {
  const [profile, setProfile] = React.useState({
    username: 'user_name',
    bio: '写真を撮るのが好きです。旅行とグルメが趣味。🌍🍜',
    photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [view, setView] = React.useState('profile');
  const fileInputRef = React.useRef(null);

  const bodyStyle = styles.bodyBase;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('プロフィールを保存しました！');
    setIsEditing(false);
  };

  const handlePhotoUploadTrigger = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, photoUrl: newUrl }));
      alert(`ファイル ${file.name} を選択しました。表示を更新します。`);
    }
  };

  if (view === 'settings') {
    return (
      <div style={bodyStyle}>
        <SettingsPage onGoBack={() => setView('profile')} />
      </div>
    );
  }

  const showCameraIcon = profile.photoUrl.includes('data:image/png');

  return (
    <div style={bodyStyle}>
      <div style={styles.contentContainer}>
        <SettingsIcon onClick={() => setView('settings')} />

        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          onClick={(e) => e.currentTarget.value = null} 
          style={{ display: 'none' }} 
        />

        <div style={styles.profileHeader}>
          <div style={styles.profilePhotoArea}>
            <img 
              src={profile.photoUrl} 
              alt="プロフィール写真" 
              style={styles.profilePhoto} 
              title="プロフィール写真" 
            />
            {showCameraIcon && <span style={styles.cameraIcon}>📸</span>}
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
            <p style={styles.bioText}>{profile.bio}</p>
          </div>
        </div>

        {isEditing && (
          <div style={styles.editForm}>
            <h3>プロフィール編集</h3>
            <div style={styles.formGroup}>
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
              <label>自己紹介:</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows="3"
                style={{...styles.input, resize: 'vertical'}}
              />
            </div>

            <button style={styles.saveButton} onClick={handleSave}>保存</button>
            <button 
              type="button"
              style={{...styles.editButton, marginLeft: '10px'}} 
              onClick={() => setIsEditing(false)}
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;