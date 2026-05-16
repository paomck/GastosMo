'use client';
import { useState } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTransactions } from '@/lib/useTransactions';
import { useUserSettings } from '@/lib/useUserSettings';
import type { CardId } from '@/lib/cards';
import { LayoutDashboard, CreditCard, BarChart3, LogOut } from 'lucide-react';

import BestCardCalculator from './BestCardCalculator';
import WalletHUD from './WalletHUD';
import LootTracker from './LootTracker';
import RecentTransactions from './RecentTransactions';
import CardsView from './CardsView';
import AnalyticsView from './AnalyticsView';
import AddTransactionDialog from './AddTransactionDialog';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { deleteTransaction, type Transaction } from '@/lib/firestore';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { all, thisMonth, stats, loading: txLoading } = useTransactions(user?.uid || '');
  const { settings, loading: settingsLoading, saveLimits } = useUserSettings(user?.uid || '');
  
  const loading = txLoading || settingsLoading;
  const [currentView, setCurrentView] = useState<'dashboard' | 'cards' | 'analytics'>('dashboard');
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deletingTxn, setDeletingTxn] = useState<Transaction | null>(null);

  if (loading) return <LoadingScreen />;

  const handleDelete = async () => {
    if (deletingTxn?.id) {
      await deleteTransaction(deletingTxn.id);
      setDeletingTxn(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
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
        </nav>

        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className="animate-fade-up">
            <h1 className={styles.greeting}>
              {currentView === 'dashboard' ? 'Command Center' : 
               currentView === 'cards' ? 'Fleet Management' : 'The Treasury Report'}
              {user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className={styles.subGreeting}>
              {currentView === 'dashboard' ? 'Maximize every swipe with intelligent multi-card tracking.' :
               currentView === 'cards' ? 'Configure your card limits, statement dates, and reward tiers.' :
               'Analyze your spending efficiency and rebate performance.'}
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
                  userLimits={settings.creditLimits}
                />
              </section>

              <div className={styles.mainRow}>
                {/* Station 2: Fleet Status */}
                <div className={styles.leftCol}>
                  <WalletHUD 
                    stats={stats} 
                    onSelectCard={(id) => setSelectedCardId(id === selectedCardId ? null : id)} 
                    activeCardId={selectedCardId || undefined} 
                    userLimits={settings.creditLimits}
                  />
                </div>

                <div className={styles.rightCol}>
                  <div className={styles.stickyCol}>
                    {/* Station 3: Loot Tracker */}
                    <section className={styles.station}>
                      <LootTracker monthlyRebate={stats.ewRebate} lifetimeRebate={stats.lifetimeRebate} />
                    </section>

                    {/* Station 4: Spending Log */}
                    <section className={styles.station} style={{ marginTop: '2.5rem' }}>
                      <RecentTransactions 
                        transactions={thisMonth} 
                        selectedCardId={selectedCardId}
                        onClearFilter={() => setSelectedCardId(null)}
                        onEdit={setEditingTxn}
                        onDelete={setDeletingTxn}
                        ewRebateEarned={stats.ewRebate}
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
                userLimits={settings.creditLimits} 
                onSaveLimits={saveLimits}
              />
            </div>
          )}
          {currentView === 'analytics' && <AnalyticsView stats={stats} transactions={all} />}
        </div>

        <AddTransactionDialog 
          userId={user?.uid || ''} 
          ewRebateEarned={stats.ewRebate} 
        />

        {/* Lifted Modals */}
        {editingTxn && (
          <AddTransactionDialog
            userId={user?.uid || ''}
            ewRebateEarned={stats.ewRebate}
            initialTransaction={editingTxn}
            onClose={() => setEditingTxn(null)}
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
      </main>
    </div>
  );
}
