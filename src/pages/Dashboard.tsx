import { AppLayout, Header } from '@/components/layout';
import { SummaryCards } from '@/components/dashboard';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';

const Dashboard = () => {
  return (
    <AppLayout>
      <Header />
      
      <div className="p-6">
        {/* 2-Column Layout */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - 4/12 width (~35%) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <SummaryCards />
          </div>

          {/* Right Column - 8/12 width (~65%) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="h-[calc(100vh-180px)]">
              <TodayTimeline showAIPlan={true} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
