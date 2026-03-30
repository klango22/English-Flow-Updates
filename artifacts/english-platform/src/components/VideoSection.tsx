import { useState } from 'react';
import { Play, ExternalLink, Clock } from 'lucide-react';
import type { VideoItem } from '@/lib/syllabus';

interface Props {
  videos: VideoItem[];
  onWatchMinutes: (minutes: number) => void;
}

export function VideoSection({ videos, onWatchMinutes }: Props) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  const handleWatch = (video: VideoItem) => {
    setActiveVideo(video);
    if (!watchedIds.has(video.id)) {
      setWatchedIds(prev => new Set([...prev, video.id]));
      const mins = parseInt(video.duration.split(' ')[0]) || 30;
      onWatchMinutes(Math.round(mins * 0.6));
    }
  };

  const englishBayVideo = videos.find(v => v.type === 'englishbay');
  const complementaryVideos = videos.filter(v => v.type === 'complementary');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Today's Lessons</h2>
        <a
          href="https://www.youtube.com/playlist?list=PLZ65xj2SRHQB0T2GGk-R7bYxorKUkcyoj"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
          data-testid="link-englishbay-playlist"
        >
          <ExternalLink size={12} />
          EnglishBay Playlist
        </a>
      </div>

      {/* Main EnglishBay video */}
      {englishBayVideo && (
        <div className="rounded-2xl overflow-hidden border border-primary/30 bg-card">
          <div className="relative aspect-video bg-black">
            {activeVideo?.id === englishBayVideo.id ? (
              <iframe
                src={`https://www.youtube.com/embed/${englishBayVideo.youtubeId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={englishBayVideo.title}
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer group bg-gradient-to-br from-primary/20 to-card"
                onClick={() => handleWatch(englishBayVideo)}
                data-testid={`video-${englishBayVideo.id}`}
              >
                <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center group-hover:bg-primary transition-colors mb-3 shadow-lg">
                  <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <p className="text-sm font-bold text-foreground">{englishBayVideo.title}</p>
                <p className="text-xs text-muted-foreground mt-1">EnglishBay · {englishBayVideo.duration}</p>
              </div>
            )}
            {watchedIds.has(englishBayVideo.id) && activeVideo?.id !== englishBayVideo.id && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/90 text-xs font-bold text-white">
                Watched
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{englishBayVideo.title}</p>
                <p className="text-xs text-primary font-medium">Main EnglishBay Video</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                {englishBayVideo.duration}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complementary videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {complementaryVideos.map(video => (
          <div
            key={video.id}
            className="rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => handleWatch(video)}
            data-testid={`video-${video.id}`}
          >
            {activeVideo?.id === video.id ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-muted/50 to-card flex flex-col items-center justify-center group">
                <div className="w-10 h-10 rounded-full bg-primary/60 flex items-center justify-center group-hover:bg-primary/80 transition-colors mb-2">
                  <Play size={16} className="text-primary-foreground ml-0.5" fill="currentColor" />
                </div>
                <p className="text-xs text-muted-foreground px-3 text-center line-clamp-2">{video.title}</p>
              </div>
            )}
            <div className="px-3 py-2 border-t border-border/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[140px]">{video.title}</p>
                <p className="text-[10px] text-muted-foreground">{video.topic}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  {video.duration}
                </div>
                {watchedIds.has(video.id) && (
                  <span className="text-[10px] text-emerald-400 font-bold">Watched</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
