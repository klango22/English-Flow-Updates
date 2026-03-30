export interface SpeechOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  onEnd?: () => void;
  onStart?: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let naturalVoice: SpeechSynthesisVoice | null = null;

function findNaturalVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const priorities = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google US English'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft Aria'),
    (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('natural'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Google'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Microsoft'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-US'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];

  for (const matcher of priorities) {
    const match = voices.find(matcher);
    if (match) return match;
  }

  return voices[0] ?? null;
}

export function initVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      naturalVoice = findNaturalVoice();
      resolve(naturalVoice);
      return;
    }
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      naturalVoice = findNaturalVoice();
      resolve(naturalVoice);
    }, { once: true });
  });
}

export function speak(text: string, options: SpeechOptions = {}): void {
  if (!window.speechSynthesis) return;
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = options.pitch ?? 1.0;
  utterance.rate = options.rate ?? 0.9;
  utterance.volume = options.volume ?? 1.0;

  const voice = naturalVoice ?? findNaturalVoice();
  if (voice) utterance.voice = voice;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

export function getVoiceName(): string {
  return naturalVoice?.name ?? 'Default';
}
