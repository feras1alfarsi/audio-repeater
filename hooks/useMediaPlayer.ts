import { useRef, useState, useCallback, useEffect } from 'react';

interface MediaInfo {
  name: string;
  size: string;
  duration: number;
  type: 'audio' | 'video';
  url: string;
}

export function useMediaPlayer() {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'audio';
    
    setMediaInfo({
      name: file.name,
      size: formatFileSize(file.size),
      duration: 0,
      type,
      url,
    });
    setIsReady(false);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const clearMedia = useCallback(() => {
    if (mediaInfo?.url) {
      URL.revokeObjectURL(mediaInfo.url);
    }
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.src = '';
      mediaRef.current.load();
    }
    setMediaInfo(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsReady(false);
  }, [mediaInfo]);

  const handleLoadedMetadata = useCallback(() => {
    if (mediaRef.current) {
      setMediaInfo(prev => prev ? { ...prev, duration: mediaRef.current!.duration } : null);
      setIsReady(true);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  }, []);

  const play = useCallback(() => {
    mediaRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    mediaRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      mediaRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setCurrentTimeDirect = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaInfo?.url) {
        URL.revokeObjectURL(mediaInfo.url);
      }
    };
  }, [mediaInfo?.url]);

  return {
    mediaRef,
    mediaInfo,
    currentTime,
    isPlaying,
    isReady,
    loadFile,
    clearMedia,
    play,
    pause,
    stop,
    seek,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded: () => setIsPlaying(false),
    formatTime,
    setCurrentTimeDirect,
  };
}