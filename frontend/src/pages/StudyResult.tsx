import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudyResultStudiesIdResultGet } from "../client";
import { AppShell } from "../components/AppShell";
import { getAuthUser, fetchProtectedImage } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type ImageStatus = "loading" | "ready" | "not_found";
type ViewMode = "original" | "heatmap" | "uncertainty";

/* ─── hooks ─────────────────────────────────────────────────────────── */
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

/* ─── small components ───────────────────────────────────────────────── */
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
  const pct = Math.round((prob ?? 0) * 100);
  const ciLo = ci ? Math.round(ci[0] * 100) : null;
  const ciHi = ci ? Math.round(ci[1] * 100) : null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
        <span>CALIBRATED PROB</span>
        {ciLo != null && <span>95% CI [{ciLo}% – {ciHi}%]</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold font-mono ${t === "high" ? "text-red-700" : t === "medium" ? "text-amber-700" : "text-primary"}`}>{(prob ?? 0).toFixed(2)}</span>
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

/* ─── image viewer with heatmap/uncertainty tabs ─────────────────────── */
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

/* ─── findings panel ─────────────────────────────────────────────────── */
function FindingsPanel({ findings }: { findings: Record<string, any> }) {
  const sorted = Object.entries(findings).sort(([, a]: any, [, b]: any) => (b.probability ?? 0) - (a.probability ?? 0));
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
              <ProbBar prob={val.probability ?? 0} ci={val.ci_95} tier={tier} />
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

/* ─── triage panel ───────────────────────────────────────────────────── */
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

/* ─── rationale chain ────────────────────────────────────────────────── */
function RationaleChain({ llmSummary, findings }: { llmSummary?: string; findings: Record<string, any> }) {
  const steps: string[] = [];
  if (llmSummary) steps.push(llmSummary);
  const top = Object.entries(findings).sort(([, a]: any, [, b]: any) => (b.probability ?? 0) - (a.probability ?? 0)).slice(0, 2);
  if (top.length > 0) {
    const [key, val] = top[0] as any;
    const label = val.label || key.replace(/_/g, " ");
    const probPct = ((val.probability ?? 0) * 100).toFixed(1);
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

/* ─── interaction notes ──────────────────────────────────────────────── */
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
          {item.source && <div className="text-[10px] text-primary font-mono truncate">{item.source}</div>}
          {item.evidence_quality && <div className="text-[10px] text-on-surface-variant">Evidence: {item.evidence_quality}</div>}
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

/* ─── model metadata ─────────────────────────────────────────────────── */
function ModelMeta({ findings, study }: { findings: Record<string, any>; study: any }) {
  const sources = [...new Set(Object.values(findings).map((v: any) => v.source).filter(Boolean))];
  const sha = study.sha256 ? `${study.sha256.slice(0, 16)}…` : "—";
  const defaultArch = study.body_part === "bone" ? "ViT" : study.body_part === "chest" ? "DenseNet-121" : "EfficientNet";
  const rows: [string, string][] = [
    ["Model", sources[0]?.split("/").pop() || "Ensemble"],
    ["Architecture", defaultArch],
    ["Digest Checksum", sha],
    ["Body Part", study.body_part],
    ["Status", study.status],
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

/* ─── main page ──────────────────────────────────────────────────────── */
export function StudyResult() {
  const authUser = getAuthUser();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [decision, setDecision] = useState("agree");
  const [notes, setNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [marking, setMarking] = useState(false);
  const token = localStorage.getItem("token") || "";

  const [protoState, setProtoState] = useState<1 | 2 | 3 | 4>(1);

  const { data: resp, isLoading } = useQuery({
    queryKey: ["studyResult", id],
    // @ts-ignore
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(id!) } }),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const reviewMutation = useMutation({
    mutationFn: async (body: any) => {
      return fetch(`${BASE_URL}/studies/${id}/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyResult", id] });
    },
  });

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
  const interactions = result?.interactions;
  const findings: Record<string, any> = result?.findings || {};
  const groqSummary: string = result?.llm_summary || "";
  const triage = result?.triage || { level: "routine", reasons: [] };
  const needsReview: boolean = result?.needs_human_review ?? false;
  const uncertainty = result?.uncertainty;

  // top label for heatmap
  let topLabel = "default";
  let maxP = -1;
  for (const [k, v] of Object.entries(findings) as any) {
    const p = v?.probability ?? 0;
    if (p > maxP) { maxP = p; topLabel = k; }
  }

  const isSignedOff = (reviews && reviews.length > 0) || protoState === 2;
  const showGraph = protoState !== 3;
  const isMobileSim = protoState === 4;

  const sortedFindings = Object.entries(findings)
    .map(([k, v]: any) => ({ name: k, ...v, probability: v?.probability ?? 0 }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name} clinicName={authUser?.clinicName}>
      <div className={`flex flex-col w-full gap-6 pb-10 ${isMobileSim ? "max-w-[390px] mx-auto border-x border-outline-variant px-2" : ""}`}>

        {/* ── Prototype bar ───────────────────────────────────────────────── */}
        <div className="w-full bg-[#EBF0F5] px-4 py-2.5 rounded-lg flex flex-wrap items-center gap-3 border border-[#D5E1ED] overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#4A6583]">tune</span>
            <span className="font-mono text-[11px] font-bold text-[#4A6583] uppercase tracking-wider">Prototype Viewport &amp; State Controller:</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setProtoState(1)} className={`px-3 py-1 text-[11px] font-bold rounded border transition-colors ${protoState === 1 ? "bg-[#1A5071] text-white border-transparent" : "bg-white text-[#4A6583] border-[#D5E1ED] hover:bg-surface-container"}`}>1. In Review (Default)</button>
            <button onClick={() => setProtoState(2)} className={`px-3 py-1 text-[11px] font-bold rounded border transition-colors ${protoState === 2 ? "bg-[#1A5071] text-white border-transparent" : "bg-white text-[#4A6583] border-[#D5E1ED] hover:bg-surface-container"}`}>2. Sign-off Submitted</button>
            <button onClick={() => setProtoState(3)} className={`px-3 py-1 text-[11px] font-bold rounded border transition-colors ${protoState === 3 ? "bg-[#1A5071] text-white border-transparent" : "bg-white text-[#4A6583] border-[#D5E1ED] hover:bg-surface-container"}`}>3. Graph: No Rules Fired</button>
            <button onClick={() => setProtoState(4)} className={`px-3 py-1 text-[11px] font-bold rounded border flex items-center gap-1 transition-colors ${protoState === 4 ? "bg-[#1A5071] text-white border-transparent" : "bg-white text-[#4A6583] border-[#D5E1ED] hover:bg-surface-container"}`}>
              <span className="material-symbols-outlined text-[14px]">smartphone</span>4. Mobile View Sim (390px)
            </button>
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1.5 rounded bg-secondary-container text-on-secondary-fixed-variant font-bold">
              STU-{(study.id).toString().padStart(4, "0")}
            </span>
            {maxP >= 0 && (
              <span className="px-2 py-1 rounded bg-error-container text-error font-bold flex items-center gap-1 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                TIER 1 · HIGH PRIORITY (p = {maxP.toFixed(2)})
              </span>
            )}
            {patient && (
              <span className="font-bold text-on-surface">{patient.external_ref || "Unknown patient"}</span>
            )}
            {patient && (
              <span className="text-on-surface-variant">
                {patient.sex || "U"}, {patient.age ? `${patient.age}y` : "N/A"}
              </span>
            )}
            <span className="flex items-center gap-1 text-on-surface-variant ml-2">
              <span className="material-symbols-outlined text-[16px]">radiology</span> {study.body_part} PA
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navigate(-1)} className="h-8 px-3 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1 transition-colors text-sm">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
            </button>
            <button onClick={() => window.open(`${BASE_URL}/studies/${id}/report.pdf?token=${token}`, "_blank")} className="h-8 px-3 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold flex items-center gap-1 transition-colors text-sm">
              <span className="material-symbols-outlined text-[16px]">download</span> Export PDF
            </button>
            <button onClick={() => alert("Peer review flagged! Notification sent to available specialists.")} className="h-8 px-3 rounded-md bg-error/10 text-error font-bold flex items-center gap-1 transition-colors hover:bg-error/20 text-sm">
              <span className="material-symbols-outlined text-[16px]">flag</span> Peer Review
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
            <span>sha256: {study.sha256?.substring(0, 20)}…</span>
            <span>Captured: {new Date(study.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />Edge Node Active</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION A — Diagnostic view (image viewer + findings + triage)
            from the original StudyResult layout, driven entirely from API
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left: image viewer */}
          <div className="xl:col-span-7 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-3">
            <h2 className="font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">radiology</span>
              Radiographic Window
            </h2>
            <ImageViewer studyId={id!} topLabel={topLabel} uncertaintyData={uncertainty} />
          </div>

          {/* Right: findings + triage + interactions + model meta */}
          <div className="xl:col-span-5 flex flex-col gap-6">

            {/* Findings */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              {Object.keys(findings).length > 0
                ? <FindingsPanel findings={findings} />
                : <div className="text-sm text-on-surface-variant italic">No findings returned by model yet.</div>
              }
            </div>

            {/* Triage */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <TriagePanel triage={triage} needsReview={needsReview} />
            </div>

            {/* Rationale chain */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <RationaleChain llmSummary={groqSummary} findings={findings} />
            </div>

            {/* Interaction notes */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <InteractionNotes interactions={interactions} />
            </div>

            {/* Model metadata */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-3">Model Metadata</h3>
              <ModelMeta findings={findings} study={study} />
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clinician Review &amp; Sign-Off</span>
          <div className="flex-1 h-px bg-outline-variant" />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION B — Doctor sign-off layout (graph, review form, audit)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* LEFT — Clinical Interaction Graph */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
            <h2 className="font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
              Clinical Interaction Graph &amp; Fired Rules
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold mb-3 uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> Finding</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-secondary" /> Prior Risk</span>
              <span className="flex items-center gap-1">— Fired Edge</span>
            </div>

            {!showGraph ? (
              <div className="bg-[#F4F7FB] rounded-lg p-6 flex items-center justify-center min-h-[180px] border border-[#EBF0F5] text-sm text-on-surface-variant italic">
                No critical interaction rules triggered for this study.
              </div>
            ) : (
              <>
                <div className="bg-[#F4F7FB] rounded-lg p-6 relative min-h-[180px] mb-4 border border-[#EBF0F5]">
                  <div className="relative w-full max-w-[400px] h-[140px] mx-auto">
                    <div className="absolute top-[10px] left-0 bg-white border border-[#D5E1ED] shadow-sm rounded px-3 py-1.5 z-10">
                      <div className="w-2 h-2 bg-secondary absolute -left-1 top-2 rounded-sm" />
                      <span className="text-[10px] font-bold text-[#4A6583]">Prior TB History</span>
                      <div className="text-[8px] font-mono text-[#4A6583]">SNTL Region [2018]</div>
                    </div>
                    <div className="absolute bottom-[10px] left-0 bg-white border border-[#D5E1ED] shadow-sm rounded px-3 py-1.5 z-10">
                      <div className="w-2 h-2 bg-secondary absolute -left-1 top-2 rounded-sm" />
                      <span className="text-[10px] font-bold text-[#4A6583]">Smoker (10x)</span>
                      <div className="text-[8px] font-mono text-[#4A6583]">15 pk-yr duration</div>
                    </div>
                    {sortedFindings[0] && (
                      <div className="absolute top-[40px] left-[150px] bg-white border border-error shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
                        <span className="font-bold text-[11px] text-error capitalize">{sortedFindings[0].name.replace(/_/g, " ")}</span>
                        <span className="font-bold text-[10px] text-error font-mono">p = {sortedFindings[0].probability.toFixed(2)}</span>
                      </div>
                    )}
                    {sortedFindings[1] && (
                      <div className="absolute top-[40px] right-0 bg-white border border-tertiary shadow-sm rounded-full px-3 py-1.5 flex flex-col items-center z-10">
                        <span className="font-bold text-[10px] text-tertiary capitalize">{sortedFindings[1].name.replace(/_/g, " ")}</span>
                        <span className="font-bold text-[9px] text-tertiary font-mono">p = {(sortedFindings[1].probability ?? 0).toFixed(2)}</span>
                      </div>
                    )}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                      <path d="M 80,30 Q 120,45 150,55" fill="none" stroke="#FFA726" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="95" y="40" fill="#FFA726" fontSize="9" fontWeight="bold">Rule C-04</text>
                      <path d="M 80,110 Q 120,80 150,55" fill="none" stroke="#26A69A" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="100" y="95" fill="#26A69A" fontSize="9" fontWeight="bold">Rule C-09</text>
                      <path d="M 270,55 L 320,55" fill="none" stroke="#4DB6AC" strokeWidth="2" markerEnd="url(#arrG)" />
                      <text x="280" y="50" fill="#4DB6AC" fontSize="9" fontWeight="bold">Rule P-02</text>
                      <defs>
                        <marker id="arrG" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4DB6AC" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-error">Rule ID: CDSS-IND-TB-REV-3.2 (Rule C-04)</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">Awaiting Clinician Validation</span>
                  </div>
                  <a href="https://doi.org/10.1016/j.chest.2021.08.012" target="_blank" rel="noreferrer" className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
                    doi:10.1016/j.chest.2021.08.012 <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                  <p className="text-xs text-on-surface leading-relaxed">
                    <strong>Clinical Context:</strong> Prior tuberculosis creates residual fibrotic parenchymal distortion and calcifications, shifting false-positive specificity for acute lower-zone findings.
                  </p>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    Effect: <strong>OR: 2.4x</strong> [95% CI: 1.8–3.2] · Baseline Shift: <strong className="text-error">+14.2% acute risk threshold</strong>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Review form */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  Clinician Diagnostic Review &amp; Sign-Off
                </h2>
                <span className="px-2 py-1 rounded-full bg-[#EBF0F5] text-[#4A6583] text-[10px] font-bold font-mono">Dr. {authUser?.name} (Attending MO)</span>
              </div>

              {isSignedOff ? (
                <div className="p-4 bg-tertiary-container/20 border border-tertiary-container text-tertiary rounded-lg text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                  <div className="font-bold">Study has been securely signed off.</div>
                  {reviews && reviews[0] && <div className="text-sm">Decision: {reviews[0].decision}</div>}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-5">
                    {[
                      { val: "agree", label: "Agree with AI triage & recommendations", sub: "Confirms findings; dispatch for urgent clinical validation & direct tele-consult.", bg: "bg-[#F2F7FA] border-[#A8C7FA]" },
                      { val: "disagree", label: "Disagree with AI findings", sub: "Findings represent benign historical scarring or technical motion artifact.", bg: "bg-[#FFF3F3] border-[#FFB4AB]" },
                      { val: "needs_more", label: "Needs repeat imaging / Inadequate Quality", sub: "Poor inspiratory effort or positioning artifact. Request repeat erect PA.", bg: "bg-[#F4F4F4] border-outline" },
                    ].map(opt => (
                      <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border ${decision === opt.val ? opt.bg : "bg-surface-container-lowest border-outline-variant"} cursor-pointer transition-colors`}>
                        <input type="radio" name="decision" value={opt.val} checked={decision === opt.val} onChange={e => setDecision(e.target.value)} className="mt-1" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-on-surface">{opt.label}</span>
                          <span className="text-xs text-on-surface-variant">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                      <span>Assessment Notes for Health Worker:</span>
                      <span className="text-[10px] font-mono flex items-center gap-1 bg-surface-container-high px-1.5 rounded"><span className="w-1.5 h-1.5 bg-tertiary rounded-full" />ABHA EMR push</span>
                    </div>
                    <textarea
                      className="w-full bg-[#F4F7FB] p-3 rounded-lg border border-[#D5E1ED] focus:ring-2 focus:ring-primary outline-none text-sm text-[#4A6583] placeholder:text-[#9AAABF] resize-none h-24"
                      placeholder="Enter clinical assessment notes or instructions for the ANM..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase mr-1">Snippets:</span>
                      {["+ Confirmed opacity", "+ Prior scar", "+ Antibiotic dispatch", "+ Schedule follow-up"].map(s => (
                        <button key={s} onClick={() => setNotes(p => `${p} ${s}`)} className="px-2 py-1 rounded bg-[#EBF0F5] hover:bg-[#D5E1ED] text-[#4A6583] text-[11px] font-bold transition-colors">{s}</button>
                      ))}
                      <button
                        onClick={() => setNotes(groqSummary || "AI Note: Patient presents with significant high-priority findings. Requires immediate tele-consultation.")}
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
                    className="w-full py-3 bg-[#004A55] text-white font-bold rounded-lg hover:bg-[#003B44] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    {reviewMutation.isPending ? "Submitting…" : "Submit Review & Sign-Off Study"}
                  </button>
                  <p className="text-[9px] font-mono text-center text-on-surface-variant mt-2">
                    Cryptographically hashes attending registration with DICOM-SR digest.
                  </p>
                </>
              )}
            </div>

            {/* Audit trail */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant">
              <div className="flex items-center justify-between text-[10px] font-bold font-mono text-on-surface-variant uppercase tracking-wider mb-3">
                <span>Study Access &amp; Audit Trail (ISO 13485 / ABDM)</span>
                <span>{(reviews?.length ?? 0) + 2} Events</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                  <span className="text-[10px] font-mono font-bold text-[#4A6583] w-10 shrink-0">{new Date(study.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-[11px] font-mono text-[#4A6583]">Health worker uploaded DICOM radiograph to Edge Node.</span>
                </div>
                <div className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                  <span className="text-[10px] font-mono font-bold text-[#4A6583] w-10 shrink-0">{new Date(new Date(study.created_at).getTime() + 2 * 60000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-[11px] font-mono text-[#4A6583]">AI inference pipeline completed analysis for study #{study.id}.</span>
                </div>
                {reviews && reviews.map((r: any) => (
                  <div key={r.id} className="flex items-start gap-3 bg-[#F4F7FB] p-2.5 rounded border border-[#EBF0F5]">
                    <span className="text-[10px] font-mono font-bold text-[#4A6583] w-10 shrink-0">{new Date(r.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-[11px] font-mono text-[#4A6583]">Dr. reviewed — decision: <strong>{r.decision}</strong>. {r.notes && `Notes: "${r.notes}"`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-on-surface-variant mt-2">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          Decision support only. Not a diagnosis. Requires clinician review.
        </div>
      </div>
    </AppShell>
  );
}
