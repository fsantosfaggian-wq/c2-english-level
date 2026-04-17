import React from 'react';
import { useVocabulary } from '../hooks/use-vocabulary';
import Navbar from '../components/Navbar';
import VocabularyList from '../components/VocabularyList';

const WordListPage = () => {
  const { filteredWords, searchQuery, setSearchQuery, updateStatus, user, signIn, signOut, syncStatus, isLoading } = useVocabulary();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        user={user}
        onSignIn={signIn}
        onSignOut={signOut}
        syncStatus={syncStatus}
        isLoading={isLoading}
      />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your C2 level English vocabulary collection.
          </p>
        </div>
        <VocabularyList words={filteredWords} onStatusUpdate={updateStatus} />
      </main>
    </div>
  );
};

export default WordListPage;