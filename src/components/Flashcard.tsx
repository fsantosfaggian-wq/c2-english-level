import React, { useState } from 'react';
import { Word, WordStatus } from '../hooks/use-vocabulary';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardProps {
  word: Word;
  onStatusUpdate: (id: number, status: WordStatus) => void;
  onNext: () => void;
}

const Flashcard = ({ word, onStatusUpdate, onNext }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleStatus = (status: WordStatus) => {
    onStatusUpdate(word.id, status);
    setIsFlipped(false);
    onNext();
  };

  return (
    <div className="w-full max-w-xl mx-auto perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="min-h-[400px] flex flex-col justify-between shadow-xl border-2 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="text-center pt-12">
              <Badge variant="outline" className="w-fit mx-auto mb-4 text-xs uppercase tracking-widest">
                {word.level} Level
              </Badge>
              <CardTitle className="text-5xl font-serif font-bold tracking-tight text-primary">
                {word.word}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col items-center justify-center px-8 text-center">
              {isFlipped ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Definition</p>
                    <p className="text-xl leading-relaxed">{word.definition}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Example</p>
                    <p className="text-lg italic text-muted-foreground">"{word.example_sentence}"</p>
                  </div>
                </motion.div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="h-24 w-24 rounded-full hover:bg-primary/5 group"
                  onClick={() => setIsFlipped(true)}
                >
                  <Eye className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              )}
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-4 p-6 bg-muted/30">
              <Button 
                variant="outline" 
                className="w-full h-12 font-semibold"
                onClick={() => handleStatus('learning')}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Review Later
              </Button>
              <Button 
                className="w-full h-12 font-semibold"
                onClick={() => handleStatus('learned')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mastered
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Flashcard;