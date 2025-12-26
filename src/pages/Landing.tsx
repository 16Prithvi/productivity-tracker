import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-warning/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          {/* Main Quote */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Do.</span>{' '}
              <span className="text-primary">Or Die.</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground-muted max-w-2xl mx-auto">
              There is no try. Only execution.
            </p>
          </div>

          {/* Compound Effort Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-12 space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg text-foreground-muted uppercase tracking-widest">
                The Power of Small Efforts
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                {/* 1.00 equation */}
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-mono font-bold text-foreground-muted">
                    (1.00)<sup>365</sup>
                  </div>
                  <div className="mt-2 text-3xl md:text-4xl font-bold text-foreground-muted">
                    = 1.00
                  </div>
                  <p className="mt-3 text-sm text-foreground-muted">No growth</p>
                </div>

                {/* VS */}
                <div className="text-2xl font-bold text-foreground-muted">vs</div>

                {/* 1.01 equation */}
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-mono font-bold text-primary">
                    (1.01)<sup>365</sup>
                  </div>
                  <div className="mt-2 text-3xl md:text-4xl font-bold text-success">
                    = 37.7
                  </div>
                  <p className="mt-3 text-sm text-success">37x better in a year</p>
                </div>
              </div>
            </div>

            <p className="text-lg text-foreground-muted max-w-xl mx-auto">
              <span className="text-foreground font-medium">1% improvement daily</span> compounds into extraordinary results.
              Start small. Stay consistent. Become unstoppable.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-6">
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-foreground-muted">
              Free. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Daily Execution System
            </h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Not another analytics dashboard. A focused companion for getting things done.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Focus Timer</h3>
              <p className="text-sm text-foreground-muted">
                Deep work sessions with smart breaks. Stay in the zone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 hover:border-warning/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Timeline View</h3>
              <p className="text-sm text-foreground-muted">
                See your day at a glance. Know exactly what's next.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 hover:border-success/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Study Materials</h3>
              <p className="text-sm text-foreground-muted">
                Link resources to tasks. Everything in context.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4 hover:border-category-dsa/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-category-dsa/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-category-dsa" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI Planning</h3>
              <p className="text-sm text-foreground-muted">
                Let AI help you plan your perfect day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quote */}
      <div className="py-24 px-6 text-center">
        <blockquote className="max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-medium text-foreground italic">
            "The secret of getting ahead is getting started."
          </p>
          <footer className="mt-4 text-foreground-muted">— Mark Twain</footer>
        </blockquote>

        <Button
          onClick={() => navigate('/auth')}
          variant="outline"
          size="lg"
          className="mt-12 h-12 px-6 rounded-xl border-border hover:bg-muted"
        >
          Get Started Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
          <p>Built for focused execution.</p>
          <p>© 2024 Focus Companion</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
