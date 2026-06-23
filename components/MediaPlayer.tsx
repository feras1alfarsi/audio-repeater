'use client';

import { useRef, useEffect } from 'react';
import { Language, t } from '@/lib/i18n';

interface MediaPlayerProps {
  mediaRef: React.RefObject<HTMLAudioElement | HTMLVideoElement>;
  mediaInfo: { url: string; type: 'audio' | 'video'; name: string } | null;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
}

export function MediaPlayer({ mediaRef, mediaInfo, onLoadedMetadata, onTimeUpdate, onEnded }: MediaPlayerProps) {
  if (!mediaInfo) return null;

  const commonProps = {
    ref: mediaRef as any,
    src: mediaInfo.url,
    onLoadedMetadata,
    onTimeUpdate,
    onEnded,
    controls: true,
    className: 'w-full rounded-lg',
    style: { maxHeight: '50vh' },
  };

  return (
    <div className="w-full">
      {mediaInfo.type === 'video' ? (
        <video {...commonProps} playsInline />
      ) : (
        <audio {...commonProps} />
      )}
    </div>
  );
}