export interface SpeechOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onEnd?: () => void;
  onStart?: () => void;
  onError?: () => void;
}

let naturalVoice: SpeechSynthesisVoice | null = null;
let voiceReady = false;

// Priority order for voice selection
const VOICE_PRIORITY: ((v: SpeechSynthesisVoice) => boolean)[] = [
  v => v.name === 'Google US English',
  v => v.name.includes('Microsoft Aria'),
  v => v.name.toLowerCase().includes('natural') && v.lang.startsWith('en'),
  v => v.name.includes('Google') && v.lang === 'en-US',
  v => v.name.includes('Microsoft') && v.lang === 'en-US',
  v => v.lang === 'en-US' && !v.name.toLowerCase().includes('zira'), // avoid robotic Zira
  v => v.lang.startsWith('en-US'),
  v => v.lang.startsWith('en'),
];

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const matcher of VOICE_PRIORITY) {
    const match = voices.find(matcher);
    if (match) return match;
  }
  return voices[0] ?? null;
}

export function initVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(null);
      return;
    }

    const tryLoad = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        naturalVoice = selectBestVoice(voices);
        voiceReady = true;
        resolve(naturalVoice);
      }
    };

    tryLoad();
    if (!voiceReady) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        tryLoad();
        resolve(naturalVoice);
      }, { once: true });

      // Fallback: retry after 500ms in case event doesn't fire
      setTimeout(tryLoad, 500);
      setTimeout(tryLoad, 1500);
    }
  });
}

export function speak(text: string, options: SpeechOptions = {}): void {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Core quality settings
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 0.9;
  utterance.volume = options.volume ?? 1.0;
  utterance.lang = 'en-US';

  // Assign best voice
  const voice = naturalVoice ?? selectBestVoice(window.speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  // Chrome bug: speech stops after ~15s without interaction
  // Workaround: pause/resume every 10s to keep it alive
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  utterance.onstart = () => {
    options.onStart?.();
    keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        if (keepAlive) clearInterval(keepAlive);
      }
    }, 10_000);
  };
  utterance.onend = () => {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
    options.onEnd?.();
  };
  utterance.onerror = () => {
    if (keepAlive) { clearInterval(keepAlive); keepAlive = null; }
    options.onError?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

export function getVoiceName(): string {
  return naturalVoice?.name ?? 'Browser Default';
}
