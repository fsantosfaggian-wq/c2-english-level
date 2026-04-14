import { useState, useCallback, useRef } from 'react';

interface UseSpeechReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
}

const speakWithWebSpeech = (
  text: string,
  setIsSpeaking: (val: boolean) => void,
  setIsLoading: (val: boolean) => void,
  setError: (msg: string | null) => void
) => {
  setIsLoading(false);
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => {
    setIsSpeaking(false);
    setError('Unable to play audio');
  };
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const useSpeech = (): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanText = text.replace(/[^a-zA-Z\s'-]/g, '').trim();
      
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanText)}`);
      
      if (response.ok) {
        const data = await response.json();
        const audioUrl = data[0]?.phonetics?.find((p: { audio?: string }) => p.audio && p.audio.length > 0)?.audio;
        
        if (audioUrl) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          
          audioRef.current = new Audio(audioUrl);
          setIsLoading(false);
          setIsSpeaking(true);
          
          audioRef.current.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          
          audioRef.current.onerror = () => {
            setIsSpeaking(false);
            speakWithWebSpeech(cleanText, setIsSpeaking, setIsLoading, setError);
            audioRef.current = null;
          };
          
          await audioRef.current.play();
          return;
        }
      }
      
      speakWithWebSpeech(cleanText, setIsSpeaking, setIsLoading, setError);
    } catch {
      speakWithWebSpeech(text.replace(/[^a-zA-Z\s'-]/g, '').trim(), setIsSpeaking, setIsLoading, setError);
    }
  }, [isSpeaking]);

  return { speak, isSpeaking, isLoading, error };
};
