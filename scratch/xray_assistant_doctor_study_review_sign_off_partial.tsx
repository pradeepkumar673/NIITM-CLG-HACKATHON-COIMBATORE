<>
<div className="flex flex-col w-full">

<div className="w-full bg-surface-container-high px-space-md py-space-xs rounded-lg shadow-sm mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">tune</span>
<span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Prototype Viewport &amp; State Controller:</span>
</div>
<div className="flex flex-wrap items-center gap-1.5" id="state-ribbon">
<button className="px-2.5 py-1 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm transition-all shadow-sm" id="btn-state-default" onClick="setState('default')" type="button">
        1. In Review (Default)
      </button>
<button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-mono-data-sm text-mono-data-sm hover:bg-surface-container transition-all shadow-sm" id="btn-state-signed" onClick="setState('signed')" type="button">
        2. Sign-off Submitted
      </button>
<button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-mono-data-sm text-mono-data-sm hover:bg-surface-container transition-all shadow-sm" id="btn-state-no-rules" onClick="setState('no-rules')" type="button">
        3. Graph: No Rules Fired
      </button>
<button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-mono-data-sm text-mono-data-sm hover:bg-surface-container transition-all shadow-sm flex items-center gap-1" id="btn-toggle-mobile" onClick="toggleMobileSim()" type="button">
<span className="material-symbols-outlined text-[14px]">smartphone</span>
<span id="mobile-toggle-text">4. Mobile View Sim (390px)</span>
</button>
</div>
</div>

<div className="hidden w-full bg-tertiary-container/10 px-space-md py-2.5 rounded-lg shadow-sm mb-space-md flex flex-wrap items-center justify-between gap-space-sm" id="signed-banner">
<div className="flex items-center gap-2 text-tertiary-container">
<span className="material-symbols-outlined text-[20px]">verified</span>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Study Signed-off • Digital Authentication Complete</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Signature: DR_ARTI_SHARMA#ABDM-9102 • Consensus: Concordant Tier 1 Decision • Signed: 24 Oct 2024, 14:48:12 IST</span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-mono-data-sm text-mono-data-sm font-semibold">IMMUTABLE DICOM-SR GENERATED</span>
<button className="px-2 py-1 rounded text-primary hover:bg-surface-container-high font-label-sm text-label-sm" onClick="setState('default')">Edit Assessment</button>
</div>
</div>

<div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-sm">
<div className="flex flex-wrap items-center justify-between gap-space-md">

<div className="flex flex-wrap items-center gap-space-md">
<div className="flex items-center gap-2">
<span className="px-2 py-1 rounded bg-secondary-container font-mono-data-md text-mono-data-md text-on-secondary-fixed font-semibold tracking-tight">STU-2024-0984</span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">
<span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
            TIER 1 • HIGH PRIORITY (p = 0.84)
          </span>
</div>
<div className="flex items-center gap-2 text-on-surface font-body-sm text-body-sm">
<span className="font-semibold text-on-surface">Ramesh Patil</span>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">M, 48y</span>
<span className="text-on-surface-variant">•</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm">ABHA: 91-8201-9481-22</span>
<span className="material-symbols-outlined text-tertiary text-[16px]" title="ABHA Identity Validated">check_circle</span>
</div>
<div className="hidden md:flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px]">radiology</span>
<span>Chest PA (Erect)</span>
</div>
</div>

<div className="flex items-center gap-2">
<button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">arrow_back</span>
<span className="hidden sm:inline">Back to Queue</span>
</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">download</span>
<span className="hidden sm:inline">Export DICOM/PDF</span>
</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-error font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">flag</span>
<span className="hidden sm:inline">Peer Review</span>
</button>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 bg-surface-container-low px-3 py-1.5 rounded-lg">
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span><strong className="text-on-surface font-medium">Model:</strong> Chest-CAD-v4.2.1-RT</span>
<span className="hidden lg:inline"><strong className="text-on-surface font-medium">Checksum:</strong> sha256:8f2a9c1b3e80...</span>
<span><strong className="text-on-surface font-medium">Latency:</strong> 1,420ms (Edge TensorRT)</span>
<span className="hidden sm:inline"><strong className="text-on-surface font-medium">Capture:</strong> 24 Oct 2024 14:12 IST</span>
</div>
<div className="flex items-center gap-1.5 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
<span>Local Ingest Kashti PHC Edge #04</span>
</div>
</div>
</div>

<div className="w-full" id="desktop-view-container">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">

<div className="xl:col-span-5 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">

<div className="flex flex-wrap items-center justify-between gap-space-xs">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-surface">Radiographic Window</span>
<span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-data-sm text-mono-data-sm font-semibold">Sync: 100%</span>
</div>

<div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg">
<button className="p-1 rounded text-on-surface hover:bg-surface-container-lowest transition-colors" id="btn-toggle-invert" onClick="toggleInvert()" title="Invert LUT" type="button">
<span className="material-symbols-outlined text-[18px]">contrast</span>
</button>
<button className="p-1 rounded text-on-surface hover:bg-surface-container-lowest transition-colors" onClick="adjustZoom(1.1)" title="Zoom In" type="button">
<span className="material-symbols-outlined text-[18px]">zoom_in</span>
</button>
<button className="p-1 rounded text-on-surface hover:bg-surface-container-lowest transition-colors" onClick="adjustZoom(0.9)" title="Zoom Out" type="button">
<span className="material-symbols-outlined text-[18px]">zoom_out</span>
</button>
<button className="p-1 rounded text-on-surface hover:bg-surface-container-lowest transition-colors" onClick="resetViewer()" title="Reset View" type="button">
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
</button>
</div>
</div>

<div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-lg">
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              Heatmap Blend:
            </span>
<input className="w-32 h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" id="opacity-slider" max="100" min="0" onInput="updateHeatmapOpacity(this.value)" type="range" value="70"/>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-semibold" id="opacity-val">70%</span>
</div>

<div className="grid grid-cols-2 gap-2 bg-[#090D14] p-2 rounded-lg relative overflow-hidden">

<div className="relative bg-black rounded flex flex-col overflow-hidden aspect-[4/5] justify-between p-2 select-none" id="viewport-original">
<div className="flex justify-between items-start z-10">
<span className="px-1.5 py-0.5 rounded bg-black/60 text-white font-mono-data-sm text-mono-data-sm backdrop-blur-sm">DICOM PA Original</span>
<span className="font-mono-data-sm text-mono-data-sm text-white/60">R</span>
</div>

<div className="absolute inset-0 flex items-center justify-center p-2 viewer-canvas transition-transform duration-100" id="canvas-left">
<svg className="w-full h-full object-contain filter contrast-125" id="svg-xray-left" viewBox="0 0 400 500">

<rect fill="#0c1117" height="500" width="400" x="0" y="0"></rect>

<path d="M170,40 Q200,30 230,40 L230,120 Q240,160 250,220 Q260,300 230,380 L170,380 Q140,300 150,220 Q160,160 170,120 Z" fill="#2d3748" opacity="0.85"></path>

<path d="M190,200 Q220,200 240,250 Q260,310 200,340 Q170,330 175,280 Q180,220 190,200 Z" fill="#4a5568" opacity="0.8"></path>

<line stroke="#1a202c" strokeLinecap="round" strokeWidth="8" x1="200" x2="200" y1="40" y2="150"></line>
<line stroke="#1a202c" strokeWidth="5" x1="200" x2="160" y1="150" y2="190"></line>
<line stroke="#1a202c" strokeWidth="5" x1="200" x2="240" y1="150" y2="195"></line>

<path d="M50,90 Q120,70 190,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="7"></path>
<path d="M350,90 Q280,70 210,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="7"></path>

<g fill="none" opacity="0.4" stroke="#94a3b8" strokeLinecap="round" strokeWidth="4.5">
<path d="M70,120 Q120,110 180,130"></path>
<path d="M330,120 Q280,110 220,130"></path>
<path d="M60,160 Q120,150 175,175"></path>
<path d="M340,160 Q280,150 225,175"></path>
<path d="M55,210 Q120,195 170,225"></path>
<path d="M345,210 Q280,195 230,225"></path>
<path d="M55,260 Q120,245 165,280"></path>
<path d="M345,260 Q280,245 235,280"></path>
<path d="M60,315 Q120,300 170,335"></path>
<path d="M340,315 Q280,300 230,335"></path>
<path d="M70,370 Q120,355 175,385"></path>
<path d="M330,370 Q280,355 225,385"></path>
</g>

<path d="M40,410 Q110,360 180,385" fill="#1e293b" opacity="0.8" stroke="#e2e8f0" strokeWidth="5"></path>
<path d="M360,420 Q290,380 220,390" fill="#1e293b" opacity="0.8" stroke="#e2e8f0" strokeWidth="5"></path>

<ellipse cx="125" cy="340" fill="#e2e8f0" filter="blur(4px)" opacity="0.45" rx="36" ry="26"></ellipse>
<ellipse cx="140" cy="325" fill="#ffffff" filter="blur(3px)" opacity="0.55" rx="22" ry="18"></ellipse>
</svg>
</div>
<div className="flex justify-between items-end z-10">
<span className="font-mono-data-sm text-mono-data-sm text-white/50 text-[10px]">W: 1800 L: -400</span>
<span className="font-mono-data-sm text-mono-data-sm text-white/50 text-[10px]">100%</span>
</div>
</div>

<div className="relative bg-black rounded flex flex-col overflow-hidden aspect-[4/5] justify-between p-2 select-none" id="viewport-heatmap">
<div className="flex justify-between items-start z-10">
<span className="px-1.5 py-0.5 rounded bg-black/60 text-primary-fixed font-mono-data-sm text-mono-data-sm backdrop-blur-sm">Grad-CAM Overlay</span>
<span className="font-mono-data-sm text-mono-data-sm text-white/60">L</span>
</div>

<div className="absolute inset-0 flex items-center justify-center p-2 viewer-canvas transition-transform duration-100" id="canvas-right">
<svg className="w-full h-full object-contain filter contrast-125" id="svg-xray-right" viewBox="0 0 400 500">

<rect fill="#0c1117" height="500" width="400" x="0" y="0"></rect>
<path d="M170,40 Q200,30 230,40 L230,120 Q240,160 250,220 Q260,300 230,380 L170,380 Q140,300 150,220 Q160,160 170,120 Z" fill="#2d3748" opacity="0.85"></path>
<path d="M190,200 Q220,200 240,250 Q260,310 200,340 Q170,330 175,280 Q180,220 190,200 Z" fill="#4a5568" opacity="0.8"></path>
<line stroke="#1a202c" strokeLinecap="round" strokeWidth="8" x1="200" x2="200" y1="40" y2="150"></line>
<line stroke="#1a202c" strokeWidth="5" x1="200" x2="160" y1="150" y2="190"></line>
<line stroke="#1a202c" strokeWidth="5" x1="200" x2="240" y1="150" y2="195"></line>
<path d="M50,90 Q120,70 190,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="7"></path>
<path d="M350,90 Q280,70 210,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="7"></path>
<g fill="none" opacity="0.4" stroke="#94a3b8" strokeLinecap="round" strokeWidth="4.5">
<path d="M70,120 Q120,110 180,130"></path>
<path d="M330,120 Q280,110 220,130"></path>
<path d="M60,160 Q120,150 175,175"></path>
<path d="M340,160 Q280,150 225,175"></path>
<path d="M55,210 Q120,195 170,225"></path>
<path d="M345,210 Q280,195 230,225"></path>
<path d="M55,260 Q120,245 165,280"></path>
<path d="M345,260 Q280,245 235,280"></path>
<path d="M60,315 Q120,300 170,335"></path>
<path d="M340,315 Q280,300 230,335"></path>
<path d="M70,370 Q120,355 175,385"></path>
<path d="M330,370 Q280,355 225,385"></path>
</g>
<path d="M40,410 Q110,360 180,385" fill="#1e293b" opacity="0.8" stroke="#e2e8f0" strokeWidth="5"></path>
<path d="M360,420 Q290,380 220,390" fill="#1e293b" opacity="0.8" stroke="#e2e8f0" strokeWidth="5"></path>

<g id="heatmap-layer" opacity="0.7">

<ellipse cx="130" cy="335" fill="#0284c7" filter="blur(14px)" opacity="0.35" rx="65" ry="48"></ellipse>

<ellipse cx="130" cy="335" fill="#eab308" filter="blur(10px)" opacity="0.55" rx="44" ry="32"></ellipse>

<ellipse cx="135" cy="330" fill="#ef4444" filter="blur(6px)" opacity="0.8" rx="28" ry="20"></ellipse>

<circle cx="136" cy="328" fill="#fef08a" filter="blur(2px)" opacity="0.9" r="9"></circle>

<ellipse cx="130" cy="335" fill="none" opacity="0.75" rx="50" ry="36" stroke="#f59e0b" strokeDasharray="3,3" strokeWidth="1"></ellipse>
<ellipse cx="132" cy="332" fill="none" opacity="0.9" rx="32" ry="22" stroke="#ef4444" strokeWidth="1.2"></ellipse>
</g>
</svg>
</div>

<div className="absolute left-[34%] top-[65%] w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-error rounded-full flex items-center justify-center animate-pulse">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
</div>
<div className="flex justify-between items-end z-10">
<span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-semibold text-[10px]">Peak Saliency: 0.93</span>
<span className="font-mono-data-sm text-mono-data-sm text-white/50 text-[10px]">p=0.84</span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm px-1 pt-1 border-t-0">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-primary">my_location</span>
              Focus: Right Lower Zone [x: 642, y: 780]
            </span>
<span>Epistemic Var: <strong className="text-on-surface">±0.06 σ_mc</strong></span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs">
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-1">
<div className="flex items-center gap-1.5">
<span className="font-headline-sm text-headline-sm text-on-surface">Differential Findings</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface-variant font-medium">14 Evaluated</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Ranked by p(calibrated)</span>
</div>

<div className="overflow-x-auto max-h-[380px] overflow-y-auto">
<table className="w-full text-left border-collapse">
<thead className="sticky top-0 bg-surface-container-low z-10 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<tr>
<th className="py-2 px-2.5">Pathology Finding</th>
<th className="py-2 px-2.5 text-right">Probability</th>
<th className="py-2 px-2.5 text-center">95% CI</th>
<th className="py-2 px-2.5 text-center">Tier</th>
<th className="py-2 px-2.5 text-right">Cohort Metric</th>
</tr>
</thead>
<tbody className="divide-y-0 text-on-surface font-body-sm text-body-sm">

<tr className="bg-error-container/20 hover:bg-error-container/30 transition-colors">
<td className="py-2 px-2.5 font-medium flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span>RLZ Consolidation</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-error font-bold">
<div className="flex items-center justify-end gap-1.5">
<div className="w-12 h-1.5 rounded-full bg-outline-variant overflow-hidden hidden sm:block">
<div className="h-full bg-error rounded-full" style={{width: '84%'}}></div>
</div>
<span>0.84</span>
</div>
</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.79–0.89]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">TIER 1</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 91.4%</td>
</tr>

<tr className="bg-surface-container-low/40 hover:bg-surface-container-low transition-colors">
<td className="py-2 px-2.5 font-medium flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#B54708]"></span>
<span>Pleural Effusion (Right)</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-[#B54708] font-bold">
<div className="flex items-center justify-end gap-1.5">
<div className="w-12 h-1.5 rounded-full bg-outline-variant overflow-hidden hidden sm:block">
<div className="h-full bg-[#B54708] rounded-full" style={{width: '58%'}}></div>
</div>
<span>0.58</span>
</div>
</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.49–0.67]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-semibold">TIER 2</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 82.0%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5 font-medium">Cardiomegaly</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface font-semibold">
<div className="flex items-center justify-end gap-1.5">
<div className="w-12 h-1.5 rounded-full bg-outline-variant overflow-hidden hidden sm:block">
<div className="h-full bg-secondary rounded-full" style={{width: '44%'}}></div>
</div>
<span>0.44</span>
</div>
</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.38–0.51]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-semibold">TIER 2</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 78.5%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5 font-medium">Interstitial Opacity / Fibrosis</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface font-semibold">
<div className="flex items-center justify-end gap-1.5">
<div className="w-12 h-1.5 rounded-full bg-outline-variant overflow-hidden hidden sm:block">
<div className="h-full bg-secondary rounded-full" style={{width: '38%'}}></div>
</div>
<span>0.38</span>
</div>
</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.31–0.46]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-semibold">TIER 2</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 80.1%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Atelectasis</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.28</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.22–0.34]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 76.2%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Bronchial Wall Thickening</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.24</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.18–0.30]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 74.5%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Hilar Lymphadenopathy</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.15</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.10–0.21]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">PPV: 81.0%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Left Tension Pneumothorax</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.12</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.08–0.16]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rule-out: 98.6%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Cavitary Lesion</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.06</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.03–0.10]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rule-out: 98.1%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Pulmonary Edema</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.05</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.02–0.09]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rule-out: 97.9%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Unremarkable Lung Apices</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.04</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.01–0.08]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Spec: 96.0%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Rib Fracture (Healed/Acute)</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.03</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.01–0.06]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Spec: 97.4%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Subcutaneous Emphysema</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.02</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.00–0.05]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rule-out: 99.2%</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-2 px-2.5">Pneumoperitoneum</td>
<td className="py-2 px-2.5 text-right font-mono-data-md text-mono-data-md text-on-surface-variant">0.01</td>
<td className="py-2 px-2.5 text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">[0.00–0.03]</td>
<td className="py-2 px-2.5 text-center">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm">TIER 3</span>
</td>
<td className="py-2 px-2.5 text-right font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rule-out: 99.8%</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>

<div className="xl:col-span-7 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm" id="graph-panel-container">
<div className="flex flex-wrap items-center justify-between gap-space-xs">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[22px]">account_tree</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Clinical Interaction Graph &amp; Fired Rules</span>
</div>

<div className="flex items-center gap-3 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-error"></span>Finding</span>
<span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#B54708]"></span>Prior Risk</span>
<span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary"></span>Fired Edge</span>
</div>
</div>

<div className="relative w-full h-[260px] bg-surface-container-low rounded-lg overflow-hidden p-2 flex items-center justify-center" id="graph-viewport">

<div className="w-full h-full relative" id="graph-active-state">
<svg className="w-full h-full" viewBox="0 0 700 240">

<defs>
<marker id="arrow" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="8" refY="5" viewBox="0 0 10 10">
<path d="M 0 0 L 10 5 L 0 10 z" fill="#0F5E6B"></path>
</marker>
<marker id="arrow-amber" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="8" refY="5" viewBox="0 0 10 10">
<path d="M 0 0 L 10 5 L 0 10 z" fill="#B54708"></path>
</marker>
</defs>

<g className="cursor-pointer group" onClick="selectRule('rule-c04')">
<path className="group-hover:stroke-width-3 transition-all" d="M 170 65 L 340 120" marker-end="url(#arrow-amber)" stroke="#B54708" strokeDasharray="4,3" strokeWidth="2.5"></path>
<rect fill="#FFFAEB" height="20" rx="4" stroke="#FEDF89" strokeWidth="1" width="94" x="210" y="78"></rect>
<text fill="#B54708" font-family="JetBrains Mono" font-size="10" font-weight="600" text-anchor="middle" x="257" y="92">Rule C-04 [TB Scar]</text>
</g>

<g className="cursor-pointer group" onClick="selectRule('rule-c09')">
<path className="group-hover:stroke-width-3 transition-all" d="M 170 175 L 340 125" marker-end="url(#arrow)" stroke="#0F5E6B" strokeWidth="2"></path>
<rect fill="#E6F4F6" height="20" rx="4" stroke="#B2DFE6" strokeWidth="1" width="102" x="205" y="148"></rect>
<text fill="#0F5E6B" font-family="JetBrains Mono" font-size="10" font-weight="600" text-anchor="middle" x="256" y="162">Rule C-09 [Smoker]</text>
</g>

<g className="cursor-pointer group" onClick="selectRule('rule-p02')">
<path className="group-hover:stroke-width-3 transition-all" d="M 450 120 L 550 120" marker-end="url(#arrow)" stroke="#0F5E6B" strokeWidth="2"></path>
<rect fill="#E6F4F6" height="20" rx="4" stroke="#B2DFE6" strokeWidth="1" width="70" x="468" y="100"></rect>
<text fill="#0F5E6B" font-family="JetBrains Mono" font-size="10" font-weight="600" text-anchor="middle" x="503" y="114">Rule P-02</text>
</g>

<g className="cursor-pointer" transform="translate(60, 40)">
<rect fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" height="46" rx="6" stroke="#FEDF89" strokeWidth="1.5" width="115"></rect>
<rect fill="#B54708" height="34" rx="2" width="6" x="6" y="6"></rect>
<text fill="#131c28" font-family="Inter" font-size="11" font-weight="600" x="20" y="22">Prior TB History</text>
<text fill="#586579" font-family="JetBrains Mono" font-size="9" x="20" y="36">DOTS Regimen (2018)</text>
</g>

<g className="cursor-pointer" transform="translate(60, 150)">
<rect fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" height="46" rx="6" stroke="#D0D5DD" strokeWidth="1.5" width="115"></rect>
<rect fill="#525f73" height="34" rx="2" width="6" x="6" y="6"></rect>
<text fill="#131c28" font-family="Inter" font-size="11" font-weight="600" x="20" y="22">Smoker / Bidi</text>
<text fill="#586579" font-family="JetBrains Mono" font-size="9" x="20" y="36">15 pk-yr duration</text>
</g>

<g className="cursor-pointer" transform="translate(340, 90)">
<rect fill="#FEF3F2" filter="drop-shadow(0 2px 4px rgba(180,35,24,0.1))" height="58" rx="29" stroke="#FECDCA" strokeWidth="2" width="120"></rect>
<text fill="#B42318" font-family="Inter" font-size="11" font-weight="700" text-anchor="middle" x="60" y="25">RLZ Consolidation</text>
<text fill="#B42318" font-family="JetBrains Mono" font-size="11" font-weight="700" text-anchor="middle" x="60" y="42">p = 0.84</text>
</g>

<g className="cursor-pointer" transform="translate(545, 95)">
<rect fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" height="50" rx="25" stroke="#B2DFE6" strokeWidth="1.5" width="115"></rect>
<text fill="#004550" font-family="Inter" font-size="11" font-weight="600" text-anchor="middle" x="57" y="22">Pleural Effusion</text>
<text fill="#525f73" font-family="JetBrains Mono" font-size="10" font-weight="600" text-anchor="middle" x="57" y="38">p = 0.58</text>
</g>
</svg>
</div>

<div className="hidden w-full h-full flex flex-col items-center justify-center text-center p-space-md" id="graph-empty-state">
<span className="material-symbols-outlined text-outline text-[44px] mb-2">schema</span>
<span className="font-headline-sm text-headline-sm text-on-surface mb-1">No interaction rules fired for this study</span>
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                Edge CAD evaluated all 14 findings in statistical isolation. No comorbid interactions or prior history synergy thresholds (p &gt; 0.60) were met.
              </p>
</div>
</div>

<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-2" id="rule-drawer-card">
<div className="flex flex-wrap items-center justify-between gap-space-xs">
<div className="flex items-center gap-2">
<span className="px-2 py-0.5 rounded bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-bold">Rule ID: CDSS-IND-TB-REV-3.2 (Rule C-04)</span>
<span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm">Awaiting Clinician Validation</span>
</div>
<a className="inline-flex items-center gap-1 font-mono-data-sm text-mono-data-sm text-primary hover:underline" href="#">
<span>doi:10.1016/j.chest.2021.08.012</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
<strong>Clinical Context:</strong> Prior pulmonary tuberculosis creates residual fibrotic parenchymal distortion and calcifications, shifting false-positive specificity for acute lower-zone consolidation.
            </p>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-data-sm text-mono-data-sm text-on-surface-variant pt-1 border-t-0">
<span>Effect: <strong className="text-on-surface">Odds Ratio OR: 2.4x</strong> [95% CI: 1.8 – 3.2]</span>
<span>•</span>
<span>Baseline Shift: <strong className="text-error">+14.2% acute risk threshold</strong></span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md" id="signoff-panel">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[22px]">draw</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Clinician Diagnostic Review &amp; Sign-Off</span>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm">Dr. Arti Sharma (Attending MO)</span>
</div>

<div className="flex flex-col gap-2" id="decision-radio-group">
<label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors border-0">
<input checked className="mt-1 w-4 h-4 text-primary focus:ring-primary accent-primary" name="signoff_choice" type="radio" value="agree"/>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Agree with AI triage &amp; recommendations</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Confirms Tier 1 consolidation; dispatch for urgent sputum GeneXpert/microscopy &amp; direct tele-consult.</span>
</div>
</label>
<label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors border-0">
<input className="mt-1 w-4 h-4 text-primary focus:ring-primary accent-primary" name="signoff_choice" type="radio" value="disagree"/>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Disagree with AI findings (Discordant Discordance)</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Findings represent benign fibrotic scarring or technical motion artifact rather than acute consolidation.</span>
</div>
</label>
<label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors border-0">
<input className="mt-1 w-4 h-4 text-primary focus:ring-primary accent-primary" name="signoff_choice" type="radio" value="repeat"/>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Needs repeat imaging / Inadequate Quality</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Poor inspiratory effort or positioning artifact. Request repeat erect PA or lateral view.</span>
</div>
</label>
</div>

<div className="flex flex-col gap-1.5" id="notes-group">
<label className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between">
<span>Assessment Notes &amp; Guidance for Kashti PHC Health Worker:</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Supports ABHA EMR push</span>
</label>
<textarea className="w-full rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 p-3 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary" id="clinician-notes" placeholder="Enter clinical assessment notes, discordant rationale, or direct instructions for sister ANM..." rows="3"></textarea>

<div className="flex flex-wrap items-center gap-1.5 pt-1">
<span className="font-label-sm text-label-sm text-on-surface-variant">Insert Snippet:</span>
<button className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors" onClick="insertSnippet('Confirmed RLZ dense alveolar consolidation. Immediate sputum sample required.')" type="button">+ Confirmed RLZ opacity</button>
<button className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors" onClick="insertSnippet('Consistent with prior inactive TB residual calcification. No acute flare.')" type="button">+ Prior scar</button>
<button className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors" onClick="insertSnippet('Advise oral amoxicillin-clavulanate + urgent tele-consult in 48h.')" type="button">+ Antibiotic dispatch</button>
<button className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors" onClick="insertSnippet('Schedule 2-week follow-up chest radiograph.')" type="button">+ Schedule follow-up</button>
</div>
</div>

<div className="flex flex-col gap-2 pt-1" id="submit-action-group">
<button className="w-full py-3 px-space-md rounded-lg bg-primary hover:bg-[#0B4A54] text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center justify-center gap-2" id="btn-submit-signoff" onClick="submitSignoff()" type="button">
<span className="material-symbols-outlined text-[20px]">vpn_key</span>
<span>Submit review &amp; Sign-off study (ABHA Secure Key)</span>
</button>
<p className="text-center font-mono-data-sm text-mono-data-sm text-on-surface-variant">
              Cryptographically hashes attending registration #MH-MED-82194 with DICOM-SR digest.
            </p>
</div>

<div className="hidden bg-surface-container-low rounded-lg p-space-md flex flex-col gap-2" id="signed-locked-box">
<div className="flex items-center gap-2 text-tertiary">
<span className="material-symbols-outlined text-[22px]">lock</span>
<span className="font-headline-sm text-headline-sm">Record Locked &amp; Signed</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface">
              Dr. Arti Sharma affirmed Concordant Tier 1 consolidation on 24 Oct 2024 at 14:48:12 IST. Tele-consult dispatch notification transmitted to Sister Lakshmi Devi (Kashti PHC Node #04).
            </p>
</div>

<div className="flex flex-col gap-2 pt-2 border-t-0">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Study Access &amp; Audit Trail (ISO 13485 / ABDM Compliance)</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">5 Events Logged</span>
</div>
<div className="flex flex-col gap-1.5 font-mono-data-sm text-mono-data-sm text-on-surface-variant max-h-36 overflow-y-auto">
<div className="flex items-start gap-2 bg-surface-container-low p-2 rounded">
<span className="font-semibold text-primary">14:12 IST</span>
<span>Sister Lakshmi Devi (ANM) uploaded DICOM radiograph at Kashti PHC Edge Node #04.</span>
</div>
<div className="flex items-start gap-2 bg-surface-container-low p-2 rounded">
<span className="font-semibold text-primary">14:14 IST</span>
<span>Edge TensorRT CAD-v4.2.1 completed 14-pathology inferencing &amp; Monte Carlo dropout analysis (1,420 ms).</span>
</div>
<div className="flex items-start gap-2 bg-surface-container-low p-2 rounded">
<span className="font-semibold text-primary">14:28 IST</span>
<span>Automated ABDM health locker verification succeeded (Patient ABHA linked).</span>
</div>
<div className="flex items-start gap-2 bg-surface-container-low p-2 rounded">
<span className="font-semibold text-primary">14:35 IST</span>
<span>Dr. Arti Sharma (Attending MO) viewed DICOM viewer &amp; calibrated heatmaps.</span>
</div>
<div className="flex items-start gap-2 bg-surface-container-high p-2 rounded text-on-surface font-medium" id="audit-trail-pending">
<span className="font-semibold text-[#B54708]">14:42 IST</span>
<span>Review session active • Awaiting digital signature sign-off.</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>


<div className="hidden w-full flex justify-center py-space-sm" id="mobile-sim-container">
<div className="w-[390px] bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col overflow-hidden">

<div className="bg-primary text-on-primary p-3 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[20px]">medical_services</span>
<span className="font-label-md text-label-md font-semibold">STU-2024-0984</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">p=0.84</span>
</div>

<div className="flex border-b-0 bg-surface-container">
<button className="flex-1 py-2.5 text-center font-label-md text-label-md text-primary font-bold bg-surface-container-lowest border-b-2 border-primary" id="btn-m-tab-image" onClick="switchMobileTab('m-tab-image')" type="button">
          Image
        </button>
<button className="flex-1 py-2.5 text-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface" id="btn-m-tab-findings" onClick="switchMobileTab('m-tab-findings')" type="button">
          Findings
        </button>
<button className="flex-1 py-2.5 text-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface" id="btn-m-tab-graph" onClick="switchMobileTab('m-tab-graph')" type="button">
          Graph
        </button>
<button className="flex-1 py-2.5 text-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface" id="btn-m-tab-signoff" onClick="switchMobileTab('m-tab-signoff')" type="button">
          Sign-off
        </button>
</div>

<div className="p-3 flex flex-col gap-2" id="m-tab-image">
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>Ramesh Patil (48y/M)</span>
<span>Chest PA (Erect)</span>
</div>

<div className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg">
<span className="font-label-sm text-label-sm text-on-surface">Show Grad-CAM Heatmap:</span>
<input checked className="w-4 h-4 accent-primary" onChange="toggleMobileHeatmap(this.checked)" type="checkbox"/>
</div>
<div className="relative bg-black rounded-lg aspect-[4/5] flex items-center justify-center overflow-hidden">
<svg className="w-full h-full object-contain" viewBox="0 0 400 500">
<rect fill="#0c1117" height="500" width="400" x="0" y="0"></rect>
<path d="M170,40 Q200,30 230,40 L230,120 Q240,160 250,220 Q260,300 230,380 L170,380 Q140,300 150,220 Q160,160 170,120 Z" fill="#2d3748" opacity="0.85"></path>
<path d="M190,200 Q220,200 240,250 Q260,310 200,340 Q170,330 175,280 Q180,220 190,200 Z" fill="#4a5568" opacity="0.8"></path>
<path d="M50,90 Q120,70 190,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeWidth="7"></path>
<path d="M350,90 Q280,70 210,95" fill="none" opacity="0.7" stroke="#cbd5e1" strokeWidth="7"></path>
<g id="m-heatmap-layer" opacity="0.75">
<ellipse cx="130" cy="335" fill="#0284c7" filter="blur(14px)" opacity="0.35" rx="65" ry="48"></ellipse>
<ellipse cx="130" cy="335" fill="#eab308" filter="blur(10px)" opacity="0.55" rx="44" ry="32"></ellipse>
<ellipse cx="135" cy="330" fill="#ef4444" filter="blur(6px)" opacity="0.8" rx="28" ry="20"></ellipse>
</g>
</svg>
<div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-white font-mono-data-sm text-mono-data-sm text-[11px]">RLZ Focus (p=0.84)</div>
</div>
<p className="font-mono-data-sm text-mono-data-sm text-on-surface-variant text-center">Pinch-to-zoom simulated. Tap findings tab for metrics.</p>
</div>

<div className="hidden p-3 flex flex-col gap-2 max-h-[460px] overflow-y-auto" id="m-tab-findings">
<span className="font-label-md text-label-md font-bold text-on-surface">Top Differential Pathologies</span>
<div className="flex flex-col gap-1.5 font-body-sm text-body-sm">
<div className="p-2.5 rounded-lg bg-error-container/20 flex flex-col gap-1">
<div className="flex justify-between items-center">
<strong className="text-error font-medium">1. RLZ Consolidation</strong>
<span className="font-mono-data-md text-mono-data-md font-bold text-error">0.84</span>
</div>
<div className="flex justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>CI: [0.79–0.89]</span>
<span>PPV: 91.4% (Rural)</span>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex justify-between items-center">
<strong className="text-on-surface font-medium">2. Pleural Effusion (Right)</strong>
<span className="font-mono-data-md text-mono-data-md font-bold text-[#B54708]">0.58</span>
</div>
<div className="flex justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>CI: [0.49–0.67]</span>
<span>PPV: 82.0%</span>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex justify-between items-center">
<span className="text-on-surface">3. Cardiomegaly</span>
<span className="font-mono-data-md text-mono-data-md text-on-surface-variant">0.44</span>
</div>
<div className="flex justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>CI: [0.38–0.51]</span>
<span>PPV: 78.5%</span>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex justify-between items-center">
<span className="text-on-surface">4. Interstitial Opacity</span>
<span className="font-mono-data-md text-mono-data-md text-on-surface-variant">0.38</span>
</div>
<div className="flex justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>CI: [0.31–0.46]</span>
<span>PPV: 80.1%</span>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex justify-between items-center">
<span className="text-on-surface">5. Atelectasis</span>
<span className="font-mono-data-md text-mono-data-md text-on-surface-variant">0.28</span>
</div>
<div className="flex justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>CI: [0.22–0.34]</span>
<span>PPV: 76.2%</span>
</div>
</div>
</div>
</div>

<div className="hidden p-3 flex flex-col gap-2 max-h-[460px] overflow-y-auto" id="m-tab-graph">
<span className="font-label-md text-label-md font-bold text-on-surface">Fired Rule Insights</span>
<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex justify-between items-center">
<span className="px-2 py-0.5 rounded bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-bold">Rule C-04</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">OR: 2.4x</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface">
            Prior TB scar distortion shifts false-positive baseline for active lower-zone consolidation.
          </p>
</div>
<div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<div className="flex justify-between items-center">
<span className="px-2 py-0.5 rounded bg-surface-container text-primary font-mono-data-sm text-mono-data-sm font-bold">Rule C-09</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">OR: 1.6x</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface">
            15 pk-yr smoking increases baseline chronic peribronchial thickening.
          </p>
</div>
</div>

<div className="hidden p-3 flex flex-col gap-3 max-h-[460px] overflow-y-auto" id="m-tab-signoff">
<span className="font-label-md text-label-md font-bold text-on-surface">Clinical Decision</span>
<div className="flex flex-col gap-1.5">
<label className="flex items-center gap-2 p-2 rounded bg-surface-container-low">
<input checked className="accent-primary" name="m_signoff" type="radio"/>
<span className="font-body-sm text-body-sm font-medium">Agree with Tier 1 AI Triage</span>
</label>
<label className="flex items-center gap-2 p-2 rounded bg-surface-container-low">
<input className="accent-primary" name="m_signoff" type="radio"/>
<span className="font-body-sm text-body-sm font-medium">Disagree (Discordant Finding)</span>
</label>
</div>
<textarea className="w-full rounded bg-surface-container-low p-2 font-body-sm text-body-sm" placeholder="Quick clinical notes..." rows="2"></textarea>
<button className="w-full py-2.5 rounded bg-primary text-on-primary font-label-md text-label-md font-semibold" onClick="submitSignoff()" type="button">
          Submit &amp; Sign-off Study
        </button>
</div>

<div className="bg-surface-container-high p-2 text-center text-on-surface-variant font-mono-data-sm text-mono-data-sm text-[10px]">
        Decision support only. Requires clinician sign-off.
      </div>
</div>
</div>


</div>
</>