import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet } from '../client';
import { AppShell } from '../components/AppShell';
import { SkeletonViewer } from '../components/SkeletonViewer';

export function DoctorReviewSignOff() {
  const { id } = useParams<{ id: string }>();

  const { data: resultData, isLoading } = useQuery({
    queryKey: ['studyResult', id],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) } }),
    enabled: !!id
  });

  return (
    <AppShell userRole="doctor" userName="Dr. Arti Sharma">
      <div className="w-full">
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-4">Clinical Sign-Off #{id}</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <h2 className="font-headline-md text-headline-md mb-4">3D Anatomy Viewer</h2>
            <div className="h-[500px] w-full bg-surface-container-high rounded-xl overflow-hidden">
              <SkeletonViewer anatomyData={(resultData?.data as any)?.anatomy} />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
