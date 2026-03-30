import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import type { VocabCard as VocabCardType } from '@/lib/syllabus';

interface Props {
  card: VocabCardType;
}

export function VocabCard({ card }: Props) {
  const [flipped, setFlipped] = useState(false);
  const { isPlaying, toggle } = useSpeech();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Speak word, then pronunciation, then full definition and example
    const text = `${card.word}. Pronunciation: ${card.pronunciation}. Definition: ${card.definition}. Example: ${card.example}`;
    toggle(text);
  };

  return (
    <div
      className={`card-scene cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
      data-testid={`vocab-card-${card.id}`}
      role="button"
      aria-label={`Vocabulary card: ${card.word}. Click to flip.`}
    >
      <div className="card-inner">
        {/* ── Front face ── */}
        <div
          className="card-face"
          style={{
            background: 'linear-gradient(135deg, hsl(248 89% 20%), hsl(248 89% 14%))',
            border: '1px solid hsl(248 89% 40% / 0.4)',
          }}
        >
          <p className="text-xs text-primary/70 font-medium uppercase tracking-widest mb-2">Word</p>
          <h3 className="text-2xl font-bold text-primary mb-1">{card.word}</h3>
          <p className="text-sm text-muted-foreground font-mono">/{card.pronunciation}/</p>
          <p className="text-xs text-muted-foreground mt-3 opacity-60">Tap to reveal definition</p>

          <button
            onClick={handleSpeak}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
              isPlaying ? 'bg-primary/40 text-primary-foreground' : 'hover:bg-primary/20 text-primary'
            }`}
            data-testid={`vocab-speak-${card.id}`}
            aria-label={isPlaying ? 'Stop speaking' : 'Hear pronunciation'}
            title={isPlaying ? 'Stop' : 'Hear pronunciation & definition'}
          >
            {isPlaying
              ? <Loader2 size={16} className="animate-spin" />
              : <Volume2 size={16} />
            }
          </button>
        </div>

        {/* ── Back face ── */}
        <div
          className="card-face card-back"
          style={{
            background: 'linear-gradient(135deg, hsl(258 50% 15%), hsl(248 89% 12%))',
            border: '1px solid hsl(258 60% 40% / 0.4)',
          }}
        >
          <p className="text-xs text-primary/70 font-medium uppercase tracking-widest mb-2">Definition</p>
          <p className="text-sm font-semibold text-foreground text-center mb-3 leading-relaxed">
            {card.definition}
          </p>
          <div className="w-full h-px bg-border/50 mb-3" />
          <p className="text-xs text-muted-foreground italic text-center leading-relaxed">
            "{card.example}"
          </p>

          <button
            onClick={handleSpeak}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
              isPlaying ? 'bg-primary/40 text-primary-foreground' : 'hover:bg-primary/20 text-primary'
            }`}
            aria-label={isPlaying ? 'Stop speaking' : 'Hear word again'}
            title={isPlaying ? 'Stop' : 'Hear word & definition'}
          >
            {isPlaying
              ? <Loader2 size={16} className="animate-spin" />
              : <Volume2 size={16} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
