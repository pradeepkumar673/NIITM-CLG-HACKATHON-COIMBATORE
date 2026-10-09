import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet, listStudiesStudiesGet, compareStudiesStudiesIdCompareOtherIdPost } from '../client';
import { AppShell } from '../components/AppShell';
import { getAuthUser } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function LongitudinalComparison() {
  const authUser = getAuthUser();
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentId, setCurrentId] = useState<string>(paramId || '');
  const [otherId, setOtherId] = useState<string>('');

  const { data: respAll } = useQuery({
    queryKey: ['allStudies_compare'],
    queryFn: () => listStudiesStudiesGet({ query: { size: 100 } }),
    enabled: !paramId
  });
  const allStudies = respAll?.data?.items || [];

  const { data: respCurrent } = useQuery({
    queryKey: ['studyResult', currentId],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(currentId) } }),
    enabled: !!currentId
  });
  
  const currentData = respCurrent?.data as any;

  const { data: respSeries } = useQuery({
    queryKey: ['series', currentData?.patient?.id, currentData?.study?.body_part],
    queryFn: () => listStudiesStudiesGet({ 
      query: { 
        patient_id: currentData?.patient?.id || undefined, 
        body_part: currentData?.study?.body_part, 
        size: 50 
      } 
    }),
    enabled: !!currentData?.study?.body_part
  });

  const seriesStudies = respSeries?.data?.items?.filter(s => s.id !== parseInt(currentId)) || [];

  const compareMutation = useMutation({
    mutationFn: (other_id: number) => compareStudiesStudiesIdCompareOtherIdPost({ path: { id: parseInt(currentId), other_id } })
  });

  const handleCompare = () => {
    if (otherId) {
      compareMutation.mutate(parseInt(otherId));
    }
  };

  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name}>
      <div className="flex flex-col w-full gap-4 pb-8">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Longitudinal Comparison</h1>
            <p className="text-sm text-on-surface-variant">Compare {currentId ? `study STU-${currentId}` : 'a study'} with previous acquisitions.</p>
          </div>
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-sm font-semibold flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Current Study (T-1)</h2>
            
            {!paramId && (
              <select className="h-10 px-3 bg-surface-container-low rounded border-none focus:ring-2 focus:ring-primary text-sm outline-none w-full" value={currentId} onChange={e => { setCurrentId(e.target.value); setOtherId(''); compareMutation.reset(); }}>
                <option value="">Select current study...</option>
                {allStudies.map(s => (
                  <option key={s.id} value={s.id}>STU-{s.id} - {new Date(s.created_at).toLocaleDateString()} {s.patient_ext_ref ? `(${s.patient_ext_ref})` : ''}</option>
                ))}
              </select>
            )}

            {currentData ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between bg-surface-container-low p-3 rounded">
                  <span className="font-bold">STU-{currentData.study.id}</span>
                  <span className="text-sm">{new Date(currentData.study.created_at).toLocaleDateString()}</span>
                </div>
                <img src={`${BASE_URL}/studies/${currentId}/image.png`} className="w-full h-auto bg-black rounded" />
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">{currentId ? 'Loading current study...' : 'Please select a study above.'}</p>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Baseline Study (T-0)</h2>
            <div className="flex items-center gap-2 mb-4">
              <select className="flex-1 h-10 px-3 bg-surface-container-low rounded border-none focus:ring-2 focus:ring-primary text-sm outline-none" value={otherId} onChange={e => setOtherId(e.target.value)} disabled={!currentId}>
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

        {compareMutation.isSuccess && !!compareMutation.data?.data && (() => {
          const comparisonData = compareMutation.data.data as any;
          return (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col gap-6 mt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Comparison Results
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">Structural Similarity (NCC)</span>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-primary">
                      {(comparisonData.ncc * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${comparisonData.ncc > 0.8 ? 'bg-primary' : 'bg-error'}`} 
                      style={{ width: `${Math.max(0, Math.min(100, comparisonData.ncc * 100))}%` }} 
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Normalized Cross Correlation measures pixel-level alignment. Scores &gt; 80% indicate successful registration.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">Anatomy Mismatch Check</span>
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${comparisonData.mismatch ? 'bg-error-container text-error border-error/20' : 'bg-primary-container text-on-primary-container border-primary/20'}`}>
                    <span className="material-symbols-outlined text-[40px]">
                      {comparisonData.mismatch ? 'warning' : 'check_circle'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold">
                        {comparisonData.mismatch ? 'Anatomy Mismatch Detected' : 'Anatomy Matched'}
                      </span>
                      <span className="text-sm opacity-90">
                        {comparisonData.mismatch 
                          ? 'The system detected significant structural differences. These might be different body parts or severely misaligned acquisitions.' 
                          : 'The studies are correctly matched and aligned for longitudinal tracking.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </AppShell>
  );
}
