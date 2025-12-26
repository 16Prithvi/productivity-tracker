import { useFocusSessions } from '@/hooks/useFocusSessions';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

export function WeeklyActivityChart() {
  const { sessions } = useFocusSessions();

  // Calculate focus time per day of the week
  const getWeekData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekData = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMinutes = sessions
        .filter(s => s.started_at.startsWith(dateStr))
        .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      
      return {
        day,
        hours: Math.round(dayMinutes / 60 * 10) / 10,
        isToday: index === today.getDay(),
      };
    });

    return weekData;
  };

  const data = getWeekData();
  const totalHours = data.reduce((acc, d) => acc + d.hours, 0);

  // Colors based on day - using the design palette
  const getBarColor = (index: number, isToday: boolean) => {
    if (isToday) return 'hsl(142, 70%, 45%)'; // success/green
    const colors = [
      'hsl(38, 92%, 50%)',   // warning/orange
      'hsl(38, 92%, 50%)',   // warning/orange
      'hsl(38, 92%, 50%)',   // warning/orange
      'hsl(142, 70%, 45%)',  // success/green
      'hsl(142, 70%, 45%)',  // success/green
      'hsl(200, 80%, 50%)',  // dev/blue
      'hsl(38, 92%, 50%)',   // warning/orange
    ];
    return colors[index];
  };

  return (
    <div className="card-hover p-5 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📊</span>
          <h3 className="text-base font-semibold text-foreground">Weekly Activity Overview</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{totalHours.toFixed(1)}h</span>
          <span className="text-sm text-foreground-muted">Total focus time this week</span>
        </div>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(240, 5%, 55%)', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(240, 5%, 55%)', fontSize: 10 }}
              tickCount={4}
            />
            <Bar 
              dataKey="hours" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(index, entry.isToday)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}