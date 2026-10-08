import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet, listStudiesStudiesGet, compareStudiesStudiesIdCompareOtherIdPost } from '../client';
import { AppShell } from '../components/AppShell';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function LongitudinalComparison() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [otherId, setOtherId] = useState<string>('');

  const { data: respCurrent } = useQuery({
    queryKey: ['studyResult', id],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) } }),
    enabled: !!id
  });
  
  const currentData = respCurrent?.data as any;

  const { data: respSeries } = useQuery({
    queryKey: ['series', currentData?.patient?.id],
    queryFn: () => listStudiesStudiesGet({ 
      query: { patient_id: currentData.patient.id, body_part: currentData.study.body_part, size: 50 } 
    }),
    enabled: !!currentData?.patient?.id
  });

  const seriesStudies = respSeries?.data?.items?.filter(s => s.id !== parseInt(id!)) || [];

  const compareMutation = useMutation({
    mutationFn: (other_id: number) => compareStudiesStudiesIdCompareOtherIdPost({ path: { id: parseInt(id!), other_id } })
  });

  const handleCompare = () => {
    if (otherId) {
      compareMutation.mutate(parseInt(otherId));
    }
  };

  return (
    <AppShell userRole="doctor" userName="Dr. Arti Sharma">
      <div className="flex flex-col w-full gap-4 pb-8">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Longitudinal Comparison</h1>
            <p className="text-sm text-on-surface-variant">Compare current study STU-{id} with previous acquisitions.</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-sm font-semibold flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Current Study (T-1)</h2>
            {currentData ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-surface-container-low p-3 rounded">
                  <span className="font-bold">STU-{currentData.study.id}</span>
                  <span className="text-sm">{new Date(currentData.study.created_at).toLocaleDateString()}</span>
                </div>
                <img src={`${BASE_URL}/studies/${id}/image.png`} className="w-full h-auto bg-black rounded" />
              </div>
            ) : <p>Loading current study...</p>}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Baseline Study (T-0)</h2>
            <div className="flex items-center gap-2 mb-4">
              <select className="flex-1 h-10 px-3 bg-surface-container-low rounded border-none focus:ring-2 focus:ring-primary text-sm outline-none" value={otherId} onChange={e => setOtherId(e.target.value)}>
                <option value="">Select previous study to compare...</option>
                {seriesStudies.map(s => (
                  <option key={s.id} value={s.id}>STU-{s.id} - {new Date(s.created_at).toLocaleDateString()}</option>
                ))}
              </select>
              <button 
                onClick={handleCompare} 
                disabled={!otherId || compareMutation.isPending}
                className="px-4 py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary-container disabled:opacity-50"
              >
                {compareMutation.isPending ? 'Processing...' : 'Compare'}
              </button>
            </div>
            
            {otherId && (
              <img src={`${BASE_URL}/studies/${otherId}/image.png`} className="w-full h-auto bg-black rounded" />
            )}
          </div>
        </div>

        {compareMutation.isSuccess && (
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Comparison Results</h2>
            <pre className="bg-surface-container-low p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(compareMutation.data.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AppShell>
  );
}
