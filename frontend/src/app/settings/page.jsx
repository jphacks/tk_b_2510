// page.jsx

'use client'; 

import React from 'react';
import './page.css'; // CSSファイルをインポート
import AuthGuard from '../../lib/AuthGuard';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// 歯車アイコン
const SettingsIcon = ({ onClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    // スタイルをclassNameに置き換え
    const className = `settings-icon ${isHovered ? 'settings-icon-hover' : ''}`;

    const handleClick = (e) => {
        e.preventDefault();
        onClick();
    };

    return (
        <a 
            href="#" 
            className={className} 
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

    const handleLogout = async () => {
        if (confirm('本当にログアウトしますか？')) {
            try {
                // 1. Supabaseからログアウト
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                // 2. localStorageのアクセストークンを削除 (AuthGuardでフォールバックとして使っているため)
                localStorage.removeItem('access_token');

                // 3. ログインページへリダイレクト
                router.push('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                alert(`ログアウトに失敗しました: ${error.message}`);
            }
        }
    };
    // -----------------------------------

    return (
        <div className="content-container">
            <h2 className="settings-title">設定</h2>
            
            <button 
                className="edit-button"
                style={{marginBottom: '20px'}} // インラインスタイルは必要な最小限に
                onClick={onGoBack}
            >
                ← プロフィールに戻る
            </button>

            <div>
                {/* パスワード変更 */}
                <div className="settings-item">
                    <h3>パスワード変更</h3>
                    <p>安全のため、定期的にパスワードを変更してください。</p>
                    
                    {/* フォーム表示/非表示ボタン */}
                    <button 
                        className="settings-button"
                        onClick={() => setIsChangingPassword(prev => !prev)}
                    >
                        {isChangingPassword ? 'キャンセル' : '変更'}
                    </button>

                    {/* パスワード変更フォーム */}
                    {isChangingPassword && (
                        <div className="password-change-form">
                            <div className="form-group">
                                <label>現在のパスワード:</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>新しいパスワード:</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>新しいパスワード（確認）:</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    className="form-input"
                                />
                            </div>
                            
                            <button 
                                className="save-button" 
                                onClick={handlePasswordUpdate}
                            >
                                パスワードを更新
                            </button>
                        </div>
                    )}
                </div>

                {/* 通知設定 */}
                <div className="settings-item">
                    <h3>通知設定</h3>
                    <p>メール通知やプッシュ通知のオン/オフを設定します。</p>
                    <label className="settings-checkbox-label">
                        <input type="checkbox" defaultChecked /> メール通知を受け取る
                    </label>
                </div>
                
                {/* --- 変更4: ログアウト項目を追加 --- */}
                <div className="settings-item">
                    <h3>ログアウト</h3>
                    <p>現在のセッションからサインアウトします。</p>
                    <button 
                        className="settings-danger-button" // 危険な操作ボタンのスタイルを再利用
                        onClick={handleLogout}
                    >
                        ログアウト
                    </button>
                </div>
                {/* ---------------------------------- */}

                {/* アカウント削除 */}
                <div className="settings-item" style={{borderBottom: 'none'}}>
                    <h3>アカウント削除</h3>
                    <p>アカウントを完全に削除します。</p>
                    <button 
                        className="settings-danger-button"
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
        bio: '写真を撮るのが好きです。旅行とグルメが趣味です。🌍🍜',
        photoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });
    const [isEditing, setIsEditing] = React.useState(false);
    const [view, setView] = React.useState('profile');
    const fileInputRef = React.useRef(null);

    // bodyBaseスタイルはCSSのbodyタグに適用されているため、このdivは不要、
    // あるいはCSSで定義された中央揃えのためのトップレベルdivとして機能します。
    // スタイルオブジェクトから取り出した`bodyBase`は不要ですが、中央揃えのために残します。
    const bodyStyle = {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    }; 
    // ※ Next.js/Create React Appなどの環境によっては、
    // 外部CSSのbodyスタイルが適用されるため、このdivは通常不要です。
    // 今回は中央揃えのラッパーとして利用し、CSSのbodyスタイルと連携させます。

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
            <div className="content-container">
                <SettingsIcon onClick={() => setView('settings')} />

                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    onClick={(e) => e.currentTarget.value = null} 
                    style={{ display: 'none' }} 
                />

                <div className="profile-header">
                    <div className="profile-photo-area">
                        <img 
                            src={profile.photoUrl} 
                            alt="プロフィール写真" 
                            className="profile-photo" 
                            title="プロフィール写真" 
                        />
                        {showCameraIcon && <span className="camera-icon">📸</span>}
                    </div>

                    <div className="profile-info-area">
                        <div className="user-actions">
                            <h2 className="username">{profile.username}</h2>
                            <button 
                                className="edit-button" 
                                onClick={() => setIsEditing(true)}
                            >
                                プロフィールを編集
                            </button>
                        </div>
                        <p className="bio-text">{profile.bio}</p>
                    </div>
                </div>

                {isEditing && (
                    <div className="edit-form">
                        <h3>プロフィール編集</h3>
                        <div className="form-group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                <img 
                                    src={profile.photoUrl} 
                                    alt="現在のプロフィール写真" 
                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <button 
                                    type="button" 
                                    className="photo-edit-button"
                                    onClick={handlePhotoUploadTrigger}
                                >
                                    プロフィール写真を変更
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>ユーザーネーム:</label>
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>自己紹介:</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleInputChange}
                                rows="3"
                                className="form-input form-textarea"
                            />
                        </div>

                        <button className="save-button" onClick={handleSave}>保存</button>
                        <button 
                            type="button"
                            className="edit-button" 
                            style={{marginLeft: '10px'}} 
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

export default function SettingsWrapper() {
  return (
    <AuthGuard>
      <MyProfile />
    </AuthGuard>
  );
}