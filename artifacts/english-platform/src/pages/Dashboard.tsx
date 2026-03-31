import { useState, useEffect, useCallback } from 'react';
import { BookOpen, MessageSquare, Headphones, Layers, AlertTriangle, ArrowLeft, CalendarCheck } from 'lucide-react';
import { ProgressHeader } from '@/components/ProgressHeader';
import { VideoSection } from '@/components/VideoSection';
import { TaskCard } from '@/components/TaskCard';
import { VocabCard } from '@/components/VocabCard';
import { useAppState } from '@/hooks/useAppState';
import { useChronometer } from '@/hooks/useChronometer';
import { getLesson } from '@/lib/syllabus';
import { initVoice } from '@/lib/speechEngine';

type Tab = 'lessons' | 'grammar' | 'listening' | 'speaking' | 'vocabulary';

// ─── Behind-warning banner ────────────────────────────────────────────────────

interface BehindBannerProps {
  behindDay: number;
  behindWeek: number;
  isCatchingUp: boolean;
  onGoToCatchUp: () => void;
  onReturnToToday: () => void;
}

function BehindBanner({ behindDay, behindWeek, isCatchingUp, onGoToCatchUp, onReturnToToday }: BehindBannerProps) {
  if (isCatchingUp) {
    return (
      <div className="bg-amber-950/30 border-b border-amber-500/30">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck size={15} className="text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-amber-300">
              Catch-up Mode — completing <span className="font-bold">Week {behindWeek}, Day {behindDay}</span>
            </p>
          </div>
          <button
            onClick={onReturnToToday}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-200 underline font-medium"
            data-testid="btn-return-to-today"
          >
            <ArrowLeft size={12} /> Back to Today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-300">You are behind!</p>
            <p className="text-xs text-amber-400/80">
              Complete <span className="font-semibold text-amber-300">Week {behindWeek}, Day {behindDay}</span> (90 min + exercises) to unlock today's content.
            </p>
          </div>
        </div>
        <button
          onClick={onGoToCatchUp}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors"
          data-testid="btn-go-to-catchup"
        >
          <CalendarCheck size={13} />
          Go to Day {behindDay} (Week {behindWeek})
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons');

  const {
    state,
    dayProgress,
    calendarSync,
    isViewingCatchUpDay,
    handleMasterReset,
    handleWeekReset,
    handleCompleteTask,
    handleAddMinutes,
    handleSetMinutes,
    handleNextDay,
    handleUndoLastAnswer,
    handleViewDay,
    handleReturnToToday,
  } = useAppState();

  const lesson = getLesson(state.currentWeek, state.currentDay);

  // Initialize TTS voice on mount
  useEffect(() => { initVoice(); }, []);

  // Precision chronometer — single global setInterval, Date.now() delta
  const onTick = useCallback((m: number) => handleSetMinutes(m), [handleSetMinutes]);
  const onSave = useCallback((m: number) => handleSetMinutes(m), [handleSetMinutes]);

  useChronometer({ currentMinutes: dayProgress.totalMinutes, onTick, onSave });

  // Video watch time uses addMinutes (extra credit on top of chronometer)
  const handleVideoWatch = useCallback((m: number) => handleAddMinutes(m), [handleAddMinutes]);

  const grammarTasks   = lesson.tasks.filter(t => t.type === 'grammar');
  const listeningTasks = lesson.tasks.filter(t => t.type === 'listening');
  const speakingTasks  = lesson.tasks.filter(t => t.type === 'speaking');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'lessons',    label: 'Lessons',   icon: <BookOpen size={15} /> },
    { id: 'grammar',    label: 'Grammar',   icon: <MessageSquare size={15} />, count: grammarTasks.length },
    { id: 'listening',  label: 'Listening', icon: <Headphones size={15} />,   count: listeningTasks.length },
    { id: 'speaking',   label: 'Speaking',  icon: <MessageSquare size={15} />, count: speakingTasks.length },
    { id: 'vocabulary', label: 'Vocab',     icon: <Layers size={15} />,        count: lesson.vocabulary.length },
  ];

  const accuracy       = dayProgress.accuracy;
  const minutesDone    = dayProgress.totalMinutes;
  const completedTasks = dayProgress.completedTasks;

  // Calendar display labels — always show the true calendar day in the banner
  const bannerWeek = isViewingCatchUpDay ? state.currentWeek : calendarSync.calendarWeek;
  const bannerDay  = isViewingCatchUpDay ? state.currentDay  : calendarSync.calendarDay;

  const handleGoToCatchUp = useCallback(() => {
    handleViewDay(calendarSync.behindDay, calendarSync.behindWeek);
  }, [calendarSync.behindDay, calendarSync.behindWeek, handleViewDay]);

  return (
    <div className="min-h-screen bg-background">

      {/* Sticky header */}
      <ProgressHeader
        state={state}
        calendarSync={calendarSync}
        isViewingCatchUpDay={isViewingCatchUpDay}
        onMasterReset={handleMasterReset}
        onWeekReset={handleWeekReset}
        onNextDay={handleNextDay}
      />

      {/* Behind / catch-up banner */}
      {(calendarSync.isBehind || isViewingCatchUpDay) && (
        <BehindBanner
          behindDay={calendarSync.behindDay}
          behindWeek={calendarSync.behindWeek}
          isCatchingUp={isViewingCatchUpDay}
          onGoToCatchUp={handleGoToCatchUp}
          onReturnToToday={handleReturnToToday}
        />
      )}

      {/* Lesson banner */}
      <div className={`border-b border-border ${isViewingCatchUpDay
        ? 'bg-gradient-to-r from-amber-950/20 via-amber-950/5 to-transparent'
        : 'bg-gradient-to-r from-primary/15 via-primary/5 to-transparent'
      }`}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${isViewingCatchUpDay ? 'text-amber-400' : 'text-primary'}`}>
                Week {bannerWeek} · Day {bannerDay}
                {isViewingCatchUpDay && <span className="ml-2 normal-case text-amber-500">(catch-up)</span>}
              </p>
              <h1 className="text-xl font-bold text-foreground mt-0.5">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">90-Minute Immersion Plan · 20 Tasks</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {completedTasks.length}<span className="text-base text-muted-foreground">/20</span>
                </p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {accuracy}<span className="text-base text-muted-foreground">%</span>
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {minutesDone}<span className="text-base text-muted-foreground">/90</span>
                </p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Time Progress</span>
                <span>{minutesDone}/90 min</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, (minutesDone / 90) * 100)}%`,
                    background: isViewingCatchUpDay
                      ? 'linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 65%))'
                      : undefined,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Accuracy</span>
                <span className={accuracy >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{accuracy}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${accuracy}%`,
                    background: accuracy >= 80
                      ? 'linear-gradient(90deg, hsl(142 76% 45%), hsl(142 76% 60%))'
                      : 'linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 65%))',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-muted'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'lessons' && (
          <VideoSection videos={lesson.videos} onWatchMinutes={handleVideoWatch} />
        )}

        {activeTab === 'grammar' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Grammar Tasks</h2>
            <p className="text-sm text-muted-foreground">Complete all grammar exercises to strengthen your understanding.</p>
            <div className="space-y-4">
              {grammarTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={completedTasks.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onUndo={handleUndoLastAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listening' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Listening Tasks</h2>
            <p className="text-sm text-muted-foreground">Listen to each passage and answer the comprehension questions.</p>
            <div className="space-y-4">
              {listeningTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={completedTasks.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onUndo={handleUndoLastAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'speaking' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Speaking Tasks</h2>
            <p className="text-sm text-muted-foreground">Practice your spoken English. Each task plays the prompt for you.</p>
            <div className="space-y-4">
              {speakingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={completedTasks.includes(task.id)}
                  onComplete={handleCompleteTask}
                  onUndo={handleUndoLastAnswer}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Vocabulary Cards</h2>
            <p className="text-sm text-muted-foreground">Tap any card to flip and reveal the definition. Use the speaker to hear pronunciation.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.vocabulary.map(card => (
                <VocabCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
