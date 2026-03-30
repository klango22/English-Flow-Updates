import { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, Undo2, Mic, MicOff, Star } from 'lucide-react';
import { Task } from '@/lib/syllabus';
import { speak, stop } from '@/lib/speechEngine';

interface Props {
  task: Task;
  completed: boolean;
  onComplete: (taskId: string, xp: number, correct: boolean) => void;
  onUndo: (taskId: string) => void;
}

const DIFF_COLORS = {
  medium: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  hard: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const TYPE_COLORS = {
  grammar: 'text-emerald-400 bg-emerald-400/10',
  listening: 'text-purple-400 bg-purple-400/10',
  speaking: 'text-pink-400 bg-pink-400/10',
};

export function TaskCard({ task, completed, onComplete, onUndo }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingDone, setSpeakingDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showUndo, setShowUndo] = useState(false);

  const handlePlayAudio = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }
    const textToSpeak = task.audioText ?? task.content;
    setIsPlaying(true);
    speak(textToSpeak, {
      onEnd: () => setIsPlaying(false),
    });
  };

  const handleSubmitMCQ = () => {
    if (!selected || submitted) return;
    const correct = selected === task.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
    setShowUndo(true);
    onComplete(task.id, task.xp, correct);
  };

  const handleSpeakingSubmit = () => {
    setSpeakingDone(true);
    setShowUndo(true);
    onComplete(task.id, task.xp, true);
  };

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    // Speak the prompt back using TTS for demo
    if (task.speakingPrompt) {
      speak(task.speakingPrompt, {
        onEnd: () => setIsRecording(false),
      });
    }
    setIsRecording(true);
    setTimeout(() => setIsRecording(false), 8000);
  };

  const handleFillBlankSubmit = () => {
    if (!inputText.trim() || submitted) return;
    const correct = inputText.toLowerCase().includes(task.correctAnswer?.toLowerCase() ?? '');
    setIsCorrect(correct);
    setSubmitted(true);
    setShowUndo(true);
    onComplete(task.id, task.xp, correct);
  };

  const handleUndo = () => {
    setSubmitted(false);
    setSelected(null);
    setInputText('');
    setSpeakingDone(false);
    setShowUndo(false);
    onUndo(task.id);
  };

  if (completed && !submitted && !speakingDone) {
    return (
      <div className="task-card opacity-60">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm text-muted-foreground line-through">{task.instruction}</span>
          <span className="ml-auto text-xs text-emerald-400 font-bold">+{task.xp} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="task-card"
      data-testid={`task-card-${task.id}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[task.type]}`}>
          {task.type}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${DIFF_COLORS[task.difficulty]}`}>
          {task.difficulty}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Star size={12} className="text-primary" />
          <span className="text-xs font-bold text-primary">{task.xp} XP</span>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-sm text-muted-foreground mb-2">{task.instruction}</p>

      {/* Content */}
      <p className="text-base font-semibold text-foreground mb-4 leading-relaxed">{task.content}</p>

      {/* Listening audio */}
      {task.audioText && task.type === 'listening' && (
        <button
          onClick={handlePlayAudio}
          className={`flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-medium transition-all ${
            isPlaying
              ? 'bg-primary text-primary-foreground pulse-speaking'
              : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
          }`}
          data-testid={`button-play-audio-${task.id}`}
        >
          <Volume2 size={14} />
          {isPlaying ? 'Pause' : 'Listen to Passage'}
        </button>
      )}

      {/* MCQ Options */}
      {task.options && task.type !== 'speaking' && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.options.map((opt) => {
            let cls = 'border border-border bg-muted/30 hover:bg-muted/60 text-foreground';
            if (submitted) {
              if (opt === task.correctAnswer) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
              else if (opt === selected) cls = 'border-red-500 bg-red-500/10 text-red-400';
              else cls = 'border-border bg-muted/20 text-muted-foreground opacity-50';
            } else if (selected === opt) {
              cls = 'border-primary bg-primary/10 text-primary';
            }
            return (
              <button
                key={opt}
                onClick={() => !submitted && setSelected(opt)}
                className={`text-sm px-3 py-2.5 rounded-xl text-left transition-all ${cls}`}
                disabled={submitted}
                data-testid={`option-${task.id}-${opt}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill blank input */}
      {!task.options && task.type === 'grammar' && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type your answer..."
            disabled={submitted}
            className="flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            data-testid={`input-${task.id}`}
            onKeyDown={e => e.key === 'Enter' && handleFillBlankSubmit()}
          />
        </div>
      )}

      {/* Speaking controls */}
      {task.type === 'speaking' && !speakingDone && (
        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={handlePlayAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 w-fit"
            data-testid={`button-listen-prompt-${task.id}`}
          >
            <Volume2 size={14} /> Listen to Prompt
          </button>
          <button
            onClick={handleStartRecording}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold transition-all w-fit ${
              isRecording
                ? 'bg-red-500 text-white pulse-speaking'
                : 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
            }`}
            data-testid={`button-record-${task.id}`}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            {isRecording ? 'Recording... (click to stop)' : 'Practice Speaking'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${
          isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {isCorrect
            ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            : <XCircle size={16} className="text-red-400 flex-shrink-0" />
          }
          <p className="text-sm">
            {isCorrect ? (
              <span className="text-emerald-400 font-bold">Correct! +{task.xp} XP</span>
            ) : (
              <span className="text-red-400">Incorrect. Correct answer: <strong className="text-foreground">{task.correctAnswer}</strong></span>
            )}
          </p>
        </div>
      )}

      {speakingDone && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-400 font-bold">Speaking task completed! +{task.xp} XP</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Submit button */}
        {!submitted && !speakingDone && task.type !== 'speaking' && (
          <button
            onClick={task.options ? handleSubmitMCQ : handleFillBlankSubmit}
            disabled={task.options ? !selected : !inputText.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            data-testid={`button-submit-${task.id}`}
          >
            Submit
          </button>
        )}

        {/* Speaking submit */}
        {task.type === 'speaking' && !speakingDone && (
          <button
            onClick={handleSpeakingSubmit}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
            data-testid={`button-submit-speaking-${task.id}`}
          >
            Mark as Done
          </button>
        )}

        {/* Undo button */}
        {showUndo && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
            data-testid={`button-undo-${task.id}`}
            title="Undo this answer"
          >
            <Undo2 size={14} />
            <span className="hidden sm:inline">Undo</span>
          </button>
        )}
      </div>
    </div>
  );
}
