'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { useRepetition } from '@/hooks/useRepetition';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Language, t } from '@/lib/i18n';
import { FileUploader } from '@/components/FileUploader';
import { RepetitionControls } from '@/components/RepetitionControls';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import { PauseSelector } from '@/components/PauseSelector';
import { ABLoop } from '@/components/ABLoop';
import { MediaPlayer } from '@/components/MediaPlayer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2 w-9 h-9" aria-label="Toggle theme">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="gap-2"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export default function Home() {
  const [lang, setLang] = useLocalStorage<Language>('repeater-lang', 'en');
  const [repeatCount, setRepeatCount] = useLocalStorage<number>('repeater-count', 10);
  const [pauseBetween, setPauseBetween] = useLocalStorage<number>('repeater-pause', 0);
  const [abLoop, setAbLoop] = useState({ active: false, start: 0, end: 0 });
  const [isWaiting, setIsWaiting] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingIncrementRef = useRef(false);

  const {
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
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    formatTime,
    setCurrentTimeDirect,
  } = useMediaPlayer();

  const {
    state: repState,
    start: startRepetition,
    increment: incrementRepetition,
    pause: pauseRepetition,
    resume: resumeRepetition,
    stop: stopRepetition,
  } = useRepetition();

  const stopAll = useCallback(() => {
    stop();
    stopRepetition();
    setIsWaiting(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingIncrementRef.current = false;
  }, [stop, stopRepetition]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      loadFile(file);
      stopAll();
    } else {
      clearMedia();
      stopAll();
    }
  }, [loadFile, clearMedia, stopAll]);

  const handleCycleComplete = useCallback(() => {
    if (!repState.isActive || pendingIncrementRef.current) return;
    
    pendingIncrementRef.current = true;
    incrementRepetition();
    
    if (repState.current + 1 >= repState.total) {
      stopAll();
      pendingIncrementRef.current = false;
      return;
    }

    if (pauseBetween > 0) {
      setIsWaiting(true);
      pause();
      timeoutRef.current = setTimeout(() => {
        setIsWaiting(false);
        if (mediaRef.current) {
          if (abLoop.active) {
            mediaRef.current.currentTime = abLoop.start;
          } else {
            mediaRef.current.currentTime = 0;
          }
          play();
        }
        pendingIncrementRef.current = false;
      }, pauseBetween * 1000);
    } else {
      if (mediaRef.current) {
        if (abLoop.active) {
          mediaRef.current.currentTime = abLoop.start;
        } else {
          mediaRef.current.currentTime = 0;
        }
      }
      play();
      pendingIncrementRef.current = false;
    }
  }, [repState.isActive, repState.current, repState.total, pauseBetween, abLoop, incrementRepetition, play, pause, stopAll, mediaRef]);

  const handleMediaEnded = useCallback(() => {
    handleCycleComplete();
  }, [handleCycleComplete]);

  const handlePlay = useCallback(() => {
    if (!mediaRef.current || !isReady) return;
    
    stopAll();
    startRepetition(repeatCount);
    
    if (abLoop.active) {
      mediaRef.current.currentTime = abLoop.start;
      setCurrentTimeDirect(abLoop.start);
    }
    
    play();
  }, [mediaRef, isReady, repeatCount, abLoop, startRepetition, play, stopAll, setCurrentTimeDirect]);

  const handleTimeUpdateWithLoop = useCallback(() => {
    handleTimeUpdate();
    
    if (abLoop.active && mediaRef.current && abLoop.end > abLoop.start) {
      if (mediaRef.current.currentTime >= abLoop.end) {
        mediaRef.current.currentTime = abLoop.start;
        handleCycleComplete();
      }
    }
  }, [handleTimeUpdate, abLoop, mediaRef, handleCycleComplete]);

  const handlePause = useCallback(() => {
    pause();
    pauseRepetition();
  }, [pause, pauseRepetition]);

  const handleResume = useCallback(() => {
    if (isWaiting && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setIsWaiting(false);
      pendingIncrementRef.current = false;
      
      if (mediaRef.current) {
        if (abLoop.active) {
          mediaRef.current.currentTime = abLoop.start;
        } else {
          mediaRef.current.currentTime = 0;
        }
        play();
      }
    } else {
      play();
      resumeRepetition();
    }
  }, [isWaiting, abLoop, play, resumeRepetition, mediaRef]);

  const handleRestart = useCallback(() => {
    stopAll();
    handlePlay();
  }, [stopAll, handlePlay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar' : 'en';
  }, [isRTL]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t(lang, 'title')}</h1>
          <p className="text-muted-foreground">{t(lang, 'subtitle')}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-full w-fit mx-auto">
            <Shield className="h-4 w-4" />
            {t(lang, 'privacy')}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <LanguageSwitcher currentLang={lang} onLanguageChange={setLang} />
          <ThemeToggle />
        </div>

        <FileUploader
          onFileSelect={handleFileSelect}
          mediaInfo={mediaInfo}
          lang={lang}
          formatTime={formatTime}
        />

        {mediaInfo && (
          <MediaPlayer
            mediaRef={mediaRef}
            mediaInfo={mediaInfo}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdateWithLoop}
            onEnded={handleMediaEnded}
          />
        )}

        {mediaInfo && (
          <RepetitionControls
            lang={lang}
            repeatCount={repeatCount}
            onRepeatCountChange={setRepeatCount}
            isPlaying={isPlaying}
            isPaused={repState.isPaused || isWaiting}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onStop={stopAll}
            onRestart={handleRestart}
            disabled={!isReady}
          />
        )}

        {mediaInfo && (
          <PauseSelector
            lang={lang}
            selectedPause={pauseBetween}
            onPauseChange={setPauseBetween}
            disabled={isPlaying && !repState.isPaused}
          />
        )}

        {mediaInfo && mediaInfo.duration > 0 && (
          <ABLoop
            lang={lang}
            currentTime={currentTime}
            duration={mediaInfo.duration}
            isActive={abLoop.active}
            startTime={abLoop.start}
            endTime={abLoop.end}
            onSetStart={() => {
              if (mediaRef.current) {
                setAbLoop(prev => ({ ...prev, start: mediaRef.current!.currentTime }));
              }
            }}
            onSetEnd={() => {
              if (mediaRef.current) {
                setAbLoop(prev => ({ ...prev, end: mediaRef.current!.currentTime }));
              }
            }}
            onToggle={(active) => setAbLoop(prev => ({ ...prev, active }))}
            onStartTimeChange={(time) => setAbLoop(prev => ({ ...prev, start: time }))}
            onEndTimeChange={(time) => setAbLoop(prev => ({ ...prev, end: time }))}
            formatTime={formatTime}
          />
        )}

        <ProgressDisplay
          lang={lang}
          current={repState.current}
          total={repState.total}
          remaining={repState.remaining}
          progress={repState.progress}
          elapsedMs={repState.elapsedMs}
          estimatedRemainingMs={repState.estimatedRemainingMs}
          isActive={repState.isActive}
        />

        {isWaiting && (
          <div className="text-center py-4 text-muted-foreground animate-pulse">
            {pauseBetween} {t(lang, 'seconds')}...
          </div>
        )}
      </div>
    </main>
  );
}