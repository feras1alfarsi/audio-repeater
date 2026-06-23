'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Language, t } from '@/lib/i18n';
import { Scissors, Play, Pause, SkipBack, SkipForward, Clock, RotateCcw } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ABLoopProps {
  lang: Language;
  currentTime: number;
  duration: number;
  isActive: boolean;
  startTime: number;
  endTime: number;
  onSetStart: () => void;
  onSetEnd: () => void;
  onToggle: (active: boolean) => void;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  formatTime: (seconds: number) => string;
}

export function ABLoop({
  lang,
  currentTime,
  duration,
  isActive,
  startTime,
  endTime,
  onSetStart,
  onSetEnd,
  onToggle,
  onStartTimeChange,
  onEndTimeChange,
  formatTime,
}: ABLoopProps) {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = clamp((x / rect.width) * 100, 0, 100);
    const time = (percent / 100) * duration;

    // Snap to nearest handle if close, otherwise set based on which side
    const startDist = Math.abs(percent - startPercent);
    const endDist = Math.abs(percent - endPercent);

    if (startDist < endDist) {
      onStartTimeChange(clamp(time, 0, endTime - 0.5));
    } else {
      onEndTimeChange(clamp(time, startTime + 0.5, duration));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current || duration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = clamp((x / rect.width) * 100, 0, 100);
    const time = (percent / 100) * duration;

    if (isDragging === 'start') {
      onStartTimeChange(clamp(time, 0, endTime - 0.5));
    } else {
      onEndTimeChange(clamp(time, startTime + 0.5, duration));
    }
  };

  const handleMouseUp = () => setIsDragging(null);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const isInLoop = isActive && currentTime >= startTime && currentTime <= endTime;

  return (
    <Card className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{t(lang, 'abLoop')}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full transition-colors ${
            isActive 
              ? 'bg-emerald-500/15 text-emerald-500' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {isActive ? t(lang, 'active') : 'OFF'}
          </span>
          <Switch 
            checked={isActive} 
            onCheckedChange={onToggle}
            aria-label="Toggle AB Loop"
          />
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{formatTime(0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div
          ref={timelineRef}
          className="relative h-12 bg-muted/50 rounded-xl cursor-crosshair select-none overflow-hidden"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-muted/30" />
          
          {/* Full duration bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-muted rounded-full mx-3" />
          
          {/* Active loop region */}
          <div
            className="absolute top-1/2 h-3 -translate-y-1/2 bg-primary/20 rounded-md border-2 border-primary/40 transition-all"
            style={{
              left: `calc(${startPercent}% + 12px)`,
              right: `calc(${100 - endPercent}% + 12px)`,
            }}
          />
          
          {/* Current position indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10 transition-all"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
          </div>

          {/* Start handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 cursor-ew-resize group"
            style={{ left: `calc(${startPercent}% - 10px)` }}
            onMouseDown={(e) => { e.stopPropagation(); setIsDragging('start'); }}
          >
            <div className="w-5 h-8 bg-primary rounded-lg shadow-lg flex items-center justify-center border-2 border-background hover:scale-110 transition-transform">
              <SkipBack className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary font-medium whitespace-nowrap">
              A
            </div>
          </div>

          {/* End handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 cursor-ew-resize group"
            style={{ left: `calc(${endPercent}% - 10px)` }}
            onMouseDown={(e) => { e.stopPropagation(); setIsDragging('end'); }}
          >
            <div className="w-5 h-8 bg-primary rounded-lg shadow-lg flex items-center justify-center border-2 border-background hover:scale-110 transition-transform">
              <SkipForward className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary font-medium whitespace-nowrap">
              B
            </div>
          </div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {t(lang, 'startTime')}
            </Label>
            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">A</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={formatTime(startTime)}
                onChange={(e) => {
                  const parts = e.target.value.split(':').map(Number);
                  let secs = 0;
                  if (parts.length === 2) secs = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
                  onStartTimeChange(clamp(secs || 0, 0, endTime - 0.5));
                }}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={onSetStart}
              className="h-10 px-3 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t(lang, 'setStart')}
            </Button>
          </div>
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {t(lang, 'endTime')}
            </Label>
            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">B</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={formatTime(endTime)}
                onChange={(e) => {
                  const parts = e.target.value.split(':').map(Number);
                  let secs = 0;
                  if (parts.length === 2) secs = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) secs = parts[0] * 3600 + parts[1] * 60 + parts[2];
                  onEndTimeChange(clamp(secs || duration, startTime + 0.5, duration));
                }}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={onSetEnd}
              className="h-10 px-3 gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t(lang, 'setEnd')}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Status */}
      {isActive && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isInLoop ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isInLoop 
              ? `Looping: ${formatTime(startTime)} → ${formatTime(endTime)}` 
              : `Waiting to enter loop at ${formatTime(startTime)}...`}
          </span>
          {isInLoop && (
            <div className="ml-auto flex items-center gap-1 text-xs font-mono text-emerald-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              LIVE
            </div>
          )}
        </div>
      )}
    </Card>
  );
}