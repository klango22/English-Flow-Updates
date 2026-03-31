import { Cloud, CloudCheck, CloudOff } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useAppState';

export function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'idle') return null;
  return (
    <div className={`flex items-center gap-1 text-[10px] ${
      status === 'syncing' ? 'text-muted-foreground' :
      status === 'saved'   ? 'text-emerald-400'       :
                             'text-destructive'
    }`}>
      {status === 'syncing' && <Cloud size={11} className="animate-pulse" />}
      {status === 'saved'   && <CloudCheck size={11} />}
      {status === 'error'   && <CloudOff size={11} />}
      <span className="hidden sm:inline">
        {status === 'syncing' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Sync failed'}
      </span>
    </div>
  );
}
