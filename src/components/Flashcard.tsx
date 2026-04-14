import React, { useState, useEffect } from 'react';
import { Word, WordStatus } from '../hooks/use-vocabulary';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCcw, Eye, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeech } from '@/hooks/use-speech';

interface FlashcardProps {
  word: Word;
  onStatusUpdate: (id: number, status: WordStatus) => void;
  onNext: () => void;
}

const speakText = (text: string, setSpeaking: (val: boolean) => void) => {
  if (!text) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  
  window.speechSynthesis.speak(utterance);
};

const Flashcard = ({ word, onStatusUpdate, onNext }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isWordSpeaking, setIsWordSpeaking] = useState(false);
  const [isDefinitionSpeaking, setIsDefinitionSpeaking] = useState(false);
  const [isExampleSpeaking, setIsExampleSpeaking] = useState(false);
  const { speak, isSpeaking, isLoading } = useSpeech();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [word.id]);

  const handleSpeak = () => {
    speak(word.word);
  };

  const handleSpeakDefinition = () => {
    if (isDefinitionSpeaking) {
      window.speechSynthesis.cancel();
      setIsDefinitionSpeaking(false);
      return;
    }
    speakText(word.definition, setIsDefinitionSpeaking);
  };

  const handleSpeakExample = () => {
    if (isExampleSpeaking) {
      window.speechSynthesis.cancel();
      setIsExampleSpeaking(false);
      return;
    }
    speakText(word.example_sentence, setIsExampleSpeaking);
  };

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setIsVisible(true);
  }, [word.id]);

  const handleStatus = (status: WordStatus) => {
    setIsVisible(false);
    // Small delay to allow exit animation if we had one, 
    // but here we just update and the parent handles the next word
    setTimeout(() => {
      onStatusUpdate(word.id, status);
      onNext();
    }, 150);
  };

  return (
    <div className={cn(
      "w-full max-w-xl mx-auto transition-all duration-300 transform",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
    )}>
      <Card className="min-h-[400px] flex flex-col justify-between shadow-xl border-2 hover:border-primary/20 transition-all duration-300 bg-card">
        <CardHeader className="text-center pt-8 pb-4">
          <Badge variant="outline" className="w-fit mx-auto mb-3 text-xs uppercase tracking-widest">
            {word.level} Level
          </Badge>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <CardTitle className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary">
                {word.word}
              </CardTitle>
              {word.translation && (
                <p className="text-gray-500 text-sm italic">
                  {word.translation}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              disabled={isLoading}
              className={cn(
                "rounded-full hover:bg-primary/10 transition-all",
                isSpeaking && "animate-pulse text-primary"
              )}
              aria-label="Listen to pronunciation"
            >
              <Volume2 className={cn("h-6 w-6", isSpeaking && "animate-bounce")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col items-center justify-center px-6 md:px-8 text-center">
          <div className={cn(
            "transition-all duration-500 w-full",
            isFlipped ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"
          )}>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Definition</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakDefinition}
                    className={cn(
                      "h-6 w-6 hover:bg-primary/10 transition-colors",
                      isDefinitionSpeaking ? "text-primary animate-pulse" : "text-muted-foreground hover:text-blue-500"
                    )}
                    aria-label="Listen to definition"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-lg leading-relaxed">{word.definition}</p>
                {word.definition_pt && (
                  <p className="text-sm text-amber-600/70 italic border-t border-dashed border-amber-200/50 pt-2 mt-2">
                    {word.definition_pt}
                  </p>
                )}
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakExample}
                    className={cn(
                      "h-6 w-6 hover:bg-primary/10 transition-colors",
                      isExampleSpeaking ? "text-primary animate-pulse" : "text-muted-foreground hover:text-blue-500"
                    )}
                    aria-label="Listen to example"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-base italic text-muted-foreground">"{word.example_sentence}"</p>
                {word.example_pt && (
                  <p className="text-sm text-amber-600/70 italic border-t border-dashed border-amber-200/50 pt-2 mt-2">
                    "{word.example_pt}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isFlipped && (
            <Button 
              variant="ghost" 
              className="h-20 w-20 md:h-24 md:w-24 rounded-full hover:bg-primary/5 group transition-transform hover:scale-110 mt-4"
              onClick={() => setIsFlipped(true)}
            >
              <Eye className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground group-hover:text-primary transition-colors" />
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
    </div>
  );
};

export default Flashcard;