import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet } from '../client';
import { AppShell } from '../components/AppShell';
import { SkeletonViewer } from '../components/SkeletonViewer';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ZoomableViewer({ studyId, topLabel }: { studyId: string, topLabel: string }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(60);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({ ...prev, scale: Math.max(0.5, Math.min(5, prev.scale * scaleChange)) }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-lg">
        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-1 rounded hover:bg-surface-container">
          <span className="material-symbols-outlined text-sm">filter_center_focus</span>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-semibold">Heatmap Blend:</span>
          <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="w-full accent-primary h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer" />
          <span className="text-xs text-primary font-bold">{opacity}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 h-[600px] overflow-hidden bg-black rounded-lg">
        <div className="relative overflow-hidden cursor-move border border-surface-container-highest rounded"
             onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded">Original</div>
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }} className="w-full h-full flex items-center justify-center">
            <img src={`${BASE_URL}/studies/${studyId}/image.png`} className="max-w-full max-h-full object-contain pointer-events-none" />
          </div>
        </div>
        <div className="relative overflow-hidden cursor-move border border-surface-container-highest rounded"
             onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 text-primary-fixed text-xs font-bold rounded">Grad-CAM Overlay</div>
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }} className="w-full h-full flex items-center justify-center relative">
            <img src={`${BASE_URL}/studies/${studyId}/image.png`} className="absolute max-w-full max-h-full object-contain pointer-events-none" />
            <img src={`${BASE_URL}/studies/${studyId}/heatmap_${topLabel}.png`} style={{ opacity: opacity / 100 }} className="absolute max-w-full max-h-full object-contain pointer-events-none mix-blend-screen" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudyResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resp, isLoading } = useQuery({
    queryKey: ['studyResult', id],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) } }),
    enabled: !!id
  });

  if (isLoading) return <AppShell userRole="health_worker" userName="Sister Lakshmi Devi"><div className="p-8">Loading...</div></AppShell>;
  
  const data = resp?.data as any;
  if (!data || !data.study) return <AppShell userRole="health_worker" userName="Sister Lakshmi Devi"><div className="p-8">Study not found</div></AppShell>;

  const { study, patient, result, reviews } = data;
  const findings = result?.findings || {};
  const interactions = result?.interactions || { nodes: [], edges: [] };
  
  // Get top finding
  let topLabel = 'default';
  let maxP = -1;
  for (const [k, v] of Object.entries(findings) as any) {
    if (v.probability > maxP) {
      maxP = v.probability;
      topLabel = k;
    }
  }

  const isSignedOff = reviews && reviews.length > 0;

  return (
    <AppShell userRole="health_worker" userName="Sister Lakshmi Devi">
      <div className="flex flex-col w-full gap-4 pb-8">
        {isSignedOff && (
          <div className="w-full bg-tertiary-container/10 px-4 py-3 rounded-lg flex items-center justify-between border border-tertiary-container/30">
            <div className="flex items-center gap-3 text-tertiary">
              <span className="material-symbols-outlined text-2xl">verified</span>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface">Study Signed-off</span>
                <span className="text-xs text-on-surface-variant">Signed by Doctor ID {reviews[0].doctor_id} • Decision: {reviews[0].decision}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-secondary-container font-mono-data-md text-on-secondary-fixed font-bold tracking-tight">STU-{study.id}</span>
              <span className="text-sm font-semibold">{patient?.external_ref} ({patient?.sex}, {patient?.age}y)</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-xs">{study.body_part}</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              Acquired: {new Date(study.created_at).toLocaleString()} | Status: {study.status} | SHA: {study.sha256}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Radiographic Viewer</h2>
            <ZoomableViewer studyId={id!} topLabel={topLabel} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Findings (14-label)</h2>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(findings).map(([k, v]: any) => (
                  <div key={k} className="flex flex-col p-2 bg-surface-container-low rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold capitalize">{k}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${v.probability > 0.5 ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                        {(v.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    {v.ci_95 && <div className="text-[10px] text-on-surface-variant text-right">CI: [{(v.ci_95[0]*100).toFixed(1)}% - {(v.ci_95[1]*100).toFixed(1)}%]</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col h-[400px]">
              <h2 className="text-lg font-bold mb-4">Anatomy & 3D Skeleton</h2>
              <div className="flex-1 rounded-lg overflow-hidden relative border border-surface-container">
                <SkeletonViewer anatomyData={{ 
                  status: 'ok', 
                  findings: Object.keys(findings).filter(k => findings[k].probability > 0.5).map(k => ({id: k, name: k})) 
                }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Interaction Graph & Rules Fired</h2>
          <div className="p-4 bg-surface-container-low rounded-lg text-sm text-on-surface-variant flex flex-wrap gap-4">
            {interactions.edges?.length > 0 ? interactions.edges.map((edge: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-surface-container rounded border border-outline-variant">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                <span>{edge.source} <strong className="text-on-surface">→</strong> {edge.target}</span>
                <span className="px-1 py-0.5 bg-secondary-container text-secondary text-xs rounded">{edge.statement}</span>
              </div>
            )) : <span className="italic">No interaction rules fired for this study.</span>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
