import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import initialData from '../data/vocabulary.json';
import { 
  signInWithGoogle, 
  logOut, 
  subscribeToAuthState,
  saveProgressToCloud,
  loadProgressFromCloud
} from '../lib/firebase';

export type WordStatus = 'learned' | 'learning' | 'not_started';

export interface Word {
  id: number;
  word: string;
  definition: string;
  example_sentence: string;
  translation?: string;
  definition_pt?: string;
  example_pt?: string;
  level: string;
  status: WordStatus;
}

const STORAGE_KEY = 'c2_vocabulary_progress';

export function useVocabulary() {
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initData = async () => {
      if (user) {
        setSyncStatus('syncing');
        try {
          const cloudProgress = await loadProgressFromCloud(user.uid);
          if (cloudProgress) {
            setWords(cloudProgress);
            setSyncStatus('synced');
            return;
          }
        } catch (error) {
          console.error('Cloud load failed, using local:', error);
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setWords(JSON.parse(saved));
        } catch (e) {
          setWords(initialData as Word[]);
        }
      } else {
        setWords(initialData as Word[]);
      }
      setSyncStatus('idle');
    };

    initData();
  }, [user]);

  useEffect(() => {
    if (words.length === 0 || isLoading) return;

    const saveProgress = async () => {
      if (user) {
        setSyncStatus('syncing');
        try {
          await saveProgressToCloud(user.uid, words);
          setSyncStatus('synced');
        } catch (error) {
          console.error('Cloud save failed:', error);
          setSyncStatus('error');
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
        setSyncStatus('idle');
      }
    };

    saveProgress();
  }, [words, user, isLoading]);

  const updateStatus = useCallback((id: number, status: WordStatus) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, status } : w));
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const filteredWords = useMemo(() => {
    return words.filter(w => 
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [words, searchQuery]);

  const stats = useMemo(() => {
    const total = words.length;
    const learned = words.filter(w => w.status === 'learned').length;
    const learning = words.filter(w => w.status === 'learning').length;
    return { total, learned, learning };
  }, [words]);

  return {
    words,
    filteredWords,
    searchQuery,
    setSearchQuery,
    updateStatus,
    stats,
    user,
    isLoading,
    syncStatus,
    signIn: handleSignIn,
    signOut: handleSignOut
  };
}