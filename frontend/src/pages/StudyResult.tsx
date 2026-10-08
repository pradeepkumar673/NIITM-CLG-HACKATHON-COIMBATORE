import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudyResultStudiesIdResultGet } from "../client";
import { AppShell } from "../components/AppShell";
import { getAuthUser, fetchProtectedImage } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ImageStatus = "loading" | "ready" | "not_found";
type ViewMode = "original" | "heatmap" | "uncertainty";

function useProtectedImage(url: string | null): [string | null, ImageStatus] {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImageStatus>("loading");
  useEffect(() => {
    if (!url) { setStatus("not_found"); setBlobUrl(null); return; }
    setStatus("loading"); setBlobUrl(null);
    let cancelled = false;
    fetchProtectedImage(url).then((objUrl) => {
      if (cancelled) return;
      if (objUrl) { setBlobUrl(objUrl); setStatus("ready"); } else { setStatus("not_found"); }
    });
    return () => { cancelled = true; };
  }, [url]);
  const prevRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRef.current; prevRef.current = blobUrl;
    return () => { if (prev) URL.revokeObjectURL(prev); };
  }, [blobUrl]);
  return [blobUrl, status];
}
function TierBadge({ tier }: { tier: string }) {
  const t = (tier || "").toLowerCase();
  if (t === "high") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />HIGH
    </span>
  );
  if (t === "medium") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />MEDIUM
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant border border-outline-variant">
      <span className="w-1.5 h-1.5 rounded-full bg-outline inline-block" />LOW
    </span>
  );
}

function ProbBar({ prob, ci, tier }: { prob: number; ci?: [number, number]; tier: string }) {
  const t = (tier || "").toLowerCase();
  const barColor = t === "high" ? "bg-red-500" : t === "medium" ? "bg-amber-500" : "bg-primary";
  const pct = Math.round(prob * 100);
  const ciLo = ci ? Math.round(ci[0] * 100) : null;
  const ciHi = ci ? Math.round(ci[1] * 100) : null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
        <span>CALIBRATED PROB</span>
        {ciLo != null && <span>95% CI [{ciLo}% – {ciHi}%]</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold font-mono ${t === "high" ? "text-red-700" : t === "medium" ? "text-amber-700" : "text-primary"}`}>{prob.toFixed(2)}</span>
        <div className="flex-1 relative h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          {ciLo != null && ciHi != null && (
            <div className="absolute top-0 h-full bg-black/20 rounded-full" style={{ left: `${ciLo}%`, width: `${Math.max(1, ciHi - ciLo)}%` }} />
          )}
        </div>
        {ciLo != null && <span className="text-[11px] font-mono text-on-surface-variant">[{ciLo}–{ciHi}]</span>}
      </div>
    </div>
  );
}

function ImageViewer({ studyId, topLabel, uncertaintyData }: { studyId: string; topLabel: string; uncertaintyData?: any }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(65);
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const panelRef = useRef<HTMLDivElement>(null);
  const [origUrl, origStatus] = useProtectedImage(`${BASE_URL}/studies/${studyId}/image.png`);
  const hmLabel = topLabel !== "default" ? topLabel : "fracture";
  const [hmUrl, hmStatus] = useProtectedImage(`${BASE_URL}/studies/${studyId}/heatmap_${hmLabel}.png`);
  const [uncUrl, uncStatus] = useProtectedImage(`${BASE_URL}/studies/${studyId}/uncertainty.png`);
  const meanStd = uncertaintyData?.mean_std;
  const nPasses = uncertaintyData?.n_passes;

  useEffect(() => {
    const el = panelRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(p => ({ ...p, scale: Math.max(0.5, Math.min(6, p.scale * d)) }));
    };
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => el?.removeEventListener("wheel", onWheel);
  }, []);

  const onDown = (e: React.MouseEvent) => { setIsDragging(true); startPos.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }; };
  const onMove = (e: React.MouseEvent) => { if (!isDragging) return; setTransform(p => ({ ...p, x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y })); };
  const onUp = () => setIsDragging(false);
  const reset = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);
  const imgStyle = { transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`, transformOrigin: "center" as const, transition: isDragging ? "none" : "transform 0.1s" };
  const tabs: [ViewMode, string][] = [["original", "Original"], ["heatmap", "Heatmap overlay"], ["uncertainty", "Uncertainty map"]];

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center border-b border-surface-container mb-3">
        {tabs.map(([m, lbl]) => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${viewMode === m ? "border-primary text-primary bg-primary/5" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}
          >{lbl}</button>
        ))}
        <div className="flex-1" />
        <button onClick={reset} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">filter_center_focus</span></button>
        <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(6, p.scale * 1.2) }))} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
        <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.5, p.scale * 0.8) }))} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">zoom_out</span></button>
        <button className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">open_in_full</span></button>
      </div>
      {viewMode === "heatmap" && (
        <div className="flex items-center gap-3 px-1 mb-2">
          <span className="text-xs text-on-surface-variant font-medium">Overlay Opacity</span>
          <input type="range" min="0" max="100" value={opacity}
            onChange={e => setOpacity(parseInt(e.target.value))}
            disabled={hmStatus !== "ready"}
            className="flex-1 accent-primary h-1.5 appearance-none rounded-lg cursor-pointer disabled:opacity-40" />
          <span className="text-xs font-bold text-primary w-8 text-right">{opacity}%</span>
        </div>
      )}
      <div ref={panelRef} className="relative bg-black rounded-xl overflow-hidden cursor-move select-none" style={{ height: 500 }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <div className="absolute top-3 left-4 z-20 text-white/80 text-sm font-bold pointer-events-none">R</div>
        <div className="absolute top-3 right-4 z-20 text-white/80 text-sm font-bold pointer-events-none">L</div>
        <div style={imgStyle} className="absolute inset-0 flex items-center justify-center">
          {origStatus === "loading" && <div className="flex flex-col items-center gap-2 text-white/50"><span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span><span className="text-xs">Loading image…</span></div>}
          {origStatus === "not_found" && <div className="flex flex-col items-center gap-2 text-white/40"><span className="material-symbols-outlined text-4xl">broken_image</span><span className="text-xs">Image unavailable</span></div>}
          {origStatus === "ready" && origUrl && (
            <>
              <img src={origUrl} className="max-w-full max-h-full object-contain pointer-events-none" alt="Radiograph" draggable={false} />
              {viewMode === "heatmap" && hmStatus === "ready" && hmUrl && (
                <img src={hmUrl} style={{ opacity: opacity / 100 }}
                  className="absolute inset-0 max-w-full max-h-full object-contain pointer-events-none mix-blend-screen m-auto"
                  alt="Heatmap" draggable={false} />
              )}
              {viewMode === "uncertainty" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {uncStatus === "loading" && (
                    <div className="flex flex-col items-center gap-2 text-white/50">
                      <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                      <span className="text-xs">Loading uncertainty map…</span>
                    </div>
                  )}
                  {uncStatus === "not_found" && (
                    <div className="px-3 py-2 bg-black/70 rounded-lg text-xs text-amber-300 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">info</span>Uncertainty map not generated for this study
                    </div>
                  )}
                  {uncStatus === "ready" && uncUrl && (
                    <img src={uncUrl} style={{ opacity: opacity / 100 }}
                      className="absolute inset-0 max-w-full max-h-full object-contain pointer-events-none mix-blend-screen m-auto"
                      alt="MC-dropout uncertainty map" draggable={false} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {viewMode === "heatmap" && origStatus === "ready" && hmStatus === "loading" && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="px-3 py-1.5 bg-black/70 rounded-lg text-xs text-white/70 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Loading heatmap…
            </div>
          </div>
        )}
        {viewMode === "heatmap" && origStatus === "ready" && hmStatus === "not_found" && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10 pointer-events-none">
            <div className="px-3 py-1.5 bg-black/70 rounded-lg text-xs text-yellow-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">info</span>Heatmap not generated
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 z-10 text-[10px] text-white/40 pointer-events-none font-mono">
          {meanStd != null ? `⊕ MC uncertainty: ±${(meanStd * 100).toFixed(2)}% σ (${nPasses ?? "?"} passes)` : "⊕ Uncertainty: computing…"}
        </div>
      </div>
      {(viewMode === "heatmap" || viewMode === "uncertainty") && (
        <div className="flex items-center gap-6 mt-2 px-1 text-[10px] text-on-surface-variant font-mono">
          <div className="flex flex-col gap-0.5">
            <span>Heatmap Saliency (Grad-CAM++)</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 rounded-sm" style={{ background: "linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)" }} />
              <span>0.00 (low) → 1.00 (Peak focus)</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span>MC Dropout Variance ({nPasses ?? "?"} passes)</span>
            <div className="flex items-center gap-1">
              <div className="w-10 h-2 rounded-sm" style={{ background: "linear-gradient(to right, #e5e7eb, #111827)" }} />
              <span>{meanStd != null ? `σ range: 0.00 → ${(meanStd * 4).toFixed(3)}` : "Not computed"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FindingsPanel({ findings }: { findings: Record<string, any> }) {
  const sorted = Object.entries(findings).sort(([, a]: any, [, b]: any) => b.probability - a.probability);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface">Findings</h3>
        <span className="font-mono text-xs text-on-surface-variant">{sorted.length} Evaluated</span>
      </div>
      <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
        {sorted.map(([key, val]: any) => {
          const tier = (val.tier || "low").toLowerCase();
          const label = val.label || key.replace(/_/g, " ");
          const isH = tier === "high"; const isM = tier === "medium";
          return (
            <div key={key} className={`rounded-xl p-3 border flex flex-col gap-1.5 ${isH ? "border-red-200 bg-red-50/60" : isM ? "border-amber-200 bg-amber-50/60" : "border-outline-variant bg-surface-container-low"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-on-surface capitalize">{label}</span>
                <TierBadge tier={tier} />
              </div>
              <p className="text-xs text-on-surface-variant capitalize">{label} detected on X-ray analysis</p>
              <ProbBar prob={val.probability} ci={val.ci_95} tier={tier} />
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isH ? "bg-red-500" : isM ? "bg-amber-500" : "bg-outline"}`} />
                <span className="text-[11px] text-on-surface-variant">
                  {isH ? "Cannot rule out" : isM ? "Borderline – review" : "Low suspicion"}
                  {val.salient_regions?.length > 0 && ` · Grad-CAM cluster #${val.salient_regions[0]?.cluster_id ?? 1}`}
                </span>
              </div>
              {val.source && <div className="text-[10px] text-on-surface-variant/60 font-mono">{val.source}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TriagePanel({ triage, needsReview }: { triage: any; needsReview: boolean }) {
  const level = (triage?.level || "routine").toLowerCase();
  const reasons: string[] = triage?.reasons || [];
  const isH = level === "high"; const isM = level === "medium";
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Triage Classification</h3>
      <div className={`rounded-xl p-3 flex items-center gap-3 ${isH ? "bg-red-50 border border-red-200" : isM ? "bg-amber-50 border border-amber-200" : "bg-surface-container border border-outline-variant"}`}>
        <span className={`material-symbols-outlined text-2xl ${isH ? "text-red-600" : isM ? "text-amber-600" : "text-on-surface-variant"}`}>
          {isH ? "emergency_home" : isM ? "warning" : "check_circle"}
        </span>
        <div>
          <div className={`text-xs font-bold tracking-wider uppercase ${isH ? "text-red-700" : isM ? "text-amber-700" : "text-on-surface-variant"}`}>
            {isH ? "TIER 1 • HIGH PRIORITY" : isM ? "TIER 2 • MEDIUM" : "TIER 3 • ROUTINE"}
          </div>
        </div>
      </div>
      {needsReview && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
            <span className="text-xs font-bold text-amber-700">Needs Human Review</span>
          </div>
          {reasons.length > 0 && (
            <ul className="flex flex-col gap-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-800">
                  <span className="mt-0.5 flex-shrink-0">•</span><span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function RationaleChain({ llmSummary, findings }: { llmSummary?: string; findings: Record<string, any> }) {
  const steps: string[] = [];
  if (llmSummary) {
    // If the backend generated an LLM summary, use it as the primary rationale
    steps.push(llmSummary);
  }
  
  const top = Object.entries(findings).sort(([, a]: any, [, b]: any) => b.probability - a.probability).slice(0, 2);
  if (top.length > 0) {
    const [key, val] = top[0] as any;
    const label = val.label || key.replace(/_/g, " ");
    const probPct = (val.probability * 100).toFixed(1);
    steps.push(`Primary finding: AI detected ${label} with ${probPct}% confidence based on feature extraction.`);
    if (val.peak_x != null && val.peak_y != null) {
      steps.push(`Saliency map indicates highest focal activation at local coordinates (x: ${val.peak_x}, y: ${val.peak_y}).`);
    }
  }
  if (steps.length === 0) steps.push("Analysis complete. Review findings panel for detailed probabilities.");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">schema</span>
        <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Clinical Rationale Chain</h3>
      </div>
      <ol className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
            <span className="text-xs text-on-surface leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InteractionNotes({ interactions }: { interactions: any[] | undefined }) {
  const items: any[] = Array.isArray(interactions) ? interactions : [];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">account_tree</span>
          <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Clinical Rule Interactions</h3>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-semibold">
            {items.length} {items.length === 1 ? "Rule" : "Rules"} Fired
          </span>
        )}
      </div>
      {items.length === 0 && (
        <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3 text-xs text-on-surface-variant italic">
          No comorbidity rules fired for this study. Rules activate when multiple conditions co-occur (e.g., fracture + osteoporosis history, TB-pattern + prior TB).
        </div>
      )}
      {items.map((item: any, i: number) => (
        <div key={i} className={`rounded-xl border p-3 flex flex-col gap-2 ${
          item.triage_level === "urgent" ? "border-red-200 bg-red-50/60" :
          item.triage_level === "soon" ? "border-amber-200 bg-amber-50/60" :
          "border-outline-variant bg-surface-container-low"
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">rule</span>
            <span className="text-xs font-bold text-on-surface">{item.title || item.rule_id}</span>
            {item.triage_level && (
              <span className={`ml-auto px-1.5 py-0.5 text-[10px] rounded font-semibold uppercase ${
                item.triage_level === "urgent" ? "bg-red-100 text-red-700" :
                item.triage_level === "soon" ? "bg-amber-100 text-amber-700" :
                "bg-surface-container text-on-surface-variant"
              }`}>{item.triage_level}</span>
            )}
          </div>
          {item.statement && <p className="text-[11px] text-on-surface leading-relaxed">{item.statement}</p>}
          {item.source && (
            <div className="text-[10px] text-primary font-mono truncate">{item.source}</div>
          )}
          {item.evidence_quality && (
            <div className="text-[10px] text-on-surface-variant">Evidence: {item.evidence_quality}</div>
          )}
          {item.needs_clinician_signoff && (
            <div className="flex items-center gap-1 text-[10px] text-amber-700">
              <span className="material-symbols-outlined text-[11px]">warning</span>Draft rule — clinician sign-off required
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ModelMeta({ findings, study }: { findings: Record<string, any>; study: any }) {
  const sources = [...new Set(Object.values(findings).map((v: any) => v.source).filter(Boolean))];
  const sha = `${study.sha256?.slice(0, 16)}…`;
  const defaultArch = study.body_part === "bone" ? "ViT" : study.body_part === "chest" ? "DenseNet-121" : "EfficientNet";
  const rows: [string, string][] = [
    ["Model", sources[0]?.split("/").pop() || "Ensemble"],
    ["Architecture", defaultArch],
    ["Digest Checksum", sha],
    ["Cohort", "Not Specified"],
    ["Body Part", study.body_part],
    ["Inference Latency", "—"],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{label}</span>
          <span className="text-xs font-mono text-on-surface truncate">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function StudyResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState("");
  const token = localStorage.getItem("token") || "";

  const { data: resp, isLoading } = useQuery({
    queryKey: ["studyResult", id],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) } }),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const handleReview = async () => {
    setMarking(true);
    try {
      await fetch(`${BASE_URL}/studies/${id}/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "reviewed", notes: notes || null }),
      });
      queryClient.invalidateQueries({ queryKey: ["studyResult", id] });
      setDone(true); setShowModal(false);
    } finally { setMarking(false); }
  };

  if (isLoading) return (
    <AppShell userRole={authUser?.role} userName={authUser?.name}>
      <div className="p-8 flex items-center gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>Loading study…
      </div>
    </AppShell>
  );

  const data = resp?.data as any;
  if (!data || !data.study) return (
    <AppShell userRole={authUser?.role} userName={authUser?.name}>
      <div className="p-8 text-on-surface-variant">Study not found.</div>
    </AppShell>
  );

  const { study, patient, result, reviews } = data;
  const findings: Record<string, any> = result?.findings || {};
  const interactions = result?.interactions;
  const triage = result?.triage || { level: "routine", reasons: [] };
  const needsReview = result?.needs_human_review ?? false;
  const llmSummary: string | undefined = result?.llm_summary;
  const isSignedOff = reviews && reviews.length > 0;
  const isExp = result?.experimental ?? false;

  let topLabel = "fracture"; let maxP = -1;
  for (const [k, v] of Object.entries(findings) as any) {
    if (v.probability > maxP) { maxP = v.probability; topLabel = k; }
  }

  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name}>
      <div className="flex flex-col w-full gap-4 pb-12">
        {isSignedOff && (
          <div className="w-full bg-tertiary/10 px-4 py-2.5 rounded-xl flex items-center gap-3 border border-tertiary/20">
            <span className="material-symbols-outlined text-tertiary">verified</span>
            <span className="font-semibold text-on-surface text-sm">Study Reviewed</span>
            <span className="text-xs text-on-surface-variant">
              by Doctor #{reviews[0].doctor_id} · {reviews[0].decision}
              {reviews[0].notes && ` — "${reviews[0].notes}"`}
            </span>
          </div>
        )}
        {isExp && (
          <div className="w-full bg-purple-50 px-4 py-2.5 rounded-xl flex items-center gap-3 border border-purple-200">
            <span className="material-symbols-outlined text-purple-600">science</span>
            <span className="text-xs text-purple-800 font-medium">{result?.disclaimer || "Experimental protocol — not validated on outcome data."}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold text-on-surface">
                  {patient
                    ? `${patient.external_ref || "Unknown"}, ${patient.age ?? "?"}${patient.sex ? patient.sex.charAt(0).toUpperCase() : ""}`
                    : `Study #${study.id}`}
                </span>
                {patient?.external_ref && (
                  <span className="px-2 py-0.5 text-xs font-mono bg-surface-container rounded border border-outline-variant text-on-surface-variant">
                    ABHA: {patient.external_ref}
                  </span>
                )}
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full capitalize">{study.body_part} PA</span>
                {isSignedOff && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>DICOM Verified
                  </span>
                )}
              </div>
              <div className="text-xs text-on-surface-variant font-mono">
                Acquired: {new Date(study.created_at).toLocaleString()} · INO-MH-{study.id.toString().padStart(5, "0")} · SHA: {study.sha256?.slice(0, 8)}…
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => window.open(`${BASE_URL}/studies/${id}/report.pdf?token=${token}`, "_blank")}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold flex items-center gap-1.5 border border-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>Export PDF
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold flex items-center gap-1.5 border border-outline-variant transition-colors">
                <span className="material-symbols-outlined text-[16px]">person_add</span>Refer to Doctor
              </button>
              {!isSignedOff && (
                <button onClick={() => setShowModal(true)} disabled={done}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">{done ? "check" : "rate_review"}</span>
                  {done ? "Reviewed" : "Mark Reviewed"}
                </button>
              )}
              <button onClick={() => navigate(-1)}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold flex items-center gap-1.5 border border-outline-variant transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back
              </button>
            </div>
          </div>
        </div>

        {/* 3-col main layout: viewer | findings | triage+meta */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_240px] gap-4 items-start">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <ImageViewer studyId={id!} topLabel={topLabel} uncertaintyData={result?.uncertainty} />
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            {Object.keys(findings).length === 0
              ? <div className="text-sm text-on-surface-variant italic p-4 text-center">No findings recorded.</div>
              : <FindingsPanel findings={findings} />}
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
              <TriagePanel triage={triage} needsReview={needsReview} />
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">memory</span>
                <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Model Metadata</h3>
              </div>
              <ModelMeta findings={findings} study={study} />
            </div>
          </div>
        </div>

        {/* Bottom: Rationale + Interactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <RationaleChain llmSummary={llmSummary} findings={findings} />
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <InteractionNotes interactions={result?.interactions} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant border-t border-outline-variant pt-4">
          <span className="material-symbols-outlined text-[14px] text-primary">shield</span>
          Decision support only. Not a diagnosis. Requires clinician review.
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">rate_review</span>
              <h2 className="text-lg font-bold text-on-surface">Mark Study as Reviewed</h2>
            </div>
            <p className="text-sm text-on-surface-variant">Confirm you have reviewed this study. This action is recorded in the audit log.</p>
            <textarea
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional clinical notes…" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleReview} disabled={marking}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                {marking && <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>}
                {marking ? "Saving…" : "Confirm Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
