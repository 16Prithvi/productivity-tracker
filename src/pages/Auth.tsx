import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, Loader2, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import motivationalBg from '@/assets/motivational-bg.png';

const Auth = () => {
  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && displayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters');
      return false;
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please login instead.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Landing view with Get Started
  if (!showForm) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${motivationalBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Header with Get Started buttons */}
        <header className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-white">FocusFlow</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowForm(true); setIsLogin(true); }}
              className="px-5 py-2.5 rounded-xl text-white/80 hover:text-white font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => { setShowForm(true); setIsLogin(false); }}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Spacer to fill the page */}
        <div className="flex-1" />
      </div>
    );
  }

  // Auth Form View
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${motivationalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => setShowForm(false)}
          className="mb-6 text-white/60 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/20 backdrop-blur-sm mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">FocusFlow</h1>
          <p className="text-white/50 mt-1">Your productivity companion</p>
        </div>

        {/* Auth Card */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded-xl transition-colors',
                isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded-xl transition-colors',
                !isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/60 hover:text-white'
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>{isLogin ? 'Login' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;