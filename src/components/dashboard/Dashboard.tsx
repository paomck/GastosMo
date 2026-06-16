'use client';
import { useState } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTransactions } from '@/lib/useTransactions';
import { useUserSettings } from '@/lib/useUserSettings';
import type { CardId } from '@/lib/cards';
import { LayoutDashboard, CreditCard, BarChart3, LogOut, User } from 'lucide-react';

import BestCardCalculator from './BestCardCalculator';
import WalletHUD from './WalletHUD';
import LootTracker from './LootTracker';
import RecentTransactions from './RecentTransactions';
import TransactionsView from './TransactionsView';
import CardsView from './CardsView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';
import AddTransactionDialog from './AddTransactionDialog';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { deleteTransaction, type Transaction } from '@/lib/firestore';

interface DashboardProps {
  onGoToLanding?: () => void;
}

export default function Dashboard({ onGoToLanding }: DashboardProps) {
  const { user, logout } = useAuth();
  const { all, thisMonth, stats, loading: txLoading } = useTransactions(user?.uid || '');
  const { settings, loading: settingsLoading, saveCardConfigs } = useUserSettings(user?.uid || '');
  
  const loading = txLoading || settingsLoading;
  const [currentView, setCurrentView] = useState<'dashboard' | 'cards' | 'analytics' | 'transactions' | 'settings'>('dashboard');
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deletingTxn, setDeletingTxn] = useState<Transaction | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 
  if (loading) return <LoadingScreen />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.displayName 
      ? user.displayName.split(' ')[0] 
      : user?.email 
        ? user.email.split('@')[0] 
        : 'Captain';
    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 17) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };
 
  const handleDelete = async () => {
    if (deletingTxn?.id) {
      await deleteTransaction(deletingTxn.id);
      setDeletingTxn(null);
    }
  };
 
  return (
    <div className={styles.page}>
      {/* Mobile Top Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileLogo} onClick={onGoToLanding} style={{ cursor: 'pointer' }}>
          <span className={styles.logoMark}>G</span>
          <span className={styles.logoText}>astosMo</span>
        </div>
        <button className={styles.mobileLogoutBtn} onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={18} />
        </button>
      </div>
 
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo} onClick={onGoToLanding} style={{ cursor: 'pointer' }}>
          <span className={styles.logoMark}>G</span>
          <span className={styles.logoText}>astosMo</span>
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${currentView === 'dashboard' ? styles.active : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            className={`${styles.navItem} ${currentView === 'cards' ? styles.active : ''}`}
            onClick={() => setCurrentView('cards')}
          >
            <CreditCard size={18} />
            My Cards
          </button>
          <button 
            className={`${styles.navItem} ${currentView === 'analytics' ? styles.active : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button 
            className={`${styles.navItem} ${currentView === 'settings' ? styles.active : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <User size={18} />
            Profile & Settings
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="animate-fade-up">
            <h1 className={styles.greeting}>
              {currentView === 'dashboard' ? getGreeting() : 
               currentView === 'cards' ? 'Card Management' : 
               currentView === 'analytics' ? 'The Treasury Report' : 
               currentView === 'settings' ? 'Command Center' : 'Transactions Ledger'}
            </h1>
            <p className={styles.subGreeting}>
              {currentView === 'dashboard' ? 'Maximize every swipe with intelligent multi-card tracking.' :
               currentView === 'cards' ? 'Configure your card limits, statement dates, and reward tiers.' :
               currentView === 'analytics' ? 'Analyze your spending efficiency and rebate performance.' :
               currentView === 'settings' ? 'Manage your profile, security, and data preferences.' :
               'Review your full ledger with high-efficiency cursor pagination.'}
            </p>
          </div>
        </header>

        <div className={styles.contentGrid}>
          {currentView === 'dashboard' && (
            <>
              {/* Station 1: Best Card Calculator */}
              <section className={styles.station}>
                <BestCardCalculator 
                  ewRebateEarned={stats.ewRebate} 
                  userLimits={settings.cardConfigs || {}}
                />
              </section>

              <div className={styles.mainRow}>
                {/* Station 2: Fleet Status */}
                <div className={styles.leftCol}>
                  <WalletHUD 
                    stats={stats} 
                    onSelectCard={(id) => setSelectedCardId(id === selectedCardId ? null : id)} 
                    activeCardId={selectedCardId || undefined}
                    userLimits={settings.cardConfigs || {}}
                    paidCycles={settings.paidCycles || {}}
                    onUpdatePaidCycles={async (newPaidCycles) => {
                      if (user?.uid) {
                        const { updateUserSettings } = await import('@/lib/firestore');
                        await updateUserSettings(user.uid, { paidCycles: newPaidCycles });
                      }
                    }}
                  />
                </div>

                <div className={styles.rightCol}>
                  <div className={styles.stickyCol}>
                    {/* Station 3: Loot Tracker */}
                    <section className={styles.station}>
                      <LootTracker monthlyRebate={stats.ewRebate} lifetimeRebate={stats.lifetimeRebate} />
                    </section>

                    <section className={styles.station} style={{ marginTop: '2.5rem' }}>
                      <RecentTransactions 
                        userId={user?.uid || ''}
                        selectedCardId={selectedCardId}
                        allTransactions={all}
                        onClearFilter={() => setSelectedCardId(null)}
                        onEdit={setEditingTxn}
                        onDelete={setDeletingTxn}
                        ewRebateEarned={stats.ewRebate}
                        onViewAll={() => setCurrentView('transactions')}
                        userLimits={settings.cardConfigs || {}}
                        paidCycles={settings.paidCycles || {}}
                        onUpdatePaidCycles={async (newPaidCycles) => {
                          if (user?.uid) {
                            const { updateUserSettings } = await import('@/lib/firestore');
                            await updateUserSettings(user.uid, { paidCycles: newPaidCycles });
                          }
                        }}
                      />
                    </section>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === 'cards' && (
            <div className="animate-fade-up">
              <CardsView 
                userId={user?.uid || ''} 
                userLimits={settings.cardConfigs || {}} 
                onSaveLimits={saveCardConfigs}
                transactions={all}
              />
            </div>
          )}
          {currentView === 'analytics' && <AnalyticsView stats={stats} transactions={all} />}
          {currentView === 'settings' && (
            <div className="animate-fade-up">
              <SettingsView 
                transactions={all}
                userId={user?.uid || ''}
                userLimits={settings.cardConfigs || {}}
              />
            </div>
          )}
          {currentView === 'transactions' && (
            <div className="animate-fade-up">
              <TransactionsView 
                userId={user?.uid || ''}
                allTransactions={all}
                onEdit={setEditingTxn}
                onDelete={setDeletingTxn}
                ewRebateEarned={stats.ewRebate}
                userLimits={settings.cardConfigs || {}}
                paidCycles={settings.paidCycles || {}}
                onUpdatePaidCycles={async (newPaidCycles) => {
                  if (user?.uid) {
                    const { updateUserSettings } = await import('@/lib/firestore');
                    await updateUserSettings(user.uid, { paidCycles: newPaidCycles });
                  }
                }}
              />
            </div>
          )}
        </div>

        {currentView === 'dashboard' && (
          <AddTransactionDialog 
            userId={user?.uid || ''} 
            ewRebateEarned={stats.ewRebate} 
            userLimits={settings.cardConfigs || {}}
          />
        )}

        {/* Lifted Modals */}
        {editingTxn && (
          <AddTransactionDialog
            userId={user?.uid || ''}
            ewRebateEarned={stats.ewRebate}
            initialTransaction={editingTxn}
            onClose={() => setEditingTxn(null)}
            userLimits={settings.cardConfigs || {}}
          />
        )}

        {deletingTxn && (
          <DeleteConfirmModal
            isOpen={!!deletingTxn}
            onClose={() => setDeletingTxn(null)}
            onConfirm={handleDelete}
            merchant={deletingTxn.merchant}
            amount={deletingTxn.amount}
          />
        )}

        {showLogoutConfirm && (
          <div className={styles.confirmOverlay} onClick={() => setShowLogoutConfirm(false)}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.confirmTitle}>Confirm Sign Out</h3>
              <p className={styles.confirmText}>Are you sure you want to sign out of GastosMo?</p>
              <div className={styles.confirmActions}>
                <button className={styles.logoutConfirmBtn} onClick={logout}>
                  Sign Out
                </button>
                <button className={styles.cancelConfirmBtn} onClick={() => setShowLogoutConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
