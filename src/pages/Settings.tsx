import { useState, useEffect } from 'react';
import { Palette, Clock, Bell, Zap, Download, Upload, LogOut, Moon, Flame, Coffee, RefreshCw, Waves, Trees } from 'lucide-react';
import { AppLayout, Header } from '@/components/layout';
import { useThemeStore } from '@/stores/themeStore';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const { profile, updateProfile, loading } = useProfile();
  const { signOut } = useAuth();
  
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [notifications, setNotifications] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [smartBreaks, setSmartBreaks] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  // Load profile settings
  useEffect(() => {
    if (profile) {
      setFocusDuration(profile.focus_duration);
      setBreakDuration(profile.break_duration);
      setAiEnabled(profile.ai_enabled);
      setSmartBreaks(profile.smart_breaks_enabled);
      setDailyReminder(profile.daily_review_reminder);
    }
  }, [profile]);

  const handleSaveTimerSettings = async () => {
    const result = await updateProfile({
      focus_duration: focusDuration,
      break_duration: breakDuration,
    });
    if (result) {
      toast.success('Timer settings saved');
    }
  };

  const handleToggleAI = async () => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    await updateProfile({ ai_enabled: newValue });
    toast.success(`AI features ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSmartBreaks = async () => {
    const newValue = !smartBreaks;
    setSmartBreaks(newValue);
    await updateProfile({ smart_breaks_enabled: newValue });
    toast.success(`Smart breaks ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleToggleDailyReminder = async () => {
    const newValue = !dailyReminder;
    setDailyReminder(newValue);
    await updateProfile({ daily_review_reminder: newValue });
    toast.success(`Daily review reminder ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  return (
    <AppLayout>
      <Header title="Settings" />

      <div className="p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Theme Selection */}
          <section className="card-hover p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Theme</h2>
                <p className="text-sm text-foreground-muted">Choose your visual style</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Focus Theme */}
              <button
                onClick={() => setTheme('focus')}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all',
                  theme === 'focus'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-subtle hover:border-border'
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#ef4444] flex items-center justify-center">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Focus Mode</p>
                    <p className="text-xs text-foreground-muted">Black + Red</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#0f0f10] border border-border" />
                  <div className="h-6 w-6 rounded-full bg-[#ef4444]" />
                  <div className="h-6 w-6 rounded-full bg-[#1a1a1e]" />
                </div>
                {theme === 'focus' && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Calm Theme */}
              <button
                onClick={() => setTheme('calm')}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all',
                  theme === 'calm'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-subtle hover:border-border'
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#db2777] flex items-center justify-center">
                    <Moon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Calm Mode</p>
                    <p className="text-xs text-foreground-muted">Grey + Dark Pink</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#141418] border border-border" />
                  <div className="h-6 w-6 rounded-full bg-[#db2777]" />
                  <div className="h-6 w-6 rounded-full bg-[#1e1e24]" />
                </div>
                {theme === 'calm' && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Ocean Theme */}
              <button
                onClick={() => setTheme('ocean')}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all',
                  theme === 'ocean'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-subtle hover:border-border'
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#06b6d4] flex items-center justify-center">
                    <Waves className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Ocean Mode</p>
                    <p className="text-xs text-foreground-muted">Deep Blue + Cyan</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#0d1117] border border-border" />
                  <div className="h-6 w-6 rounded-full bg-[#06b6d4]" />
                  <div className="h-6 w-6 rounded-full bg-[#161b22]" />
                </div>
                {theme === 'ocean' && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Forest Theme */}
              <button
                onClick={() => setTheme('forest')}
                className={cn(
                  'relative p-4 rounded-2xl border-2 transition-all',
                  theme === 'forest'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-subtle hover:border-border'
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#10b981] flex items-center justify-center">
                    <Trees className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Forest Mode</p>
                    <p className="text-xs text-foreground-muted">Dark Green + Emerald</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#0d1210] border border-border" />
                  <div className="h-6 w-6 rounded-full bg-[#10b981]" />
                  <div className="h-6 w-6 rounded-full bg-[#141f1a]" />
                </div>
                {theme === 'forest' && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* Timer Settings */}
          <section className="card-hover p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Timer Settings</h2>
                <p className="text-sm text-foreground-muted">Configure your focus sessions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground-secondary block mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  min={5}
                  max={120}
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground-secondary block mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-border-subtle text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <button
              onClick={handleSaveTimerSettings}
              className="btn-primary mt-4"
            >
              Save Timer Settings
            </button>
          </section>

          {/* AI Features */}
          <section className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Planning</h2>
                  <p className="text-sm text-foreground-muted">Smart scheduling and daily summaries</p>
                </div>
              </div>
              <button
                onClick={handleToggleAI}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  aiEnabled ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    aiEnabled ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          </section>

          {/* Smart Break Suggestions */}
          <section className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Smart Break Suggestions</h2>
                  <p className="text-sm text-foreground-muted">Get break tips based on focus duration</p>
                </div>
              </div>
              <button
                onClick={handleToggleSmartBreaks}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  smartBreaks ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    smartBreaks ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          </section>

          {/* Daily Review Reminder */}
          <section className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Daily Review Reminder</h2>
                  <p className="text-sm text-foreground-muted">Remind to review tasks at end of day</p>
                </div>
              </div>
              <button
                onClick={handleToggleDailyReminder}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  dailyReminder ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    dailyReminder ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                  <p className="text-sm text-foreground-muted">Get reminded about your tasks</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  notifications ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    notifications ? 'left-6' : 'left-1'
                  )}
                />
              </button>
            </div>
          </section>

          {/* Data Management */}
          <section className="card-hover p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
                <p className="text-sm text-foreground-muted">Export or import your data</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn-secondary flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
              </button>
            </div>
          </section>

          {/* Logout */}
          <section className="card-hover p-6 border-destructive/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-destructive hover:opacity-80 transition-opacity"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
