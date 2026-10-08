import { AppShell } from '../components/AppShell';

export function LongitudinalComparison() {
  return (
    <AppShell userRole="doctor" userName="Dr. Arti Sharma">
      <div className="w-full">
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-4">Longitudinal Comparison</h1>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">Comparison viewer placeholder.</p>
        </div>
      </div>
    </AppShell>
  );
}
