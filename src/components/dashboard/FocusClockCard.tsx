import { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function FocusClockCard() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    }
  };

  const handlePause = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    handlePause();
    setSeconds(0);
  };

  return (
    <div className="card-hover p-4 animate-in" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground-secondary">Focus Clock</h4>
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
      </div>
      
      <div className="text-3xl font-bold text-foreground text-center mb-4 font-mono">
        {formatTime(seconds)}
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-success text-success-foreground hover:bg-success/90 transition-colors"
          >
            <Play className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-warning text-warning-foreground hover:bg-warning/90 transition-colors"
          >
            <Pause className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={handleReset}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary text-foreground-secondary hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
