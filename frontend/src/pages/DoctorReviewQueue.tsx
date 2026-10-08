import { useQuery } from '@tanstack/react-query';
import { getQueueSizeDashboardStudiesQueueGet } from '../client';
import { AppShell } from '../components/AppShell';

export function DoctorReviewQueue() {
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['queueSize'],
    queryFn: () => getQueueSizeDashboardStudiesQueueGet()
  });

  const awaitingDoctor = queueData?.data?.awaiting_sign_off ?? 0;

  return (
    <AppShell userRole="doctor" userName="Dr. Arti Sharma">
      <div className="flex flex-col w-full">
        <section className="flex flex-col gap-space-md mb-space-lg">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Review Queue</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Pending studies requiring doctor sign-off.</p>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Awaiting Review</span>
              <span className="font-mono-data-lg text-2xl font-bold text-primary">{isLoading ? '-' : awaitingDoctor}</span>
            </div>
          </div>
        </section>
        
        <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">inbox</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Queue is empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            There are currently no studies to display here.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
