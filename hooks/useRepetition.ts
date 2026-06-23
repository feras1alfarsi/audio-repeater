import { useState, useCallback, useRef, useEffect } from 'react';

interface RepetitionState {
  current: number;
  total: number;
  remaining: number;
  isActive: boolean;
  isPaused: boolean;
  progress: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export function useRepetition() {
  const [state, setState] = useState<RepetitionState>({
    current: 0,
    total: 1,
    remaining: 1,
    isActive: false,
    isPaused: false,
    progress: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
  });

  const totalRef = useRef(1);
  const currentRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const totalPausedMs = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((total: number) => {
    totalRef.current = total;
    currentRef.current = 0;
    startTimeRef.current = Date.now();
    totalPausedMs.current = 0;
    
    setState({
      current: 0,
      total,
      remaining: total,
      isActive: true,
      isPaused: false,
      progress: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
    });
  }, []);

  const increment = useCallback(() => {
    currentRef.current += 1;
    const current = currentRef.current;
    const total = totalRef.current;
    const elapsed = Date.now() - startTimeRef.current - totalPausedMs.current;
    
    let estimatedRemaining = 0;
    if (current > 0) {
      const avgTimePerRep = elapsed / current;
      estimatedRemaining = avgTimePerRep * (total - current);
    }

    setState({
      current,
      total,
      remaining: total - current,
      isActive: true,
      isPaused: false,
      progress: Math.round((current / total) * 100),
      elapsedMs: elapsed,
      estimatedRemainingMs: estimatedRemaining,
    });
  }, []);

  const pause = useCallback(() => {
    pauseStartRef.current = Date.now();
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    if (pauseStartRef.current > 0) {
      totalPausedMs.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
    }
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      current: 0,
      total: totalRef.current,
      remaining: totalRef.current,
      isActive: false,
      isPaused: false,
      progress: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
    });
  }, []);

  const updateElapsed = useCallback(() => {
    if (!state.isActive || state.isPaused) return;
    const elapsed = Date.now() - startTimeRef.current - totalPausedMs.current;
    let estimatedRemaining = 0;
    if (currentRef.current > 0) {
      const avgTimePerRep = elapsed / currentRef.current;
      estimatedRemaining = avgTimePerRep * (totalRef.current - currentRef.current);
    }
    setState(prev => ({
      ...prev,
      elapsedMs: elapsed,
      estimatedRemainingMs: estimatedRemaining,
    }));
  }, [state.isActive, state.isPaused]);

  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(updateElapsed, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [state.isActive, state.isPaused, updateElapsed]);

  return {
    state,
    start,
    increment,
    pause,
    resume,
    stop,
  };
}