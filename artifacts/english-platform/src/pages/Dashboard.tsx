import { useState, useEffect, useCallback } from 'react';
import { BookOpen, MessageSquare, Headphones, Layers } from 'lucide-react';
import { ProgressHeader } from '@/components/ProgressHeader';
import { VideoSection } from '@/components/VideoSection';
import { TaskCard } from '@/components/TaskCard';
import { VocabCard } from '@/components/VocabCard';
import { useAppState } from '@/hooks/useAppState';
import { useChronometer } from '@/hooks/useChronometer';
import { getLesson } from '@/lib/syllabus';
import { initVoice } from '@/lib/speechEngine';

type Tab = 'lessons' | 'grammar' | 'listening' | 'speaking' | 'vocabulary';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons');
  const {
    state,
    dayProgress,
    handleMasterReset,
    handleWeekReset,
    handleCompleteTask,
    handleAddMinutes,
    handleSetMinutes,
    handleNextDay,
    handleUndoLastAnswer,
  } = useAppState();

  const lesson = getLesson(state.currentWeek, state.currentDay);

  // Initialize TTS voice on mount
  useEffect(() => {
    initVoice();
  }, []);

  // Precision chronometer — single global setInterval, Date.now() delta
  const onTick = useCallback((totalMinutes: number) => {
    handleSetMinutes(totalMinutes);
  }, [handleSetMinutes]);

  const onSave = useCallback((totalMinutes: number) => {
    handleSetMinutes(totalMinutes);
  }, [handleSetMinutes]);

  useChronometer({
    currentMinutes: dayProgress.totalMinutes,
    onTick,
    onSave,
  });

  // Video watch minutes use addMinutes (relative bonus time from watching)
  const handleVideoWatch = useCallback((minutes: number) => {
    handleAddMinutes(minutes);
  }, [handleAddMinutes]);

  const grammarTasks = lesson.tasks.filter(t => t.type === 'grammar');
  const listeningTasks = lesson.tasks.filter(t => t.type === 'listening');
  const speakingTasks = lesson.tasks.filter(t => t.type === 'speaking');

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'lessons', label: 'Lessons', icon: <BookOpen size={15} /> },
    { id: 'grammar', label: 'Grammar', icon: <MessageSquare size={15} />, count: grammarTasks.length },
    { id: 'listening', label: 'Listening', icon: <Headphones size={15} />, count: listeningTasks.length },
    { id: 'speaking', label: 'Speaking', icon: <MessageSquare size={15} />, count: speakingTasks.length },
    { id: 'vocabulary', label: 'Vocab', icon: <Layers size={15} />, count: lesson.vocabulary.length },
  ];

  const accuracy = dayProgress.accuracy;
  const minutesDone = dayProgress.totalMinutes;
  const completedTasks = dayProgress.completedTasks;

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader
        state={state}
        onMasterReset={handleMasterReset}
        onWeekReset={handleWeekReset}
        onNextDay={handleNextDay}
      />

      {/* Lesson banner */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-widest">
                Week {state.currentWeek} · Day {state.currentDay}
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
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, (minutesDone / 90) * 100)}%` }} />
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
          <VideoSection
            videos={lesson.videos}
            onWatchMinutes={handleVideoWatch}
          />
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
