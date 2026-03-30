import { useState, useRef } from 'react';
import { Play, ExternalLink, Clock, AlertCircle, Timer } from 'lucide-react';
import type { VideoItem } from '@/lib/syllabus';
import { ENGLISHBAY_PLAYLIST_URL } from '@/lib/syllabus';

interface Props {
  videos: VideoItem[];
  onWatchMinutes: (minutes: number) => void;
}

interface EmbedState {
  status: 'idle' | 'loading' | 'playing' | 'blocked';
  watchedMinutes: number;
}

function VideoEmbed({ video, onWatchMinutes }: { video: VideoItem; onWatchMinutes: (m: number) => void }) {
  const [embedState, setEmbedState] = useState<EmbedState>({ status: 'idle', watchedMinutes: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startWatchTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 60_000);
      if (elapsed > 0) {
        onWatchMinutes(elapsed);
        startTimeRef.current = Date.now(); // reset so we don't double-count
      }
    }, 15_000); // check every 15s for responsive updates
  };

  const stopWatchTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Credit partial minutes on stop
    if (startTimeRef.current !== null) {
      const partialMs = Date.now() - startTimeRef.current;
      if (partialMs >= 30_000) { // at least 30s = credit 1 min
        onWatchMinutes(1);
      }
      startTimeRef.current = null;
    }
  };

  const handlePlay = () => {
    setEmbedState(prev => ({ ...prev, status: 'loading' }));
    startWatchTimer();
    setTimeout(() => {
      setEmbedState(prev => prev.status === 'loading' ? { ...prev, status: 'playing' } : prev);
    }, 2500);
  };

  const handleStop = () => {
    stopWatchTimer();
    setEmbedState(prev => ({ ...prev, status: 'idle' }));
  };

  const handleEmbedError = () => {
    stopWatchTimer();
    setEmbedState(prev => ({ ...prev, status: 'blocked' }));
  };

  const ytUrl = `https://www.youtube.com/watch?v=${video.youtubeId}${video.playlistId ? `&list=${video.playlistId}` : ''}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

  if (embedState.status === 'playing' || embedState.status === 'loading') {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
          onError={handleEmbedError}
        />
        {embedState.status === 'loading' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-black/90 transition-colors"
            title="Open in YouTube"
          >
            <ExternalLink size={11} /> YouTube
          </a>
          <button
            onClick={handleStop}
            className="px-2 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-black/90 transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
    );
  }

  if (embedState.status === 'blocked') {
    return (
      <div className="aspect-video bg-gradient-to-br from-muted/60 to-card rounded-xl flex flex-col items-center justify-center gap-4 border border-border">
        <AlertCircle size={32} className="text-amber-400" />
        <div className="text-center px-4">
          <p className="text-sm font-semibold text-foreground mb-1">Embed blocked by YouTube</p>
          <p className="text-xs text-muted-foreground mb-3">This video must be watched on YouTube.</p>
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Still credit watch time when they open YouTube
              startWatchTimer();
              setTimeout(() => stopWatchTimer(), 30 * 60_000); // cap at 30 min
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
            data-testid={`link-watch-youtube-${video.id}`}
          >
            <ExternalLink size={14} /> Watch on YouTube
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Timer size={12} className="text-primary" />
          <span>Timer & tasks continue while you watch</span>
        </div>
      </div>
    );
  }

  // Idle — show thumbnail / play button
  return (
    <div
      className="aspect-video bg-gradient-to-br from-primary/15 via-card to-card rounded-xl flex flex-col items-center justify-center cursor-pointer group relative border border-primary/20 hover:border-primary/50 transition-colors"
      onClick={handlePlay}
      data-testid={`video-play-${video.id}`}
      role="button"
      aria-label={`Play ${video.title}`}
    >
      <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center group-hover:bg-primary transition-colors mb-3 shadow-xl group-hover:scale-110 duration-200">
        <Play size={26} className="text-primary-foreground ml-1.5" fill="currentColor" />
      </div>
      <p className="text-sm font-bold text-foreground text-center px-4">{video.title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {video.type === 'englishbay' ? 'EnglishBay' : 'Complementary'} · {video.duration}
      </p>
      <a
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 text-white text-xs hover:bg-black/80 transition-colors"
      >
        <ExternalLink size={10} /> YouTube
      </a>
    </div>
  );
}

export function VideoSection({ videos, onWatchMinutes }: Props) {
  const englishBayVideo = videos.find(v => v.type === 'englishbay');
  const complementaryVideos = videos.filter(v => v.type === 'complementary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Today's Lessons</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Watch the videos — your timer runs while studying</p>
        </div>
        <a
          href={ENGLISHBAY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          data-testid="link-englishbay-playlist"
        >
          <ExternalLink size={12} />
          Full EnglishBay Playlist
        </a>
      </div>

      {/* Main EnglishBay Video */}
      {englishBayVideo && (
        <div className="rounded-2xl overflow-hidden border border-primary/30 bg-card shadow-lg">
          <VideoEmbed video={englishBayVideo} onWatchMinutes={onWatchMinutes} />
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{englishBayVideo.title}</p>
              <p className="text-xs text-primary font-semibold">Main EnglishBay Video · {englishBayVideo.topic}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} /> {englishBayVideo.duration}
            </div>
          </div>
        </div>
      )}

      {/* Complementary Videos */}
      {complementaryVideos.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Complementary Practice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {complementaryVideos.map(video => (
              <div key={video.id} className="rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors">
                <VideoEmbed video={video} onWatchMinutes={onWatchMinutes} />
                <div className="px-3 py-2.5 border-t border-border/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{video.title}</p>
                    <p className="text-[10px] text-muted-foreground">{video.topic}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 ml-2">
                    <Clock size={10} /> {video.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/8 border border-primary/15">
        <Timer size={16} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-foreground">90-Minute Goal</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your session timer runs automatically. If a video is blocked, click "Watch on YouTube" — the timer keeps tracking your study time. Complete all 20 tasks and reach 90 min with &gt;80% accuracy to unlock the next lesson.
          </p>
        </div>
      </div>
    </div>
  );
}
