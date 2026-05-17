'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import styles from './Navbar.module.css';

interface NavbarProps {
  onGoToDashboard?: () => void;
}

export default function Navbar({ onGoToDashboard }: NavbarProps) {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoMark}>G</span>
            <span className={styles.logoText}>astosMo</span>
          </div>

          {/* Right side */}
          <div className={styles.actions}>
            {user ? (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-ghost" onClick={logout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Sign Out
                </button>
                {onGoToDashboard && (
                  <button className="btn-primary" onClick={onGoToDashboard} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                    Dashboard
                  </button>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                className="btn-primary"
                style={{ padding: '10px 26px', fontSize: '0.875rem' }}
                onClick={() => setModalOpen(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
