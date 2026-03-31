import { Flame, Star, Zap, RotateCcw, Trash2, ChevronRight, CalendarDays, LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { AppState, getCurrentDayProgress, canAdvanceToNextLesson } from '@/lib/store';
import type { CalendarSync } from '@/lib/store';
import { SyncIndicator } from '@/components/SyncIndicator';
import type { SyncStatus } from '@/hooks/useAppState';
import type { AuthUser } from '@workspace/replit-auth-web';

interface Props {
  state: AppState;
  calendarSync: CalendarSync;
  isViewingCatchUpDay: boolean;
  user: AuthUser | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  syncStatus: SyncStatus;
  onMasterReset: () => void;
  onWeekReset: () => void;
  onNextDay: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function ProgressHeader({
  state, calendarSync, isViewingCatchUpDay,
  user, authLoading, isAuthenticated, syncStatus,
  onMasterReset, onWeekReset, onNextDay, onLogin, onLogout,
}: Props) {
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [confirmMaster, setConfirmMaster] = useState(false);
  const [confirmWeek, setConfirmWeek] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dayProg       = getCurrentDayProgress(state);
  const canAdvance    = canAdvanceToNextLesson(state);
  const minutePercent = Math.min(100, (dayProg.totalMinutes / 90) * 100);
  const journeyDay    = calendarSync.absoluteDay + 1;

  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'User'
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">

        {/* Brand */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-none">EnglishFlow</p>
            <div className="flex items-center gap-1 mt-0.5">
              <CalendarDays size={10} className="text-primary" />
              <p className="text-[10px] text-primary font-semibold">
                Day {journeyDay} · Week {calendarSync.calendarWeek}
              </p>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Flame size={14} className="text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{state.streak}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">streak</span>
        </div>

        {/* Total XP */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Star size={14} className="text-primary" />
          <span className="text-sm font-bold text-primary">{state.totalXP.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">XP</span>
        </div>

        {/* Daily progress bar */}
        <div className="flex-1 min-w-[200px] hidden md:block">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              {isViewingCatchUpDay
                ? `Catch-up: Day ${state.currentDay} (Wk ${state.currentWeek})`
                : 'Daily Goal'}
            </span>
            <span>{dayProg.totalMinutes}/90 min · {dayProg.accuracy}% accuracy</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${minutePercent}%`,
                background: isViewingCatchUpDay
                  ? 'linear-gradient(90deg, hsl(38 92% 50%), hsl(38 92% 65%))'
                  : undefined,
              }}
            />
          </div>
        </div>

        {/* Tasks badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{dayProg.completedTasks.length}</span>
          <span>/20 tasks</span>
        </div>

        {/* Sync status */}
        {isAuthenticated && <SyncIndicator status={syncStatus} />}

        {/* Next Lesson */}
        {canAdvance && !isViewingCatchUpDay && (
          <button
            onClick={onNextDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            data-testid="button-next-lesson"
          >
            Next Lesson <ChevronRight size={12} />
          </button>
        )}

        {/* User / Auth button */}
        {!authLoading && (
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { setShowUserMenu(v => !v); setShowResetMenu(false); }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="User menu"
                  data-testid="btn-user-menu"
                >
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User size={13} className="text-muted-foreground" />
                  )}
                  <span className="text-xs text-foreground font-medium max-w-[80px] truncate hidden sm:block">
                    {userName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                      {user?.email && <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>}
                    </div>
                    <button
                      onClick={() => { onLogout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors text-left text-destructive"
                      data-testid="btn-logout"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                data-testid="btn-login"
              >
                <LogIn size={13} /> Log in
              </button>
            )}
          </div>
        )}

        {/* Reset Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowResetMenu(v => !v); setConfirmMaster(false); setConfirmWeek(false); setShowUserMenu(false); }}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-reset-menu"
            aria-label="Reset options"
          >
            <RotateCcw size={14} />
          </button>

          {showResetMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              {!confirmWeek ? (
                <button
                  onClick={() => setConfirmWeek(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
                  data-testid="button-reset-week"
                >
                  <RotateCcw size={14} className="text-amber-400" /> Reset Current Week
                </button>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-2">Reset Week {state.currentWeek}?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onWeekReset(); setShowResetMenu(false); setConfirmWeek(false); }}
                      className="flex-1 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30">Yes, Reset</button>
                    <button onClick={() => setConfirmWeek(false)}
                      className="flex-1 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">Cancel</button>
                  </div>
                </div>
              )}

              <div className="h-px bg-border" />

              {!confirmMaster ? (
                <button
                  onClick={() => setConfirmMaster(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors text-left text-destructive"
                  data-testid="button-reset-master"
                >
                  <Trash2 size={14} /> Reset All Progress
                </button>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-destructive mb-2">This clears everything. Are you sure?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onMasterReset(); setShowResetMenu(false); }}
                      className="flex-1 py-1.5 text-xs bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30">Yes, Erase All</button>
                    <button onClick={() => setConfirmMaster(false)}
                      className="flex-1 py-1.5 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lock notice */}
      {!canAdvance && !isViewingCatchUpDay && (
        <div className="text-center text-xs text-muted-foreground py-1.5 bg-muted/30 border-t border-border/50">
          Complete 90 min study time and achieve &gt;80% accuracy to unlock the next lesson
        </div>
      )}
    </header>
  );
}
