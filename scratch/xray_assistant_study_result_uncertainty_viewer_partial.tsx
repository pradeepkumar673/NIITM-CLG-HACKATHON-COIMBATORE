<>
<div className="flex flex-col w-full">

<div className="bg-surface-container-high px-space-md py-space-sm shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm flex-wrap">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">science</span>
        Prototype State:
      </span>
<div className="inline-flex rounded-lg bg-surface p-0.5 shadow-sm gap-0.5">
<button className="px-2.5 py-1 text-xs font-medium rounded text-on-primary bg-primary transition-all" id="btn-state-1" onClick="setScenario(1)">
          1. Review Needed (High)
        </button>
<button className="px-2.5 py-1 text-xs font-medium rounded text-on-surface-variant hover:text-on-surface transition-all" id="btn-state-2" onClick="setScenario(2)">
          2. Normal / Low
        </button>
<button className="px-2.5 py-1 text-xs font-medium rounded text-on-surface-variant hover:text-on-surface transition-all" id="btn-state-3" onClick="setScenario(3)">
          3. Unreliable Artifact
        </button>
<button className="px-2.5 py-1 text-xs font-medium rounded text-on-surface-variant hover:text-on-surface transition-all" id="btn-state-4" onClick="setScenario(4)">
          4. Experimental TB/Knee
        </button>
</div>
</div>
<div className="flex items-center gap-space-sm">
<button className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-surface text-on-surface-variant hover:text-primary shadow-sm transition-colors" id="btn-mobile-toggle" onClick="toggleMobileSim()">
<span className="material-symbols-outlined text-[16px]">smartphone</span>
<span id="mobile-toggle-text">Simulate Mobile (390px)</span>
</button>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">BUILD 4.2.1-PROD</span>
</div>
</div>

<div className="bg-surface px-space-lg py-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col gap-1 min-w-0">

<div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
<a className="hover:text-primary transition-colors" href="#">Triage Dashboard</a>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<a className="hover:text-primary transition-colors" href="#">Studies</a>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface" id="study-id-breadcrumb">IND-MH-82109</span>
<span className="text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant ml-1 font-medium" id="study-modality-badge">Chest PA</span>
</div>

<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
<span className="font-headline-md text-headline-md text-on-surface font-semibold" id="patient-name">Ramesh Patil, 48M</span>
<span className="font-mono-data-md text-mono-data-md text-secondary">ABHA: 91-8201-9481-22</span>
<span className="text-secondary">•</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">Acquired: 24 Oct 14:12 IST</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-mono-data-sm">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>DICOM Verified
        </span>
</div>
</div>

<div className="flex items-center gap-2 flex-wrap">
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-variant font-label-md text-label-md shadow-sm transition-colors">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        Export PDF
      </button>
<button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-surface-variant font-label-md text-label-md shadow-sm transition-colors">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
        Refer to Dr. Sharma (MO)
      </button>
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-colors" id="btn-reviewed" onClick="markReviewed()">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Mark Reviewed</span>
</button>
</div>
</div>

<div className="w-full transition-all duration-300 mx-auto px-0 py-space-md" id="workspace-container">

<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start" id="main-grid">

<section className="xl:col-span-6 flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">

<div className="flex flex-wrap items-center justify-between gap-space-sm pb-1">
<div className="inline-flex p-1 bg-surface-container rounded-lg shadow-sm">
<button className="px-3 py-1 text-xs font-semibold rounded text-on-surface-variant hover:text-on-surface transition-all" id="view-mode-orig" onClick="setViewerMode('orig')">
              Original
            </button>
<button className="px-3 py-1 text-xs font-semibold rounded bg-primary text-on-primary shadow-sm transition-all" id="view-mode-cam" onClick="setViewerMode('cam')">
              Heatmap overlay
            </button>
<button className="px-3 py-1 text-xs font-semibold rounded text-on-surface-variant hover:text-on-surface transition-all" id="view-mode-unc" onClick="setViewerMode('unc')">
              Uncertainty map
            </button>
</div>
<div className="flex items-center gap-1 text-on-surface-variant">
<button className="p-1.5 rounded hover:bg-surface-container transition-colors" onClick="resetZoom()" title="Zoom 1:1">
<span className="material-symbols-outlined text-[18px]">zoom_in</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container transition-colors" onClick="toggleInvert()" title="Invert Grayscale LUT">
<span className="material-symbols-outlined text-[18px]">invert_colors</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container transition-colors" onClick="resetPan()" title="Reset Pan">
<span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container transition-colors" onClick="fullscreenViewer()" title="Full View">
<span className="material-symbols-outlined text-[18px]">fullscreen</span>
</button>
</div>
</div>

<div className="relative w-full aspect-[4/5] bg-[#111827] rounded-lg overflow-hidden select-none shadow-md flex items-center justify-center group" id="dicom-viewport">

<svg className="w-full h-full object-contain filter contrast-125 brightness-95 transition-all duration-300" fill="none" id="base-xray" viewBox="0 0 600 750" xmlns="http://www.w3.org/2000/svg">
<rect fill="#090d16" height="750" width="600"></rect>

<path d="M140 180 C200 160 280 185 300 190 C320 185 400 160 460 180" opacity="0.8" stroke="#718096" strokeLinecap="round" strokeWidth="14"></path>

<rect fill="#64748b" height="420" opacity="0.7" rx="4" width="24" x="288" y="160"></rect>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="210" y2="210"></line>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="260" y2="260"></line>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="310" y2="310"></line>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="360" y2="360"></line>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="410" y2="410"></line>
<line stroke="#94a3b8" strokeWidth="3" x1="284" x2="316" y1="460" y2="460"></line>


<path d="M275 210 C275 210 210 200 170 240 C130 280 120 380 125 480 C130 550 160 590 270 575 Z" fill="#1e293b" opacity="0.95"></path>

<path d="M325 210 C325 210 390 200 430 240 C470 280 480 380 475 480 C470 550 430 580 325 565 Z" fill="#1e293b" opacity="0.95"></path>

<path d="M295 330 C330 330 395 390 395 490 C395 550 330 560 300 562 Z" fill="#94a3b8" opacity="0.75"></path>

<circle cx="288" cy="270" fill="#cbd5e1" opacity="0.6" r="28"></circle>

<g opacity="0.45" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="10">

<path d="M285 240 Q190 230 145 285"></path>
<path d="M285 290 Q170 290 130 350"></path>
<path d="M285 340 Q160 350 125 415"></path>
<path d="M285 390 Q155 410 128 475"></path>
<path d="M285 440 Q160 470 140 535"></path>
<path d="M285 490 Q180 520 165 570"></path>

<path d="M315 240 Q410 230 455 285"></path>
<path d="M315 290 Q430 290 470 350"></path>
<path d="M315 340 Q440 350 475 415"></path>
<path d="M315 390 Q445 410 472 475"></path>
<path d="M315 440 Q440 470 460 535"></path>
<path d="M315 490 Q420 520 435 570"></path>
</g>

<path d="M125 575 Q200 530 280 575" opacity="0.8" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="12"></path>

<path d="M320 570 Q400 540 475 575" opacity="0.8" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="12"></path>

<g id="pathology-density" opacity="0.7">
<ellipse cx="205" cy="510" fill="#f1f5f9" filter="blur(8px)" opacity="0.55" rx="55" ry="40"></ellipse>
<ellipse cx="215" cy="490" fill="#ffffff" filter="blur(6px)" opacity="0.45" rx="35" ry="30"></ellipse>

<path d="M185 480 L220 525 M210 475 L235 510" opacity="0.7" stroke="#0f172a" strokeWidth="2.5"></path>
</g>

<g className="hidden" id="motion-blur-artifacts" opacity="0.85">
<line stroke="#94a3b8" strokeDasharray="16 8" strokeWidth="6" x1="80" x2="160" y1="380" y2="400"></line>
<line stroke="#94a3b8" strokeDasharray="16 8" strokeWidth="6" x1="75" x2="170" y1="420" y2="445"></line>
<line stroke="#94a3b8" strokeDasharray="16 8" strokeWidth="6" x1="85" x2="175" y1="460" y2="485"></line>
<text fill="#f87171" font-family="JetBrains Mono" font-size="12" font-weight="bold" x="100" y="365">PATIENT RESPIRATORY GHOSTING</text>
</g>
</svg>

<div className="absolute inset-0 pointer-events-none transition-opacity duration-200" id="heatmap-overlay" style={{opacity: '0.65'}}>
<svg className="w-full h-full" fill="none" viewBox="0 0 600 750">
<defs>
<radialGradient cx="35%" cy="68%" fx="35%" fy="68%" id="camGlow1" r="22%">
<stop offset="0%" stop-color="#dc2626" stop-opacity="0.95"></stop>
<stop offset="40%" stop-color="#ea580c" stop-opacity="0.8"></stop>
<stop offset="70%" stop-color="#eab308" stop-opacity="0.5"></stop>
<stop offset="90%" stop-color="#06b6d4" stop-opacity="0.2"></stop>
<stop offset="100%" stop-color="#0284c7" stop-opacity="0"></stop>
</radialGradient>
<radialGradient cx="31%" cy="75%" fx="31%" fy="75%" id="camGlow2" r="14%">
<stop offset="0%" stop-color="#f97316" stop-opacity="0.75"></stop>
<stop offset="60%" stop-color="#eab308" stop-opacity="0.4"></stop>
<stop offset="100%" stop-color="#10b981" stop-opacity="0"></stop>
</radialGradient>
</defs>

<rect fill="url(#camGlow1)" height="750" width="600" x="0" y="0"></rect>

<rect fill="url(#camGlow2)" height="750" width="600" x="0" y="0"></rect>

<circle cx="210" cy="510" fill="none" opacity="0.6" r="32" stroke="#ffffff" strokeDasharray="4 2" strokeWidth="1.5"></circle>
<circle cx="210" cy="510" fill="none" opacity="0.4" r="62" stroke="#fef08a" strokeDasharray="3 3" strokeWidth="1"></circle>
</svg>
</div>

<div className="absolute inset-0 pointer-events-none transition-opacity duration-200 opacity-0" id="uncertainty-overlay">
<svg className="w-full h-full" fill="none" viewBox="0 0 600 750">
<pattern height="12" id="stipple" patternUnits="userSpaceOnUse" width="12">
<circle cx="2" cy="2" fill="#f43f5e" opacity="0.7" r="1.5"></circle>
<circle cx="8" cy="8" fill="#38bdf8" opacity="0.5" r="1"></circle>
</pattern>

<path d="M120 480 C140 520 180 570 250 570 C180 590 130 550 120 480 Z" fill="url(#stipple)"></path>

<path d="M380 220 Q440 230 460 280 Q410 260 380 220 Z" fill="url(#stipple)"></path>
<circle cx="185" cy="545" fill="none" opacity="0.8" r="48" stroke="#f43f5e" strokeDasharray="2 4" strokeWidth="1.5"></circle>
<text fill="#fecdd3" font-family="JetBrains Mono" font-size="11" font-weight="500" x="145" y="598">σ_mc: 0.19 (boundary)</text>
</svg>
</div>

<span className="absolute top-3 left-4 font-mono-data-sm text-mono-data-sm text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded pointer-events-none">R</span>
<span className="absolute top-3 right-4 font-mono-data-sm text-mono-data-sm text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded pointer-events-none">L</span>
<span className="absolute bottom-3 left-4 font-mono-data-sm text-mono-data-sm text-slate-400 bg-black/60 px-2 py-0.5 rounded pointer-events-none">FOV: 35x43cm • APEX-PA</span>

<div className="absolute bottom-3 right-4 font-mono-data-sm text-mono-data-sm text-teal-300 bg-black/80 px-2.5 py-1 rounded shadow pointer-events-none flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
<span>Hover uncertainty: <strong className="font-bold text-white">±0.06 σ_mc</strong></span>
</div>
</div>

<div className="flex items-center gap-space-md px-1 py-1 bg-surface-container-low rounded-lg">
<span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">Overlay Opacity</span>
<input className="w-full accent-primary h-1.5 bg-surface-container rounded-lg cursor-pointer" id="opacity-slider" max="100" min="0" onInput="updateOpacity(this.value)" type="range" value="65"/>
<span className="font-mono-data-md text-mono-data-md text-primary font-bold min-w-[3rem] text-right" id="opacity-val-readout">65%</span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-1">

<div className="p-2.5 bg-surface-container-low rounded-lg flex flex-col gap-1.5">
<div className="flex items-center justify-between text-xs text-on-surface-variant font-label-sm">
<span>Heatmap Saliency</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary">Grad-CAM L4</span>
</div>
<div className="h-2 w-full rounded-full bg-gradient-to-r from-sky-900 via-teal-500 via-amber-400 to-red-600"></div>
<div className="flex justify-between text-[10px] text-secondary font-mono-data-sm">
<span>0.00 (Low)</span>
<span>0.50</span>
<span>1.00 (Peak focus)</span>
</div>
</div>

<div className="p-2.5 bg-surface-container-low rounded-lg flex flex-col gap-1.5">
<div className="flex items-center justify-between text-xs text-on-surface-variant font-label-sm">
<span>Uncertainty Variance</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">Monte Carlo</span>
</div>
<div className="h-2 w-full rounded-full bg-gradient-to-r from-slate-200 via-rose-300 to-rose-700"></div>
<div className="flex justify-between text-[10px] text-secondary font-mono-data-sm">
<span>0.02 (Stable)</span>
<span>0.12</span>
<span>0.24 (Epistemic void)</span>
</div>
</div>
</div>
</section>

<section className="xl:col-span-3 flex flex-col gap-space-sm">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Findings</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-data-sm text-mono-data-sm font-semibold" id="findings-count">14 Evaluated</span>
</div>
<button className="font-label-sm text-label-sm text-primary hover:text-primary-container font-medium flex items-center gap-0.5" id="btn-toggle-all-findings" onClick="toggleAllFindings()">
<span id="findings-toggle-text">Show all 14</span>
<span className="material-symbols-outlined text-[16px]" id="findings-toggle-icon">expand_more</span>
</button>
</div>

<div className="flex flex-col gap-space-sm" id="findings-list">

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-xs" id="card-finding-consolidation">
<div className="flex items-start justify-between gap-2">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Right Lower Zone Consolidation</span>
<span className="font-body-sm text-body-sm text-secondary">Right lower zone parenchymal opacity</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wider font-label-sm shrink-0" id="consolidation-tier-badge">
                HIGH
              </span>
</div>

<div className="flex items-baseline justify-between mt-1 pt-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<div className="flex flex-col">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">Calibrated Prob</span>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-red-700" id="consolidation-p-val">0.82</span>
</div>
<div className="flex flex-col text-right">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">95% Confidence Interval</span>
<span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface" id="consolidation-ci-val">[0.74 – 0.88]</span>
</div>
</div>

<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-0.5">
<div className="bg-red-700 h-full rounded-full transition-all duration-500" style={{width: '82%'}}></div>
</div>
<div className="flex flex-wrap items-center justify-between gap-1 mt-1 text-xs">
<span className="inline-flex items-center gap-1 font-label-sm text-red-700 font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-red-700"></span>
                Cannot rule out
              </span>
<span className="text-secondary font-mono-data-sm text-mono-data-sm">Grad-CAM cluster #1</span>
</div>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-xs" id="card-finding-effusion">
<div className="flex items-start justify-between gap-2">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Pleural Effusion (Right)</span>
<span className="font-body-sm text-body-sm text-secondary">Blunting of right costophrenic angle</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider font-label-sm shrink-0">
                MEDIUM
              </span>
</div>
<div className="flex items-baseline justify-between mt-1 pt-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<div className="flex flex-col">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">Calibrated Prob</span>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-amber-700">0.58</span>
</div>
<div className="flex flex-col text-right">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">95% CI</span>
<span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">[0.49 – 0.67]</span>
</div>
</div>

<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-0.5">
<div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{width: '58%'}}></div>
</div>
<div className="flex items-center justify-between text-xs mt-1">
<span className="inline-flex items-center gap-1 font-label-sm text-amber-800 font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Cannot rule out
              </span>
<span className="text-secondary font-mono-data-sm text-mono-data-sm">Rt costophrenic sulcus</span>
</div>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-xs" id="card-finding-pneumo">
<div className="flex items-start justify-between gap-2">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Pneumothorax</span>
<span className="font-body-sm text-body-sm text-secondary">Apical / Bilateral lung margins</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider font-label-sm shrink-0">
                LOW
              </span>
</div>
<div className="flex items-baseline justify-between mt-1 pt-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<div className="flex flex-col">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">Calibrated Prob</span>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-secondary">0.04</span>
</div>
<div className="flex flex-col text-right">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">95% CI</span>
<span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">[0.01 – 0.08]</span>
</div>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-0.5">
<div className="bg-secondary h-full rounded-full" style={{width: '4%'}}></div>
</div>
<div className="flex items-center justify-between text-xs mt-1">
<span className="inline-flex items-center gap-1 font-label-sm text-secondary">
<span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                No evidence at this sensitivity
              </span>
<span className="text-secondary font-mono-data-sm text-mono-data-sm">Apical bilateral</span>
</div>
</div>

<div className="hidden p-space-md bg-surface-container-lowest rounded-xl shadow-sm relative overflow-hidden flex flex-col gap-space-xs" id="card-finding-unreliable">

<div className="absolute inset-y-0 right-0 w-24 opacity-15 pointer-events-none" style={{background: 'repeating-linear-gradient(45deg, #475467, #475467 6px, transparent 6px, transparent 12px)'}}></div>
<div className="flex items-start justify-between gap-2">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Rib Fracture / Cortical Discontinuity</span>
<span className="font-body-sm text-body-sm text-secondary">Right posterior 5th–7th ribs</span>
</div>
<span className="px-2.5 py-0.5 rounded text-xs font-mono-data-sm font-semibold text-slate-700 bg-slate-200 relative overflow-hidden shrink-0 shadow-sm">
<span className="relative z-10">UNRELIABLE</span>
</span>
</div>
<div className="flex items-baseline justify-between mt-1 pt-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg">
<div className="flex flex-col">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">Calibrated Prob</span>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-secondary font-mono">--</span>
</div>
<div className="flex flex-col text-right">
<span className="text-[10px] text-secondary font-label-sm uppercase tracking-wide">95% CI</span>
<span className="font-mono-data-sm text-mono-data-sm font-semibold text-secondary">Void</span>
</div>
</div>
<div className="p-2 rounded bg-amber-50 text-amber-900 text-xs flex items-center gap-1.5 mt-1 font-mono-data-sm">
<span className="material-symbols-outlined text-[16px] text-amber-700">motion_sensor_idle</span>
<span>Signal void: motion blur SNR &lt; 2.1</span>
</div>
</div>

<div className="hidden flex flex-col gap-space-xs pt-1" id="extra-findings-container">
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Cardiomegaly (CTR &gt; 0.50)</span>
<span className="text-[10px] text-secondary">Cardiac width normal</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.12</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.08–0.17]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Pulmonary Nodule / Mass</span>
<span className="text-[10px] text-secondary">No discrete focal densities</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.06</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.02–0.11]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Subsegmental Atelectasis</span>
<span className="text-[10px] text-secondary">Bibasilar horizontal discoid bands</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.08</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.04–0.14]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Interstitial Infiltration</span>
<span className="text-[10px] text-secondary">Reticular markings perihilar</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.14</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.09–0.21]</span>
<span className="text-secondary font-label-sm">Equivocal</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Hilar Lymphadenopathy</span>
<span className="text-[10px] text-secondary">Bilateral hilar contours</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.05</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.02–0.09]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Cavitation</span>
<span className="text-[10px] text-secondary">Apical cavitary lesions</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.03</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.01–0.07]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Subcutaneous Emphysema</span>
<span className="text-[10px] text-secondary">Chest wall soft tissues</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.01</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.00–0.03]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Diaphragmatic Hernia</span>
<span className="text-[10px] text-secondary">Hemidiaphragm domes intact</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.02</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.00–0.04]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Calcification (Granuloma)</span>
<span className="text-[10px] text-secondary">Benign calcified nodules</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.09</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.04–0.15]</span>
<span className="text-secondary font-label-sm">Non-urgent</span>
</div>
</div>
<div className="p-2.5 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-between text-xs">
<div className="flex flex-col">
<span className="font-semibold text-on-surface">Aortic Elongation / Ectasia</span>
<span className="text-[10px] text-secondary">Thoracic aorta profile</span>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">0.07</span>
<span className="font-mono-data-sm text-mono-data-sm text-secondary">[0.03–0.12]</span>
<span className="text-tertiary font-label-sm font-medium">Ruled out</span>
</div>
</div>
</div>
</div>
</section>

<section className="xl:col-span-3 flex flex-col gap-space-sm">

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-2" id="triage-header-card">
<div className="flex items-center justify-between">
<span className="text-xs uppercase tracking-wider text-secondary font-label-sm font-semibold">Triage Classification</span>

<span className="hidden px-2 py-0.5 rounded text-[11px] font-mono-data-sm font-bold text-purple-700 bg-purple-100 shadow-sm" id="experimental-badge">
              EXPERIMENTAL MODEL • v0.9-beta
            </span>
</div>
<div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-red-50 text-red-900 shadow-sm" id="triage-status-chip">
<span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" id="triage-dot"></span>
<span className="font-headline-sm text-headline-sm font-bold text-red-800" id="triage-label">TIER 1 • HIGH PRIORITY</span>
<span className="font-mono-data-sm text-mono-data-sm text-red-700 ml-auto" id="triage-thresh">(p ≥ 0.70)</span>
</div>
</div>

<div className="p-space-md rounded-xl bg-[#FFFAEB] text-[#B54708] shadow-sm flex flex-col gap-2" id="review-banner">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[20px] text-[#B54708]">warning</span>
<span className="font-label-md text-label-md font-bold text-[#B54708]" id="banner-title">Needs Human Review</span>
</div>
<ul className="text-xs space-y-1.5 pl-5 list-disc text-[#B54708] font-body-sm" id="banner-reasons">
<li>Calibrated probability for Right Lower Zone Consolidation exceeds triage threshold (<span className="font-mono-data-sm text-mono-data-sm font-semibold">p = 0.82 &gt; 0.70</span>).</li>
<li>Sub-optimal inspiration effort flagged on automated DICOM diaphragm inspection.</li>
<li>Clinical risk factor: Prior TB history noted in intake form.</li>
</ul>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-2">
<div className="flex items-center justify-between pb-1">
<span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-primary">account_tree</span>
              Clinical Rationale Chain
            </span>
<span className="text-xs font-mono-data-sm text-mono-data-sm text-secondary">Rule C-04</span>
</div>
<ol className="space-y-2 text-xs font-body-sm text-on-surface-variant leading-relaxed" id="rationale-chain">
<li className="flex gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">1.</span>
<span>Dense focal opacity mapped in right lower lobe with silhouette sign on right hemidiaphragm.</span>
</li>
<li className="flex gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">2.</span>
<span>Attention map peaks at <span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">(x: 642, y: 780)</span> matching clinical consolidation pattern.</span>
</li>
<li className="flex gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">3.</span>
<span>Monte Carlo dropout variance remains low (<span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">σ = 0.04</span>), confirming model feature stability.</span>
</li>
<li className="flex gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">4.</span>
<span>Escalation triggered under MoHFW Rural Tele-radiology Protocol Rule C-04.</span>
</li>
</ol>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px] text-primary">merge_type</span>
              Interaction Notes
            </span>
<span className="text-xs font-mono-data-sm text-mono-data-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">2 Cohort Rules</span>
</div>

<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-xs">
<p className="text-on-surface font-body-sm">
              Prior TB history increases false-positive probability of fibrotic scarring mimicking active consolidation.
            </p>
<div className="flex items-center justify-between pt-1">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">OR: 2.4x [95% CI: 1.8–3.2]</span>
<span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container text-secondary font-mono-data-sm">Draft rule • v1.2</span>
</div>
<a className="text-[11px] font-mono-data-sm text-secondary hover:text-primary transition-colors inline-flex items-center gap-0.5" href="#">
              doi:10.1016/j.chest.2021.08.012 ↗
            </a>
</div>

<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-xs">
<p className="text-on-surface font-body-sm">
              Smoker / bidi usage correlates with chronic bronchial wall thickening.
            </p>
<div className="flex items-center justify-between pt-1">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">Prevalence shift: +14.2%</span>
<span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-container text-secondary font-mono-data-sm">Draft rule • v1.2</span>
</div>
<a className="text-[11px] font-mono-data-sm text-secondary hover:text-primary transition-colors inline-flex items-center gap-0.5" href="#">
              doi:10.1136/thoraxjnl-2020-2155 ↗
            </a>
</div>
</div>

<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 text-[11px] text-secondary font-mono-data-sm shadow-sm">
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-medium">Model Architecture:</span>
<span className="text-primary font-semibold" id="meta-model-id">Chest-CAD-v4.2.1-RT</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-medium">Digest Checksum:</span>
<span className="truncate ml-2" title="sha256:8f2a9c1b4e07d3910c22e">sha256:8f2a9c1b4e...</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-medium">Cohort Baseline:</span>
<span>N=4,280 Rural Cohort</span>
</div>
<div className="flex justify-between items-center">
<span className="text-on-surface-variant font-medium">Inference Latency:</span>
<span className="text-tertiary font-semibold">1,420 ms (Edge TensorRT)</span>
</div>
</div>
</section>
</div>
</div>
</div>

</>