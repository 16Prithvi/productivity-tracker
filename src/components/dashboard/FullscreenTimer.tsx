import { useState, useEffect } from 'react';
import { X, Pause, Play, RotateCcw } from 'lucide-react';
import motivationalBg from '@/assets/motivational-bg.png';

interface FullscreenTimerProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  durationMinutes: number;
}

export function FullscreenTimer({ isOpen, onClose, taskTitle, durationMinutes }: FullscreenTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRemainingSeconds(durationMinutes * 60);
      setIsRunning(true);
    }
  }, [isOpen, durationMinutes]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      const id = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    handlePause();
    setRemainingSeconds(durationMinutes * 60);
  };

  if (!isOpen) return null;

  const progress = ((durationMinutes * 60 - remainingSeconds) / (durationMinutes * 60)) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundImage: `url(${motivationalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Timer Box - Top Left Corner */}
      <div className="relative z-10 m-6 max-w-xs">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          {/* Task Title */}
          <h2 className="text-lg font-bold text-white mb-1 truncate">
            {taskTitle}
          </h2>
          <p className="text-white/60 text-sm mb-4">Stay focused. You got this.</p>

          {/* Timer Display */}
          <div className="text-5xl font-bold font-mono text-white tracking-tight mb-4">
            {formatTime(remainingSeconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time completed */}
          <p className="text-white/50 text-xs mb-4">
            {Math.floor((durationMinutes * 60 - remainingSeconds) / 60)}m completed of {durationMinutes}m
          </p>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <Pause className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <Play className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleReset}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Completed Message */}
          {remainingSeconds === 0 && (
            <div className="mt-4 text-center">
              <p className="text-lg font-bold text-green-400 mb-1">🎉 Time's up!</p>
              <p className="text-white/60 text-xs">Great work!</p>
            </div>
          )}
        </div>
      </div>

      {/* Motivational quotes in center */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center px-8">
          <p className="text-6xl font-bold text-white/20 mb-4">
            (1.01)<sup className="text-4xl">365</sup> = 37.7
          </p>
          <p className="text-white/40 text-xl">You don't need massive change. You need consistency.</p>
        </div>
      </div>
    </div>
  );
}
