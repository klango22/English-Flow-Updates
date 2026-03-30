import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ExternalLink, Clock, AlertTriangle, Timer, Loader2, Youtube } from 'lucide-react';
import type { VideoItem } from '@/lib/syllabus';
import { ENGLISHBAY_PLAYLIST_URL } from '@/lib/syllabus';

// ─── YouTube IFrame API singleton ────────────────────────────────────────────
// The YT script must only be injected once per page. We store load state in
// module scope so all VideoEmbed instances share it.

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onError?: (e: { data: number; target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  destroy(): void;
  stopVideo(): void;
}

let ytReady = false;
const ytCallbacks: Array<() => void> = [];

function loadYTApi(): Promise<void> {
  return new Promise((resolve) => {
    if (ytReady) { resolve(); return; }
    ytCallbacks.push(resolve);

    // Only inject the script tag once
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
}

// YouTube calls this globally when the API is ready
window.onYouTubeIframeAPIReady = () => {
  ytReady = true;
  ytCallbacks.forEach(cb => cb());
  ytCallbacks.length = 0;
};

// ─── Error code meanings ─────────────────────────────────────────────────────
function embedErrorMessage(code: number): string {
  if (code === 101 || code === 150) return 'The video owner has disabled embedding.';
  if (code === 100)                  return 'Video not found or marked private.';
  if (code === 2)                    return 'Invalid video ID.';
  return `YouTube player error (code ${code}).`;
}

// ─── VideoEmbed component ────────────────────────────────────────────────────

type EmbedStatus = 'idle' | 'loading' | 'playing' | 'blocked' | 'error';

interface VideoEmbedProps {
  video: VideoItem;
  onWatchMinutes: (m: number) => void;
}

function VideoEmbed({ video, onWatchMinutes }: VideoEmbedProps) {
  const [status, setStatus] = useState<EmbedStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const watchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchStartRef = useRef<number | null>(null);

  // ── Watch timer helpers ────────────────────────────────────────────────────

  const startWatchTimer = useCallback(() => {
    if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    watchStartRef.current = Date.now();

    watchTimerRef.current = setInterval(() => {
      if (watchStartRef.current === null) return;
      const elapsed = Math.floor((Date.now() - watchStartRef.current) / 60_000);
      if (elapsed >= 1) {
        onWatchMinutes(elapsed);
        watchStartRef.current = Date.now();
      }
    }, 15_000);
  }, [onWatchMinutes]);

  const stopWatchTimer = useCallback(() => {
    if (watchTimerRef.current) { clearInterval(watchTimerRef.current); watchTimerRef.current = null; }
    if (watchStartRef.current !== null) {
      const partialMs = Date.now() - watchStartRef.current;
      if (partialMs >= 30_000) onWatchMinutes(1); // credit partial minute ≥ 30s
      watchStartRef.current = null;
    }
  }, [onWatchMinutes]);

  // ── Player lifecycle ───────────────────────────────────────────────────────

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopWatchTimer();
    destroyPlayer();
    setStatus('idle');
  }, [stopWatchTimer, destroyPlayer]);

  // Clean up on unmount
  useEffect(() => () => { stopWatchTimer(); destroyPlayer(); }, [stopWatchTimer, destroyPlayer]);

  // ── Play handler: load the YT IFrame API then create a player ─────────────

  const handlePlay = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus('loading');

    try {
      await loadYTApi();
    } catch {
      setStatus('error');
      setErrorMsg('Could not load the YouTube player. Check your connection.');
      return;
    }

    // Give React a tick to render the container div
    await new Promise(r => setTimeout(r, 50));
    if (!containerRef.current) return;

    destroyPlayer();

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: video.youtubeId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        // origin must be the plain domain (not encoded) for the playerVars object
        origin: window.location.origin,
        enablejsapi: 1,
        // Load inside the playlist context so recommended videos match the course
        listType: 'playlist',
        list: video.playlistId ?? '',
      },
      events: {
        onReady: () => {
          setStatus('playing');
          startWatchTimer();
        },
        onStateChange: (e) => {
          if (e.data === 1 /* PLAYING */) {
            startWatchTimer();
          } else if (e.data === 2 /* PAUSED */ || e.data === 0 /* ENDED */) {
            stopWatchTimer();
          }
        },
        onError: (e) => {
          stopWatchTimer();
          if (e.data === 101 || e.data === 150) {
            setStatus('blocked');
            setErrorMsg(embedErrorMessage(e.data));
          } else {
            setStatus('error');
            setErrorMsg(embedErrorMessage(e.data));
          }
        },
      },
    });
  }, [video.youtubeId, video.playlistId, destroyPlayer, startWatchTimer, stopWatchTimer]);

  // ── Watch on YouTube (external) — timer keeps running ─────────────────────

  const handleExternalWatch = useCallback(() => {
    startWatchTimer();
    // Auto-stop crediting after 60 min max (covers longest video)
    setTimeout(stopWatchTimer, 60 * 60_000);
  }, [startWatchTimer, stopWatchTimer]);

  const ytUrl = `https://www.youtube.com/watch?v=${video.youtubeId}${video.playlistId ? `&list=${video.playlistId}` : ''}`;

  // ── Render: blocked / error state ─────────────────────────────────────────

  if (status === 'blocked' || status === 'error') {
    return (
      <div className="aspect-video rounded-xl flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-950/40 to-card border border-amber-500/30 px-6 text-center">
        <AlertTriangle size={30} className="text-amber-400" />
        <div>
          <p className="text-sm font-bold text-foreground mb-1">
            {status === 'blocked' ? 'Embed Blocked by YouTube' : 'Player Error'}
          </p>
          <p className="text-xs text-muted-foreground mb-4">{errorMsg}</p>

          {/* Prominent external link */}
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalWatch}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg"
            data-testid={`btn-yt-external-${video.id}`}
          >
            <Youtube size={16} />
            ⚠️ Play on YouTube (External)
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer size={11} className="text-primary" />
          <span>Your session timer &amp; exercises stay active while you watch</span>
        </div>
        <button onClick={() => setStatus('idle')} className="text-xs text-muted-foreground hover:text-foreground underline">
          ← Back
        </button>
      </div>
    );
  }

  // ── Render: active player ─────────────────────────────────────────────────

  if (status === 'loading' || status === 'playing') {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        {/* YT IFrame API mounts here */}
        <div ref={containerRef} className="w-full h-full" />

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading player…</p>
          </div>
        )}

        {/* Controls overlay — always visible while playing */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleExternalWatch}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-red-700 transition-colors"
            title="Open in YouTube"
          >
            <ExternalLink size={11} /> YouTube
          </a>
          <button
            onClick={handleClose}
            className="px-2 py-1 rounded-lg bg-black/70 text-white text-xs hover:bg-black/90 transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
    );
  }

  // ── Render: idle thumbnail ────────────────────────────────────────────────

  const thumbUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <div className="aspect-video relative rounded-xl overflow-hidden group cursor-pointer border border-primary/20 hover:border-primary/50 transition-colors bg-black"
      onClick={handlePlay}
      data-testid={`video-play-${video.id}`}
      role="button"
      aria-label={`Play: ${video.title}`}
    >
      {/* Real YouTube thumbnail */}
      <img
        src={thumbUrl}
        alt={video.title}
        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />

      {/* Play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-16 h-16 rounded-full bg-primary/85 group-hover:bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-200">
          <Play size={26} className="text-white ml-1.5" fill="currentColor" />
        </div>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-xs text-white font-medium">{video.title}</p>
        </div>
      </div>

      {/* Always-visible YouTube shortcut (does NOT hijack the play button click) */}
      <a
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => { e.stopPropagation(); handleExternalWatch(); }}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-xs hover:bg-red-700 transition-colors z-10"
        data-testid={`btn-yt-shortcut-${video.id}`}
        title="Watch on YouTube"
      >
        <Youtube size={10} /> YouTube
      </a>
    </div>
  );
}

// ─── VideoSection ─────────────────────────────────────────────────────────────

interface Props {
  videos: VideoItem[];
  onWatchMinutes: (minutes: number) => void;
}

export function VideoSection({ videos, onWatchMinutes }: Props) {
  const mainVideo = videos.find(v => v.type === 'englishbay');
  const compVideos = videos.filter(v => v.type === 'complementary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Today's Lessons</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Watch the videos — your 90-min timer runs continuously</p>
        </div>
        <a
          href={ENGLISHBAY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          data-testid="link-englishbay-playlist"
        >
          <ExternalLink size={12} /> Full EnglishBay Playlist
        </a>
      </div>

      {/* Main EnglishBay video */}
      {mainVideo && (
        <div className="rounded-2xl overflow-hidden border border-primary/30 bg-card shadow-lg">
          <VideoEmbed video={mainVideo} onWatchMinutes={onWatchMinutes} />
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{mainVideo.title}</p>
              <p className="text-xs text-primary font-semibold">{mainVideo.topic}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} /> {mainVideo.duration}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${mainVideo.youtubeId}&list=${mainVideo.playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/20 transition-colors font-medium"
              >
                <Youtube size={11} /> ⚠️ Play on YouTube (External)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Complementary videos */}
      {compVideos.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Complementary Practice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {compVideos.map(video => (
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

      {/* Info strip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/8 border border-primary/15">
        <Timer size={16} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold text-foreground">90-Minute Goal — Timer Always Runs</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your session timer counts continuously regardless of where you watch. If a video is embed-blocked,
            click <strong className="text-foreground">⚠️ Play on YouTube (External)</strong> — the timer and
            all 20 exercises remain fully active on this page while you watch in another tab.
          </p>
        </div>
      </div>
    </div>
  );
}
