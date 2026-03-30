import { useState, useCallback, useEffect, useRef } from 'react';
import { speak, stop, initVoice, getVoiceName } from '@/lib/speechEngine';

interface UseSpeechReturn {
  isPlaying: boolean;
  voiceName: string;
  toggle: (text: string) => void;
  play: (text: string, onDone?: () => void) => void;
  pause: () => void;
}

/**
 * React hook wrapping the speech engine.
 * Provides isPlaying state, toggle, play and pause.
 * Automatically cancels speech on component unmount.
 */
export function useSpeech(): UseSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceName, setVoiceName] = useState('Loading...');
  const currentTextRef = useRef<string | null>(null);

  // Initialise voices and surface the selected voice name
  useEffect(() => {
    initVoice().then(() => {
      setVoiceName(getVoiceName());
    });
    // Cancel on unmount to avoid dangling speech across page navigations
    return () => { stop(); };
  }, []);

  const pause = useCallback(() => {
    stop();
    setIsPlaying(false);
    currentTextRef.current = null;
  }, []);

  const play = useCallback((text: string, onDone?: () => void) => {
    currentTextRef.current = text;
    setIsPlaying(true);

    speak(text, {
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        currentTextRef.current = null;
        onDone?.();
      },
      onError: () => {
        setIsPlaying(false);
        currentTextRef.current = null;
      },
    });
  }, []);

  const toggle = useCallback((text: string) => {
    if (isPlaying && currentTextRef.current === text) {
      pause();
    } else {
      // If a different text is playing, cancel it first (speak() does this internally)
      currentTextRef.current = null;
      play(text);
    }
  }, [isPlaying, pause, play]);

  return { isPlaying, voiceName, toggle, play, pause };
}
