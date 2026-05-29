'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  onAuthStateChanged,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Google sign-in failed');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Sign-in failed');
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Sign-up failed');
    }
  };

  const updateProfileName = async (name: string) => {
    setError(null);
    if (!user) throw new Error('No user is currently signed in');
    try {
      await updateProfile(user, { displayName: name });
      // Force user state to update since Firebase might not trigger onAuthStateChanged for profile updates alone
      setUser({ ...user, displayName: name }); 
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Failed to update profile name');
      throw err;
    }
  };

  const updateUserPassword = async (currentPass: string, newPass: string) => {
    setError(null);
    if (!user || !user.email) throw new Error('No user is currently signed in with email');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Failed to update password';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, updateProfileName, updateUserPassword, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
