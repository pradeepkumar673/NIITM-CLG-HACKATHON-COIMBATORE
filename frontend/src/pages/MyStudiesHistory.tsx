import { AppShell } from '../components/AppShell';

export function MyStudiesHistory() {
  return (
    <AppShell userRole="health_worker" userName="Sister Lakshmi Devi">
      <div className="flex flex-col w-full">
        <section className="flex flex-col gap-space-md mb-space-lg">
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">My Studies</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">History of studies uploaded by you.</p>
        </section>
        
        <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">folder_open</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">No studies found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            No historical studies are currently available to view.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
