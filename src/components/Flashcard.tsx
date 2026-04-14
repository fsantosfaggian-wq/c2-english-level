import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Word, WordStatus } from '../hooks/use-vocabulary';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RotateCcw, Eye, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  word: Word;
  onStatusUpdate: (id: number, status: WordStatus) => void;
  onNext: () => void;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

const getEnglishVoice = (): SpeechSynthesisVoice | null => {
  if (cachedVoice && window.speechSynthesis.getVoices().includes(cachedVoice)) {
    return cachedVoice;
  }
  
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Microsoft'))
  );
  
  if (preferredVoice) {
    cachedVoice = preferredVoice;
    return preferredVoice;
  }
  
  const fallbackVoice = voices.find(v => v.lang === 'en-US');
  if (fallbackVoice) {
    cachedVoice = fallbackVoice;
    return fallbackVoice;
  }
  
  return null;
};

const speakText = (text: string, setSpeaking: (val: boolean) => void) => {
  if (!text) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  
  window.speechSynthesis.speak(utterance);
};

const Flashcard = ({ word, onStatusUpdate, onNext }: FlashcardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isWordSpeaking, setIsWordSpeaking] = useState(false);
  const [isDefinitionSpeaking, setIsDefinitionSpeaking] = useState(false);
  const [isExampleSpeaking, setIsExampleSpeaking] = useState(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoice = null;
      getEnglishVoice();
    };
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      isPlayingRef.current = false;
    };
  }, [word.id]);

  useEffect(() => {
    setIsRevealed(false);
    setIsVisible(true);
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
  }, [word.id]);

  const playAudioSequence = useCallback(async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    
    const voice = getEnglishVoice();
    if (!voice) {
      isPlayingRef.current = false;
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    setIsWordSpeaking(true);
    window.speechSynthesis.cancel();
    const wordUtterance = new SpeechSynthesisUtterance(word.word);
    wordUtterance.voice = voice;
    wordUtterance.lang = 'en-US';
    wordUtterance.rate = 0.9;
    wordUtterance.pitch = 1;
    wordUtterance.onend = () => setIsWordSpeaking(false);
    wordUtterance.onerror = () => setIsWordSpeaking(false);
    window.speechSynthesis.speak(wordUtterance);
    
    const wordDuration = Math.max(1500, word.word.length * 80);
    await new Promise(resolve => setTimeout(resolve, wordDuration + 400));

    setIsDefinitionSpeaking(true);
    const defUtterance = new SpeechSynthesisUtterance(word.definition);
    defUtterance.voice = voice;
    defUtterance.lang = 'en-US';
    defUtterance.rate = 0.9;
    defUtterance.pitch = 1;
    defUtterance.onend = () => setIsDefinitionSpeaking(false);
    defUtterance.onerror = () => setIsDefinitionSpeaking(false);
    window.speechSynthesis.speak(defUtterance);
    
    const defDuration = Math.max(2500, word.definition.length * 50);
    await new Promise(resolve => setTimeout(resolve, defDuration + 400));

    setIsExampleSpeaking(true);
    const exUtterance = new SpeechSynthesisUtterance(word.example_sentence);
    exUtterance.voice = voice;
    exUtterance.lang = 'en-US';
    exUtterance.rate = 0.9;
    exUtterance.pitch = 1;
    exUtterance.onend = () => {
      setIsExampleSpeaking(false);
      isPlayingRef.current = false;
    };
    exUtterance.onerror = () => {
      setIsExampleSpeaking(false);
      isPlayingRef.current = false;
    };
    window.speechSynthesis.speak(exUtterance);
  }, [word.word, word.definition, word.example_sentence]);

  const handleReveal = () => {
    setIsRevealed(true);
    playAudioSequence();
  };

  const handleSpeak = () => {
    if (isWordSpeaking) {
      window.speechSynthesis.cancel();
      setIsWordSpeaking(false);
      return;
    }
    speakText(word.word, setIsWordSpeaking);
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

  const handleStatus = (status: WordStatus) => {
    setIsVisible(false);
    window.speechSynthesis.cancel();
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
              {isRevealed && word.translation && (
                <p className="text-gray-500 text-sm italic">
                  {word.translation}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className={cn(
                "rounded-full hover:bg-primary/10 transition-all",
                isWordSpeaking && "animate-pulse text-primary"
              )}
              aria-label="Listen to pronunciation"
            >
              <Volume2 className={cn("h-6 w-6", isWordSpeaking && "animate-bounce")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col items-center justify-center px-6 md:px-8 text-center">
          {!isRevealed ? (
            <Button 
              variant="outline"
              className="h-20 w-48 md:h-24 md:w-56 rounded-full hover:bg-primary/5 group transition-transform hover:scale-105 border-2 border-dashed"
              onClick={handleReveal}
            >
              <div className="flex flex-col items-center gap-1">
                <Eye className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-primary">
                  Show Answer
                </span>
              </div>
            </Button>
          ) : (
            <div className="w-full space-y-5">
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
