import { useState, useEffect, useMemo } from 'react';
import initialData from '../data/vocabulary.json';

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

  // Initialize data from LocalStorage or JSON
  useEffect(() => {
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
  }, []);

  // Save to LocalStorage whenever words change
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    }
  }, [words]);

  const updateStatus = (id: number, status: WordStatus) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, status } : w));
  };

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
    stats
  };
}