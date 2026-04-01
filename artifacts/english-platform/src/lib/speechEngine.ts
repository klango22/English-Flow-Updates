// ─── Types ─────────────────────────────────────────────────────────────────

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

// ─── Voice selection ────────────────────────────────────────────────────────

let _selectedVoice: SpeechSynthesisVoice | null = null;
let _voicesLoaded = false;

/**
 * Priority filter — checked in order, first match wins.
 * Favors Google/Microsoft high-quality voices, Natural/Neural variants,
 * and avoids known robotic voices like Microsoft Zira.
 */
const PRIORITY_FILTERS: ((v: SpeechSynthesisVoice) => boolean)[] = [
  (v) => v.name === "Google US English",
  (v) => /Microsoft Aria Online \(Natural\)/i.test(v.name),
  (v) => /Microsoft Aria/i.test(v.name),
  (v) => /Microsoft Jenny/i.test(v.name),
  (v) => /Microsoft Guy/i.test(v.name),
  (v) => /Natural/i.test(v.name) && v.lang.startsWith("en"),
  (v) => /Neural/i.test(v.name) && v.lang.startsWith("en"),
  (v) => v.name.includes("Google") && v.lang === "en-US",
  (v) =>
    v.name.includes("Microsoft") && v.lang === "en-US" && !/Zira/i.test(v.name),
  (v) => v.lang === "en-US" && !/Zira/i.test(v.name),
  (v) => v.lang.startsWith("en-US"),
  (v) => v.lang.startsWith("en"),
];

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  for (const filter of PRIORITY_FILTERS) {
    const match = voices.find(filter);
    if (match) return match;
  }
  return voices[0] ?? null;
}

function trySelectVoice(): boolean {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (voices.length === 0) return false;
  _selectedVoice = pickBestVoice(voices);
  _voicesLoaded = true;
  return true;
}

// ─── Initialisation ─────────────────────────────────────────────────────────

let _initPromise: Promise<SpeechSynthesisVoice | null> | null = null;

/**
 * Call once on app mount. Returns a promise that resolves when a voice is
 * selected. Safe to call multiple times — returns the same promise.
 */
export function initVoice(): Promise<SpeechSynthesisVoice | null> {
  if (_initPromise) return _initPromise;

  _initPromise = new Promise<SpeechSynthesisVoice | null>((resolve) => {
    if (!window.speechSynthesis) {
      resolve(null);
      return;
    }

    // Voices may already be loaded (Firefox, Safari, some Chrome states)
    if (trySelectVoice()) {
      resolve(_selectedVoice);
      return;
    }

    // Chrome loads voices asynchronously — wait for the event
    const onVoicesChanged = () => {
      if (trySelectVoice()) {
        resolve(_selectedVoice);
      }
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    // Belt-and-suspenders: poll in case the event never fires
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (trySelectVoice()) {
        clearInterval(poll);
        window.speechSynthesis.onvoiceschanged = null;
        resolve(_selectedVoice);
      } else if (attempts >= 10) {
        clearInterval(poll);
        resolve(null); // give up, browser will use default
      }
    }, 300);
  });

  return _initPromise;
}

/** Returns the name of the currently selected voice, for display/debug. */
export function getVoiceName(): string {
  return _selectedVoice?.name ?? "Browser Default";
}

// ─── Chrome long-utterance fix ───────────────────────────────────────────────
// Chrome silently stops synthesis after ~15 s. Pausing + resuming every 10 s
// keeps it alive without any audible glitch.

function makeKeepAlive(): { start: () => void; stop: () => void } {
  let id: ReturnType<typeof setInterval> | null = null;
  return {
    start() {
      if (id) clearInterval(id);
      id = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (id) clearInterval(id);
        }
      }, 10_000);
    },
    stop() {
      if (id) {
        clearInterval(id);
        id = null;
      }
    },
  };
}

// ─── Core speak / stop ──────────────────────────────────────────────────────

/**
 * Speaks `text` with the best available voice.
 * If voices aren't loaded yet, waits for initVoice() to resolve first.
 */
export function speak(text: string, options: SpeechOptions = {}): void {
  if (!window.speechSynthesis) return;

  // Stop anything currently speaking
  window.speechSynthesis.cancel();

  const doSpeak = (voice: SpeechSynthesisVoice | null) => {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.pitch = options.pitch ?? 1.0;
    utterance.rate = options.rate ?? 0.9; // natural, human-like pace
    utterance.volume = options.volume ?? 1.0;

    // Use the best loaded voice; fall back to live getVoices() pick
    const v =
      voice ??
      _selectedVoice ??
      pickBestVoice(window.speechSynthesis.getVoices());
    if (v) utterance.voice = v;

    const ka = makeKeepAlive();

    // Assign all three event handlers exactly once (no overwrites)
    utterance.onstart = () => {
      ka.start();
      options.onStart?.();
    };
    utterance.onend = () => {
      ka.stop();
      options.onEnd?.();
    };
    utterance.onerror = (ev) => {
      ka.stop();
      // 'interrupted' is fired when we cancel intentionally — not a real error
      if (ev.error !== "interrupted") {
        options.onError?.();
      } else {
        options.onEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // If voices are already loaded, speak immediately; otherwise wait
  if (_voicesLoaded) {
    doSpeak(_selectedVoice);
  } else {
    initVoice().then(doSpeak);
  }
}

/** Cancel any ongoing speech immediately. */
export function stop(): void {
  window.speechSynthesis?.cancel();
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

// ─── Feedback TTS (speaking module) ─────────────────────────────────────────

const FEEDBACK_PHRASES = [
  "Well done! Your response sounded clear and confident.",
  "Great effort! Your pronunciation was very good.",
  "Excellent work! Keep practicing to build even more fluency.",
  "Nice job! Your intonation sounded natural.",
  "Good response! You are making real progress.",
];

/** Reads back a short positive feedback phrase after a speaking task. */
export function speakFeedback(): void {
  const phrase =
    FEEDBACK_PHRASES[Math.floor(Math.random() * FEEDBACK_PHRASES.length)];
  speak(phrase, { rate: 0.88, pitch: 1.05 });
}
