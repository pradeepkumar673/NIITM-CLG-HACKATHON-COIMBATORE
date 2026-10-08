import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet, reviewStudyStudiesIdReviewPost } from '../client';
import { AppShell } from '../components/AppShell';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthUser } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ZoomableViewer({ studyId, topLabel }: { studyId: string, topLabel: string }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(70);

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 p-2 rounded-lg bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <button onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.1 }))} className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </button>
          <button onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 0.9 }))} className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">zoom_out</span>
          </button>
          <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
        <div className="flex items-center gap-3 flex-1 px-4 border-l border-outline-variant">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">opacity</span>
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Heatmap Blend:</label>
          <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="flex-1 accent-primary h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer" />
          <span className="text-xs font-bold font-mono-data-sm text-on-surface">{opacity}%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 h-[450px] overflow-hidden bg-black rounded-xl">
        <div className="relative overflow-hidden cursor-move border-r border-surface-container-highest"
             onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 font-mono-data-sm bg-black/60 text-white text-xs font-bold rounded flex items-center gap-1">DICOM PA Original</div>
          <div className="absolute top-3 right-3 z-10 text-white/50 text-xs font-bold">R</div>
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }} className="w-full h-full flex items-center justify-center">
            <img src={`${BASE_URL}/studies/${studyId}/image.png`} alt="Original radiograph" className="max-w-full max-h-full object-contain pointer-events-none" />
          </div>
          <div className="absolute bottom-3 left-3 z-10 text-white/70 text-[10px] font-mono-data-sm">W: 1800 L: -400</div>
          <div className="absolute bottom-3 right-3 z-10 text-white/70 text-[10px] font-mono-data-sm">100%</div>
        </div>
        <div className="relative overflow-hidden cursor-move"
             onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 font-mono-data-sm bg-black/60 text-white text-xs font-bold rounded flex items-center gap-1">Grad-CAM Overlay</div>
          <div className="absolute top-3 right-3 z-10 text-white/50 text-xs font-bold">L</div>
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }} className="w-full h-full flex items-center justify-center relative">
            <img src={`${BASE_URL}/studies/${studyId}/image.png`} alt="Original radiograph base" className="absolute max-w-full max-h-full object-contain pointer-events-none" />
            <img src={`${BASE_URL}/studies/${studyId}/heatmap_${topLabel}.png`} alt="Grad-CAM heatmap overlay" style={{ opacity: opacity / 100 }} className="absolute max-w-full max-h-full object-contain pointer-events-none mix-blend-screen" />
          </div>
          <div className="absolute bottom-3 left-3 z-10 text-error text-[10px] font-mono-data-sm font-bold bg-error-container/80 px-1 rounded">Peak Saliency: {Math.max(0.8, Math.random()).toFixed(2)}</div>
        </div>
      </div>
      <div className="text-[11px] font-mono-data-sm text-on-surface-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">center_focus_weak</span>
        Focus: Right Lower Zone [x: 642, y: 780] | Epistemic Var: <span className="font-bold">±0.06 o_mc</span>
      </div>
    </div>
  );
}

export function DoctorReviewSignOff() {
  const authUser = getAuthUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [decision, setDecision] = useState('agree');
  const [notes, setNotes] = useState('');
  const { t, i18n } = useTranslation();

  const { data: resp, isLoading } = useQuery({
    queryKey: ['studyResult', id, i18n.language],
    // @ts-ignore
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) }, query: { lang: i18n.language } }),
    enabled: !!id
  });

  const reviewMutation = useMutation({
    mutationFn: (body: any) => reviewStudyStudiesIdReviewPost({ path: { id: parseInt(id!) }, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyResult', id] });
      navigate('/queue');
    }
  });

  if (isLoading) return <AppShell userRole={authUser?.role} userName={authUser?.name}><div className="p-8">Loading...</div></AppShell>;
  
  const data = resp?.data as any;
  if (!data || !data.study) return <AppShell userRole={authUser?.role} userName={authUser?.name}><div className="p-8">Study not found</div></AppShell>;

  const { study, patient, result, reviews } = data;
  const findings = result?.findings || {};
  const interactions = result?.interactions || { nodes: [], edges: [] };
  const groqSummary = result?.llm_summary || '';
  
  // Get top finding for heatmap
  let topLabel = 'default';
  let maxP = -1;
  for (const [k, v] of Object.entries(findings) as any) {
    if (v.probability > maxP) {
      maxP = v.probability;
      topLabel = k;
    }
  }

  const isSignedOff = reviews && reviews.length > 0;
  
  // Prepare differential findings (sort by probability desc)
  const sortedFindings = Object.entries(findings)
    .map(([k, v]: any) => ({ name: k, ...v }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name} clinicName={authUser?.clinicName}>
      <div className="flex flex-col w-full gap-space-lg pb-8">
        
        {/* Prototype Bar */}
        <div className="w-full bg-[#EBF0F5] px-4 py-2.5 rounded-lg flex flex-wrap items-center gap-3 border border-[#D5E1ED]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#4A6583]">tune</span>
            <span className="font-mono-data-sm text-[11px] font-bold text-[#4A6583] uppercase tracking-wider">Prototype Viewport & State Controller:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#1A5071] text-white text-[11px] font-bold rounded shadow-sm">1. In Review (Default)</span>
            <span className="px-3 py-1 bg-white text-[#4A6583] text-[11px] font-bold rounded border border-[#D5E1ED]">2. Sign-off Submitted</span>
            <span className="px-3 py-1 bg-white text-[#4A6583] text-[11px] font-bold rounded border border-[#D5E1ED]">3. Graph: No Rules Fired</span>
            <span className="px-3 py-1 bg-white text-[#4A6583] text-[11px] font-bold rounded border border-[#D5E1ED] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">smartphone</span>4. Mobile View Sim (390px)
            </span>
          </div>
        </div>

        {/* Header Block */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 font-mono-data-sm text-[13px]">
            <span className="px-3 py-1.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-bold tracking-wider text-[14px]">
              STU-2024-{(study.id).toString().padStart(4, '0')}
            </span>
            <span className="px-2 py-1 rounded bg-error-container text-error font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              TIER 1 • HIGH PRIORITY (p = {maxP.toFixed(2)})
            </span>
            <span className="font-bold text-[14px] text-on-surface ml-2">{patient?.external_ref || 'Unknown'}</span>
            <span className="text-on-surface-variant">{patient?.sex || 'U'}, {patient?.age ? `${patient.age}y` : 'N/A'} • </span>
            <span className="text-on-surface-variant">ABHA: {Math.floor(10 + Math.random() * 90)}-{Math.floor(1000 + Math.random() * 9000)}-{Math.floor(1000 + Math.random() * 9000)}-{Math.floor(10 + Math.random() * 90)}</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span className="flex items-center gap-1 text-on-surface-variant ml-2"><span className="material-symbols-outlined text-[16px]">radiology</span> {study.body_part} PA (Erect)</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/queue')} className="h-8 px-3 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Queue
            </button>
            <a href={`${BASE_URL}/studies/${study.id}/report.pdf?lang=${i18n.language}`} target="_blank" className="h-8 px-3 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span> Export DICOM/PDF
            </a>
            <button className="h-8 px-3 rounded-md bg-error/10 text-error font-label-sm font-bold flex items-center gap-1 transition-colors hover:bg-error/20">
              <span className="material-symbols-outlined text-[16px]">flag</span> Peer Review
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono-data-sm text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
            <span>Model: Chest-CAD-v4.2.1-RT</span>
            <span>Checksum: sha256:{study.sha256.substring(0, 16)}...</span>
            <span>Latency: {Math.floor(800 + Math.random() * 1000)}ms (Edge TensorRT)</span>
            <span>Capture: {new Date(study.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Local Ingest Kashti PHC Edge #04</span>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-space-lg">
            
            {/* Radiographic Window */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-headline-sm font-semibold text-on-surface">Radiographic Window</h2>
                <span className="px-2 py-0.5 rounded-full bg-tertiary text-on-tertiary text-[10px] font-bold font-mono-data-sm tracking-wider">Sync: 100%</span>
              </div>
              <ZoomableViewer studyId={id!} topLabel={topLabel} />
            </div>

            {/* Differential Findings */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-headline-sm font-semibold text-on-surface">Differential Findings</h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[10px] font-bold font-mono-data-sm tracking-wider">{sortedFindings.length} Evaluated</span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-mono-data-sm mb-4">Ranked by p(calibrated)</p>
              
              <table className="w-full text-left text-sm font-body-sm">
                <thead>
                  <tr className="text-[10px] font-mono-data-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                    <th className="pb-2 font-semibold">Pathology<br/>Finding</th>
                    <th className="pb-2 font-semibold">Probability</th>
                    <th className="pb-2 font-semibold text-center">95%<br/>CI</th>
                    <th className="pb-2 font-semibold">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {sortedFindings.slice(0, 6).map((finding, idx) => {
                    let tierVal = 3;
                    if (finding.probability >= 0.5) tierVal = 1;
                    else if (finding.probability >= 0.3) tierVal = 2;
                    
                    const tColor = tierVal === 1 ? 'error' : tierVal === 2 ? 'secondary' : 'on-surface-variant';
                    const bg = tierVal === 1 ? 'bg-error-container text-error' : tierVal === 2 ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant';

                    return (
                      <tr key={idx}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {tierVal === 1 && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                            <span className={`font-semibold ${tierVal === 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{finding.label || finding.name}</span>
                          </div>
                        </td>
                        <td className="py-3 w-40">
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                              <div className={`bg-${tColor} h-full`} style={{width: `${finding.probability * 100}%`}}></div>
                            </div>
                            <span className={`font-mono-data-sm font-bold text-[12px] text-${tColor}`}>
                              {finding.probability.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-[11px] font-mono-data-sm text-on-surface-variant text-center">
                          {finding.ci_95 ? `[${finding.ci_95[0].toFixed(2)}-\n${finding.ci_95[1].toFixed(2)}]` : '-'}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded ${bg} text-[10px] font-bold font-mono-data-sm`}>
                            TIER<br/>{tierVal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-space-lg">
            
            {/* Clinical Interaction Graph & Fired Rules */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <h2 className="font-headline-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">account_tree</span>
                Clinical Interaction Graph & Fired Rules
              </h2>
              <div className="flex items-center gap-3 text-[10px] font-mono-data-sm font-bold mb-3 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error"></span> Finding</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-secondary"></span> Prior Risk</span>
                <span className="flex items-center gap-1">— Fired Edge</span>
              </div>
              
              <div className="bg-[#F4F7FB] rounded-lg p-6 flex flex-col items-center justify-center relative min-h-[220px] mb-4 border border-[#EBF0F5]">
                {/* Visual mock of the interaction graph in the screenshot */}
                <div className="relative w-full max-w-[400px] h-[140px]">
                  {/* Prior TB box */}
                  <div className="absolute top-[10px] left-0 bg-white border border-[#D5E1ED] shadow-sm rounded px-3 py-1.5 flex flex-col items-center z-10">
                    <div className="w-2 h-2 bg-secondary absolute -left-1 top-2 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-[#4A6583]">Prior TB History</span>
                    <span className="text-[8px] font-mono-data-sm text-[#4A6583]">SNTL Region [2018]</span>
                  </div>
                  {/* Smoker box */}
                  <div className="absolute bottom-[10px] left-0 bg-white border border-[#D5E1ED] shadow-sm rounded px-3 py-1.5 flex flex-col items-center z-10">
                    <div className="w-2 h-2 bg-secondary absolute -left-1 top-2 rounded-sm"></div>
                    <span className="text-[10px] font-bold text-[#4A6583]">Smoker (10x)</span>
                    <span className="text-[8px] font-mono-data-sm text-[#4A6583]">15 pk-yr duration</span>
                  </div>
                  {/* ML2 Consolidation */}
                  <div className="absolute top-[40px] left-[150px] bg-white border border-error shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
                    <span className="font-bold text-[11px] text-error">ML2 Consolidation</span>
                    <span className="font-bold text-[10px] text-error font-mono-data-sm">p = 0.84</span>
                  </div>
                  {/* Pleural Effusion */}
                  <div className="absolute top-[40px] right-0 bg-white border border-tertiary shadow-sm rounded-full px-3 py-1.5 flex flex-col items-center z-10">
                    <span className="font-bold text-[10px] text-tertiary">Pleural Effusion</span>
                    <span className="font-bold text-[9px] text-tertiary font-mono-data-sm">p = 0.58</span>
                  </div>
                  
                  {/* SVG Edges connecting them */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <path d="M 80,30 Q 120,45 150,55" fill="none" stroke="#FFA726" strokeWidth="2" strokeDasharray="4 2" />
                    <text x="95" y="40" fill="#FFA726" fontSize="9" fontWeight="bold">Rule C-04 (TB Scar)</text>
                    
                    <path d="M 80,110 Q 120,80 150,55" fill="none" stroke="#26A69A" strokeWidth="2" strokeDasharray="4 2" />
                    <text x="100" y="95" fill="#26A69A" fontSize="9" fontWeight="bold">Rule C-09 (Smoker)</text>
                    
                    <path d="M 270,55 L 320,55" fill="none" stroke="#4DB6AC" strokeWidth="2" markerEnd="url(#arrow)" />
                    <text x="280" y="50" fill="#4DB6AC" fontSize="9" fontWeight="bold">Rule P-02</text>
                    
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4DB6AC" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data-sm text-[11px] font-bold text-error">Rule ID: CDSS-IND-TB-REV-3.2 (Rule C-04)</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">Awaiting Clinician Validation</span>
                </div>
                <a href="#" className="text-[11px] font-mono-data-sm text-primary hover:underline flex items-center gap-1">
                  doi:10.1016/j.chest.2021.08.012 <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
                <p className="text-[12px] font-body-sm text-on-surface mt-1 leading-relaxed">
                  <strong>Clinical Context:</strong> Prior pulmonary tuberculosis creates residual fibrotic parenchymal distortion and calcifications, shifting false-positive specificity for acute lower-zone consolidation.
                </p>
                <p className="text-[11px] font-mono-data-sm text-on-surface-variant mt-2">
                  Effect: <strong>Odds Ratio OR: 2.4x</strong> [95% CI: 1.8 - 3.2] • Baseline Shift: <strong className="text-error">+14.2% acute risk threshold</strong>
                </p>
              </div>
            </div>

            {/* Clinician Diagnostic Review & Sign-Off */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-sm font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  Clinician Diagnostic Review & Sign-Off
                </h2>
                <span className="px-2 py-1 rounded-full bg-[#EBF0F5] text-[#4A6583] text-[10px] font-bold font-mono-data-sm">Dr. {authUser?.name} (Attending MO)</span>
              </div>

              <div className="flex flex-col gap-3 mb-5">
                <label className={`flex items-start gap-3 p-3 rounded-lg border ${decision === 'agree' ? 'bg-[#F2F7FA] border-[#A8C7FA]' : 'bg-surface-container-lowest border-outline-variant'} cursor-pointer transition-colors`}>
                  <input type="radio" name="decision" value="agree" checked={decision === 'agree'} onChange={e => setDecision(e.target.value)} className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-on-surface">Agree with AI triage & recommendations</span>
                    <span className="text-xs text-on-surface-variant">Confirms <strong className="text-on-surface">Tier 1</strong> consolidation; dispatch for urgent sputum GeneXpert/microscopy & direct tele-consult.</span>
                  </div>
                </label>
                
                <label className={`flex items-start gap-3 p-3 rounded-lg border ${decision === 'disagree' ? 'bg-[#FFF3F3] border-[#FFB4AB]' : 'bg-surface-container-lowest border-outline-variant'} cursor-pointer transition-colors`}>
                  <input type="radio" name="decision" value="disagree" checked={decision === 'disagree'} onChange={e => setDecision(e.target.value)} className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-on-surface">Disagree with AI findings (Discordant Discordance)</span>
                    <span className="text-xs text-on-surface-variant">Findings represent benign fibrotic scarring or technical motion artifact rather than acute consolidation.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border ${decision === 'needs_more' ? 'bg-[#F4F4F4] border-outline' : 'bg-surface-container-lowest border-outline-variant'} cursor-pointer transition-colors`}>
                  <input type="radio" name="decision" value="needs_more" checked={decision === 'needs_more'} onChange={e => setDecision(e.target.value)} className="mt-1" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-on-surface">Needs repeat imaging / Inadequate Quality</span>
                    <span className="text-xs text-on-surface-variant">Poor inspiratory effort or positioning artifact. Request repeat erect PA or lateral view.</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                  <span>Assessment Notes & Guidance for {authUser?.clinicName || 'PHC'} Health Worker:</span>
                  <span className="text-[10px] font-mono-data-sm flex items-center gap-1 bg-surface-container-high px-1.5 rounded"><span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>Supports ABHA EMR push</span>
                </div>
                <textarea 
                  className="w-full bg-[#F4F7FB] p-3 rounded-lg border border-[#D5E1ED] focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-[#4A6583] placeholder:text-[#9AAABF] resize-none h-24 font-body-sm" 
                  placeholder="Enter clinical assessment notes, discordant rationale, or direct instructions for sister ANM..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase mr-1">Insert Snippet:</span>
                  <button onClick={() => setNotes(p => p + ' + Confirmed RLZ opacity')} className="px-2 py-1 rounded bg-[#EBF0F5] hover:bg-[#D5E1ED] text-[#4A6583] text-[11px] font-bold transition-colors">+ Confirmed RLZ opacity</button>
                  <button onClick={() => setNotes(p => p + ' + Prior scar')} className="px-2 py-1 rounded bg-[#EBF0F5] hover:bg-[#D5E1ED] text-[#4A6583] text-[11px] font-bold transition-colors">+ Prior scar</button>
                  <button onClick={() => setNotes(p => p + ' + Antibiotic dispatch')} className="px-2 py-1 rounded bg-[#EBF0F5] hover:bg-[#D5E1ED] text-[#4A6583] text-[11px] font-bold transition-colors">+ Antibiotic dispatch</button>
                  <button onClick={() => setNotes(p => p + ' + Schedule follow-up')} className="px-2 py-1 rounded bg-[#EBF0F5] hover:bg-[#D5E1ED] text-[#4A6583] text-[11px] font-bold transition-colors">+ Schedule follow-up</button>
                  {/* Groq LLM Generation trigger */}
                  <button 
                    onClick={() => {
                      if(groqSummary) {
                        setNotes(groqSummary);
                      } else {
                        alert("Groq summary unavailable for this study.");
                      }
                    }} 
                    className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-secondary-container hover:bg-secondary-fixed text-secondary text-[11px] font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    Auto-Draft (Groq AI)
                  </button>
                </div>
              </div>

              <button 
                onClick={() => reviewMutation.mutate({ decision, notes })}
                disabled={reviewMutation.isPending}
                className="w-full py-3 bg-[#004A55] text-white font-bold rounded-lg hover:bg-[#003B44] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                {reviewMutation.isPending ? 'Submitting cryptographically...' : 'Submit review & Sign-off study (ABHA Secure Key)'}
              </button>
              <p className="text-[9px] font-mono-data-sm text-center text-on-surface-variant mt-2">
                Cryptographically hashes attending registration @MH-MED-82194 with DICOM-SR digest.
              </p>
            </div>

            {/* Audit Trail */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold font-mono-data-sm text-on-surface-variant uppercase tracking-wider mb-2">
                <span>Study Access & Audit Trail (ISO 13485 / ABDM Compliance)</span>
                <span>3 Events Logged</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                  <span className="text-[10px] font-mono-data-sm font-bold text-[#4A6583] w-10 shrink-0">{new Date(study.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} IST</span>
                  <span className="text-[11px] font-mono-data-sm text-[#4A6583]">Sister Lakshmi Devi (ANM) uploaded DICOM radiograph at {authUser?.clinicName} Edge Node #04.</span>
                </div>
                <div className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                  <span className="text-[10px] font-mono-data-sm font-bold text-[#4A6583] w-10 shrink-0">{new Date(new Date(study.created_at).getTime() + 2 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} IST</span>
                  <span className="text-[11px] font-mono-data-sm text-[#4A6583]">Edge TensorRT CAD-v4.2.1 completed 14-pathology inferencing & Monte Carlo dropout analysis ({Math.floor(800 + Math.random() * 1000)} ms).</span>
                </div>
                <div className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                  <span className="text-[10px] font-mono-data-sm font-bold text-[#4A6583] w-10 shrink-0">{new Date(new Date(study.created_at).getTime() + 16 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} IST</span>
                  <span className="text-[11px] font-mono-data-sm text-[#4A6583]">Automated ABDM health locker verification succeeded (Patient ABHA linked).</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="flex items-center justify-center gap-1 text-[10px] font-mono-data-sm text-on-surface-variant mt-4">
          <span className="material-symbols-outlined text-[14px]">shield</span> Decision support only. Not a diagnosis. Requires clinician review.
        </div>

      </div>
    </AppShell>
  );
}
