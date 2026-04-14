import React, { useState, useMemo } from 'react';
import { useVocabulary } from '../hooks/use-vocabulary';
import Navbar from '../components/Navbar';
import Flashcard from '../components/Flashcard';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { words, searchQuery, setSearchQuery, updateStatus, stats } = useVocabulary();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get words that are not yet learned for the flashcard session
  const sessionWords = useMemo(() => {
    return words.filter(w => w.status !== 'learned');
  }, [words]);

  const currentWord = sessionWords[currentIndex % sessionWords.length];
  const progressPercentage = (stats.learned / stats.total) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Mastery Progress</p>
                  <h3 className="text-4xl font-bold mt-1">{stats.learned} / {stats.total}</h3>
                  <p className="text-xs mt-2 text-primary-foreground/60">Words mastered at C2 level</p>
                </div>
                <Trophy className="h-10 w-10 opacity-20" />
              </div>
              <Progress value={progressPercentage} className="h-2 mt-6 bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Currently Learning</p>
                <h3 className="text-2xl font-bold">{stats.learning} words</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Remaining</p>
                <h3 className="text-2xl font-bold">{stats.total - stats.learned} words</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Section */}
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Daily Practice</h2>
            <p className="text-muted-foreground">Master these high-level terms through active recall.</p>
          </div>

          {sessionWords.length > 0 ? (
            <Flashcard 
              word={currentWord} 
              onStatusUpdate={updateStatus}
              onNext={() => setCurrentIndex(prev => prev + 1)}
            />
          ) : (
            <Card className="w-full max-w-xl p-12 text-center space-y-6 border-dashed border-2">
              <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">All Caught Up!</h3>
                <p className="text-muted-foreground">You've mastered all the words in your current list. Great job!</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/list">
                  View Vocabulary List <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;