'use client';
import { useState } from 'react';
import styles from './SettingsView.module.css';
import { useAuth } from '@/components/auth/AuthProvider';
import { User, Lock, Eye, EyeOff, Mail, Download } from 'lucide-react';
import type { Transaction } from '@/lib/firestore';

interface SettingsViewProps {
  transactions: Transaction[];
}

export default function SettingsView({ transactions }: SettingsViewProps) {
  const { user, updateProfileName, updateUserPassword } = useAuth();
  
  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfileName(displayName.trim());
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: (err as Error).message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      setPasswordMsg({ type: 'error', text: (err as Error).message || 'Failed to update password. Check your current password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!transactions.length) return;
    
    // Create CSV headers
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Card', 'Rebate/Points Earned'];
    
    // Create CSV rows
    const rows = transactions.map(t => [
      t.date.toDate().toISOString().split('T')[0],
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.cardId,
      t.cardId === 'eastwest' ? t.rebateEarned : t.pointsEarned
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gastosmo_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      {/* Profile Section */}
      <section className={`glass-card ${styles.section}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Profile Settings</h2>
          <p className={styles.subtitle}>Update your command center identity.</p>
        </div>

        <form className={styles.form} onSubmit={handleProfileSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                type="email" 
                className={styles.input} 
                value={user?.email || ''} 
                disabled 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Display Name</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input} 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Captain"
              />
            </div>
          </div>

          {profileMsg && (
            <div className={profileMsg.type === 'error' ? styles.errorMsg : styles.successMsg}>
              {profileMsg.text}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={profileLoading || displayName === user?.displayName}>
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>

      {/* Security Section */}
      <section className={`glass-card ${styles.section}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Security</h2>
          <p className={styles.subtitle}>Update your password to keep your data secure.</p>
        </div>

        {/* Only show password form if user logged in with email/password (has email) */}
        {user?.providerData.some(p => p.providerId === 'password') ? (
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Current Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input 
                  type={showCurrentPassword ? 'text' : 'password'} 
                  className={styles.input} 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input 
                  type={showNewPassword ? 'text' : 'password'} 
                  className={styles.input} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {passwordMsg && (
              <div className={passwordMsg.type === 'error' ? styles.errorMsg : styles.successMsg}>
                {passwordMsg.text}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <p className={styles.subtitle} style={{ color: 'var(--text-primary)' }}>
            Your account is managed via an external provider (e.g. Google). Password changes are disabled.
          </p>
        )}
      </section>

      {/* Data Management Section */}
      <section className={`glass-card ${styles.section}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Data Management</h2>
          <p className={styles.subtitle}>Export your transaction data for external analysis.</p>
        </div>
        
        <button className={styles.exportBtn} onClick={handleExportCSV} disabled={transactions.length === 0}>
          <Download size={16} />
          Export {transactions.length} Transactions (CSV)
        </button>
      </section>
    </div>
  );
}
