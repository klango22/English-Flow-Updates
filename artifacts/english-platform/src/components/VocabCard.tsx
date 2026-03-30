import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from '@/lib/speechEngine';
import type { VocabCard as VocabCardType } from '@/lib/syllabus';

interface Props {
  card: VocabCardType;
}

export function VocabCard({ card }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(`${card.word}. ${card.definition}. Example: ${card.example}`, { rate: 0.85 });
  };

  return (
    <div
      className={`card-scene cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      data-testid={`vocab-card-${card.id}`}
      role="button"
      aria-label={`Vocabulary card: ${card.word}. Click to flip.`}
    >
      <div className="card-inner">
        {/* Front face */}
        <div
          className="card-face"
          style={{ background: 'linear-gradient(135deg, hsl(248 89% 20%), hsl(248 89% 14%))', border: '1px solid hsl(248 89% 40% / 0.4)' }}
        >
          <p className="text-xs text-primary/70 font-medium uppercase tracking-widest mb-2">Word</p>
          <h3 className="text-2xl font-bold text-primary mb-1">{card.word}</h3>
          <p className="text-sm text-muted-foreground">/{card.pronunciation}/</p>
          <p className="text-xs text-muted-foreground mt-3 opacity-70">Tap to reveal</p>
          <button
            onClick={handleSpeak}
            className="absolute bottom-3 right-3 p-2 rounded-full hover:bg-primary/20 transition-colors"
            data-testid={`vocab-speak-${card.id}`}
            aria-label="Speak word"
          >
            <Volume2 size={16} className="text-primary" />
          </button>
        </div>

        {/* Back face */}
        <div
          className="card-face card-back"
          style={{ background: 'linear-gradient(135deg, hsl(258 50% 15%), hsl(248 89% 12%))', border: '1px solid hsl(258 60% 40% / 0.4)' }}
        >
          <p className="text-xs text-primary/70 font-medium uppercase tracking-widest mb-2">Definition</p>
          <p className="text-sm font-semibold text-foreground text-center mb-3 leading-relaxed">{card.definition}</p>
          <div className="w-full h-px bg-border/50 mb-3" />
          <p className="text-xs text-muted-foreground italic text-center leading-relaxed">"{card.example}"</p>
          <button
            onClick={handleSpeak}
            className="absolute bottom-3 right-3 p-2 rounded-full hover:bg-primary/20 transition-colors"
            aria-label="Speak definition"
          >
            <Volume2 size={16} className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
