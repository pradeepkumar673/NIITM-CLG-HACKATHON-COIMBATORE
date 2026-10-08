<>
<div className="flex flex-col w-full">

<div className="bg-surface-container-low px-space-md py-space-sm rounded-xl mb-space-md shadow-sm">
<div className="flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-mono-data-sm text-mono-data-sm font-medium">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
          STATE SIMULATOR
        </span>
<span className="text-on-surface-variant font-label-sm text-label-sm hidden sm:inline">Active Mode:</span>
</div>

<div className="flex flex-wrap items-center gap-1 bg-surface-container-high p-1 rounded-lg" id="state-tab-container">
<button className="px-3 py-1.5 rounded text-on-surface font-label-sm text-label-sm transition-all bg-surface shadow-sm font-semibold text-primary" id="btn-state-complete" onClick="switchState('complete')" type="button">
          1. Complete Comparison
        </button>
<button className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all" id="btn-state-low-reg" onClick="switchState('low-reg')" type="button">
          2. Low Registration (&lt;0.65)
        </button>
<button className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all" id="btn-state-uncalibrated" onClick="switchState('uncalibrated')" type="button">
          3. Calibration Required
        </button>
<button className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all" id="btn-state-mismatch" onClick="switchState('mismatch')" type="button">
          4. Mismatched Patient ID
        </button>
<button className="px-2.5 py-1.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all flex items-center gap-1" id="btn-state-mobile" onClick="toggleMobileViewport()" title="Simulate 390px Mobile Viewport" type="button">
<span className="material-symbols-outlined text-[15px]">smartphone</span>
<span id="mobile-toggle-text">Mobile Sim</span>
</button>
</div>
</div>
</div>

<div className="space-y-space-sm mb-space-md" id="dynamic-alerts-container">

<div className="hidden bg-error-container p-space-md rounded-xl shadow-sm flex items-start gap-space-md transition-all" id="alert-mismatched-patient">
<span className="material-symbols-outlined text-error text-[24px] mt-0.5 shrink-0">emergency_home</span>
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-error-container font-bold">SAFETY CRITICAL: Patient Identifier Mismatch</span>
<span className="px-2 py-0.5 rounded-full bg-error text-on-error font-mono-data-sm text-mono-data-sm font-bold">BLOCKING INTERLOCK</span>
</div>
<p className="font-body-sm text-body-sm text-on-error-container mt-1">
          Earlier study references <strong>IND-MH-65129 (Ramesh Patil, M, 28y)</strong> while Later study references <strong>IND-MH-88402 (Devdas Shinde, M, 31y)</strong>.
          Longitudinal alignment and subtraction calculation are strictly inhibited to prevent cross-patient misattribution.
        </p>
</div>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-error font-label-sm text-label-sm font-semibold hover:bg-surface-dim transition-colors" onClick="dismissMismatchAlert()" type="button">
        Override Interlock (Audit Logged)
      </button>
</div>

<div className="hidden bg-error-container p-space-md rounded-xl shadow-sm flex items-start gap-space-md transition-all" id="alert-low-registration">
<span className="material-symbols-outlined text-error text-[24px] mt-0.5 shrink-0">warning</span>
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-error-container font-bold">Low Anatomical Registration Match (Similarity: 0.58 &lt; 0.65)</span>
<span className="px-2 py-0.5 rounded-full bg-error text-on-error font-mono-data-sm text-mono-data-sm font-semibold">HIGH TIER WARNING</span>
</div>
<p className="font-body-sm text-body-sm text-on-error-container mt-1">
          Images may not show the same anatomy or projection angle differs significantly (tilt discrepancy &gt; 8.4°). <strong>Do not rely on automated density subtraction or volume estimates.</strong> Manual caliper re-verification required.
        </p>
</div>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-dim transition-colors" onClick="resetAlignmentManual()" type="button">
        Recalculate Landmark Fit
      </button>
</div>

<div className="hidden bg-secondary-container p-space-md rounded-xl shadow-sm flex items-start gap-space-md transition-all" id="alert-calibration-required">
<span className="material-symbols-outlined text-primary text-[24px] mt-0.5 shrink-0">straighten</span>
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="font-headline-sm text-headline-sm text-on-secondary-fixed font-bold">Spatial Calibration Required for Later Study</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary font-mono-data-sm text-mono-data-sm font-semibold">ACTION NEEDED</span>
</div>
<p className="font-body-sm text-body-sm text-on-secondary-fixed-variant mt-1">
          Pixel pitch metadata absent in DICOM tag (0028,0030). Select two distinct cortical margins or a reference coin/marker on the radiograph to calibrate millimetric metrics.
        </p>
</div>
<button className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm" onClick="activateCalibrationMode()" type="button">
        Launch Caliper Calibration Tool
      </button>
</div>
</div>

<div className="w-full transition-all duration-300" id="main-viewport-frame">

<div className="bg-surface-container-lowest p-space-md rounded-xl mb-space-md shadow-sm">
<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">

<div className="flex-1 bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">history</span>
</div>
<div className="min-w-0">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono-data-sm text-mono-data-sm font-semibold">T-0 Baseline</span>
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface truncate" id="patient-id-earlier">IND-MH-65129</span>
</div>
<div className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate" id="patient-name-earlier">Ramesh Patil • M/28y</div>
<div className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
<span>12 Sep 2024 (6.0 wks ago)</span>
<span>•</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-medium">STU-2024-0812</span>
</div>
</div>
</div>
<span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant font-mono-data-sm text-mono-data-sm text-right shrink-0 hidden sm:block">
            Tibia/Fibula AP<br/>75 kVp • 4.2 mAs
          </span>
</div>

<div className="flex lg:flex-col items-center justify-center shrink-0 px-space-sm py-1 bg-surface-container rounded-lg">
<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[18px]">timelapse</span>
<span className="font-mono-data-md text-mono-data-md font-bold">42 Days Interval</span>
</div>
<div className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">
            Δ 6.0 Weeks Follow-up
          </div>
</div>

<div className="flex-1 bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">update</span>
</div>
<div className="min-w-0">
<div className="flex items-center gap-1.5">
<span className="px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary font-mono-data-sm text-mono-data-sm font-semibold">T-1 Current</span>
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface truncate" id="patient-id-later">IND-MH-65129</span>
</div>
<div className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate" id="patient-name-later">Ramesh Patil • M/28y</div>
<div className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
<span>24 Oct 2024 (Today)</span>
<span>•</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-medium">STU-2024-0975</span>
</div>
</div>
</div>
<div className="flex flex-col items-end shrink-0 hidden sm:flex">
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
              ABHA Verified
            </span>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm mt-0.5">
              Tibia/Fibula AP • 76 kVp
            </span>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">

<div className="lg:col-span-8 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
<button className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-dim transition-colors" id="tool-calibrate" onClick="toggleTool('calibrate')" title="Calibrate scale against cortical thickness" type="button">
<span className="material-symbols-outlined text-[18px]">square_foot</span>
<span>Calibrate Scale</span>
</button>
<button className="px-3 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-primary-container transition-colors shadow-sm" id="tool-roi" onClick="toggleTool('roi')" type="button">
<span className="material-symbols-outlined text-[18px]">polyline</span>
<span>Fracture ROI</span>
</button>
<button className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-dim transition-colors" id="tool-ref" onClick="toggleTool('ref')" type="button">
<span className="material-symbols-outlined text-[18px]">crop_free</span>
<span>Ref Bone ROI</span>
</button>
<button className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 hover:bg-surface-dim transition-colors" id="tool-caliper" onClick="toggleTool('caliper')" type="button">
<span className="material-symbols-outlined text-[18px]">linear_scale</span>
<span>Caliper (Gap)</span>
</button>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-end">

<div className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm flex items-center gap-1" id="calibration-indicator-badge">
<span className="material-symbols-outlined text-[14px] text-tertiary-container">check_circle</span>
<span id="calibrated-ratio-text">1 px = 0.142 mm</span>
</div>
<div className="flex items-center gap-1">
<button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" onClick="toggleInvertLut()" title="Invert Grayscale LUT" type="button">
<span className="material-symbols-outlined text-[20px]">invert_colors</span>
</button>
<button className="p-2 rounded-lg bg-surface-container-high text-primary hover:bg-surface-dim transition-colors" id="btn-sync-toggle" onClick="toggleSyncPanZoom()" title="Sync Pan/Zoom between views" type="button">
<span className="material-symbols-outlined text-[20px]">sync_alt</span>
</button>
<button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" onClick="resetCanvasTransform()" title="Reset Frame and Zoom" type="button">
<span className="material-symbols-outlined text-[20px]">fit_screen</span>
</button>
</div>
</div>
</div>

<div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col">
<div className="flex items-center justify-between pb-space-xs px-space-xs">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">compare</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Interactive Split Radiograph</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Midshaft Tibia (AP)</span>
</div>

<div className="relative w-full h-[460px] bg-black rounded-lg overflow-hidden select-none cursor-ew-resize mt-space-xs" id="slider-viewport">

<div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#070b10]">

<svg className="w-full h-full object-contain pointer-events-none opacity-90" viewBox="0 0 400 520">
<defs>
<radialGradient cx="50%" cy="50%" id="boneGlowLater" r="50%">
<stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"></stop>
<stop offset="45%" stop-color="#b8c6d4" stop-opacity="0.8"></stop>
<stop offset="85%" stop-color="#3d4955" stop-opacity="0.4"></stop>
<stop offset="100%" stop-color="#070b10" stop-opacity="0"></stop>
</radialGradient>
<filter id="softXray">
<feGaussianBlur result="blur" stddeviation="1.2"></feGaussianBlur>
<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
</filter>
</defs>

<path d="M120 10 C130 180, 125 360, 115 510 L300 510 C290 350, 285 170, 295 10 Z" fill="#141c24" opacity="0.6"></path>

<path d="M150 10 Q145 250 148 510" fill="none" opacity="0.75" stroke="#a0afbe" strokeLinecap="round" strokeWidth="16"></path>
<path d="M150 10 Q145 250 148 510" fill="none" opacity="0.6" stroke="#ffffff" strokeLinecap="round" strokeWidth="7"></path>

<path d="M245 10 L242 220 L243 510" fill="none" opacity="0.8" stroke="#b4c2ce" strokeLinecap="round" strokeWidth="48"></path>
<path d="M245 10 L242 220 L243 510" fill="none" opacity="0.9" stroke="#f0f5fa" strokeLinecap="round" strokeWidth="26"></path>

<path d="M245 20 L242 220 L243 500" fill="none" opacity="0.6" stroke="#687887" strokeLinecap="round" strokeWidth="14"></path>

<ellipse cx="242" cy="255" fill="#d2e0ec" filter="url(#softXray)" opacity="0.68" rx="36" ry="24"></ellipse>
<path d="M216 244 Q228 255 218 268 M262 242 Q254 256 264 270" fill="none" opacity="0.75" stroke="#ffffff" strokeWidth="8"></path>

<path d="M228 253 Q242 256 256 254" fill="none" opacity="0.7" stroke="#25303a" strokeDasharray="3,1" strokeWidth="2.5"></path>

<circle cx="242" cy="254" fill="#00e5ff" r="3"></circle>
</svg>
<span className="absolute top-3 right-3 px-2 py-1 rounded bg-surface/90 text-on-surface font-mono-data-sm text-mono-data-sm font-semibold shadow-sm backdrop-blur">
                  Later: 24 Oct 2024
                </span>
</div>

<div className="absolute inset-0 h-full overflow-hidden border-r-2 border-primary-fixed" id="slider-earlier-clipper" style={{width: '52%'}}>
<div className="absolute inset-0 w-[460px] sm:w-[480px] md:w-full h-full flex items-center justify-center bg-[#05080c]">

<svg className="w-full h-full object-contain pointer-events-none opacity-90" viewBox="0 0 400 520">

<path d="M120 10 C130 180, 125 360, 115 510 L300 510 C290 350, 285 170, 295 10 Z" fill="#141c24" opacity="0.5"></path>

<path d="M150 10 Q145 250 148 510" fill="none" opacity="0.7" stroke="#909fae" strokeLinecap="round" strokeWidth="16"></path>
<path d="M150 10 Q145 250 148 510" fill="none" opacity="0.5" stroke="#f1f5f9" strokeLinecap="round" strokeWidth="6"></path>

<path d="M245 10 L242 220 L243 510" fill="none" opacity="0.8" stroke="#aab7c3" strokeLinecap="round" strokeWidth="48"></path>
<path d="M245 10 L242 220 L243 510" fill="none" opacity="0.88" stroke="#f5f8fb" strokeLinecap="round" strokeWidth="26"></path>
<path d="M245 20 L242 220 L243 500" fill="none" opacity="0.65" stroke="#5d6c7b" strokeLinecap="round" strokeWidth="14"></path>

<path d="M214 246 L269 262" fill="none" stroke="#05080c" strokeLinecap="round" strokeWidth="6"></path>
<path d="M215 244 L240 252" fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="4"></path>

<path d="M217 240 L219 252" fill="none" stroke="#ffffff" strokeWidth="3"></path>
<path d="M266 256 L268 268" fill="none" stroke="#ffffff" strokeWidth="3"></path>
</svg>
<span className="absolute top-3 left-3 px-2 py-1 rounded bg-inverse-surface/90 text-inverse-on-surface font-mono-data-sm text-mono-data-sm font-semibold shadow-sm backdrop-blur">
                    Earlier: 12 Sep 2024
                  </span>
</div>
</div>

<div className="absolute inset-0 pointer-events-none">

<div className="absolute top-[236px] left-[52%] -translate-x-1/2 flex flex-col items-center">
<div className="px-2 py-0.5 rounded bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-semibold shadow-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[12px]">straighten</span>
<span>Callus Gap: 2.1 mm</span>
</div>
<div className="w-16 h-0.5 bg-primary-fixed mt-1 flex items-center justify-between">
<div className="w-1.5 h-3 bg-primary-fixed -mt-1"></div>
<div className="w-1.5 h-3 bg-primary-fixed -mt-1"></div>
</div>
</div>

<div className="absolute top-[80px] right-[24%] w-16 h-12 rounded bg-tertiary/20 flex items-start justify-end p-1">
<span className="text-[9px] font-mono-data-sm text-tertiary-fixed font-bold bg-tertiary px-1 rounded">ROI-Ref</span>
</div>
</div>

<div className="absolute top-0 bottom-0 w-1 bg-primary-fixed cursor-ew-resize z-20" id="slider-handle" style={{left: '52%'}}>
<div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-8 h-8 rounded-full bg-primary text-on-primary shadow-md flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">drag_indicator</span>
</div>
</div>
</div>

<div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-mono-data-sm text-mono-data-sm px-1">
<span>Drag handle left/right to compare periosteal healing</span>
<span>Zoom: 1.00x • Pan: [0, 0]</span>
</div>
</div>

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col">
<div className="flex items-center justify-between pb-space-xs px-space-xs">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">difference</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Radiographic Subtraction Map</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-mono-data-sm text-mono-data-sm font-semibold">
                Rigid + Affine Reg
              </span>
</div>

<div className="relative w-full h-[460px] bg-[#03060a] rounded-lg overflow-hidden select-none mt-space-xs flex items-center justify-center"  >

<svg className="w-full h-full object-contain pointer-events-none" viewBox="0 0 400 520">
<defs>
<filter height="140%" id="diffGlow" width="140%" x="-20%" y="-20%">
<feGaussianBlur result="blur" stddeviation="4"></feGaussianBlur>
<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
</filter>
</defs>

<path d="M120 10 C130 180, 125 360, 115 510 L300 510 C290 350, 285 170, 295 10 Z" fill="#0d141b" opacity="0.4"></path>
<path d="M150 10 Q145 250 148 510" fill="none" opacity="0.7" stroke="#1f2933" strokeWidth="12"></path>
<path d="M245 10 L242 220 L243 510" fill="none" opacity="0.7" stroke="#253240" strokeWidth="36"></path>

<path d="M226 238 Q234 246 226 254" fill="none" filter="url(#diffGlow)" opacity="0.85" stroke="#0284c7" strokeWidth="8"></path>
<circle cx="230" cy="246" fill="#0369a1" opacity="0.6" r="6"></circle>

<ellipse cx="254" cy="254" fill="#ea580c" filter="url(#diffGlow)" opacity="0.8" rx="28" ry="18"></ellipse>
<ellipse cx="252" cy="254" fill="#f97316" opacity="0.95" rx="16" ry="10"></ellipse>
<circle cx="250" cy="253" fill="#fef08a" opacity="0.9" r="5"></circle>

<path d="M216 252 Q212 264 220 272" fill="none" filter="url(#diffGlow)" opacity="0.75" stroke="#ea580c" strokeWidth="7"></path>
<path d="M266 244 Q274 256 268 268" fill="none" filter="url(#diffGlow)" opacity="0.75" stroke="#ea580c" strokeWidth="7"></path>

<circle className="transition-all duration-75" cx="252" cy="254" fill="none" id="diff-crosshair-dot" r="6" stroke="#ffffff" strokeWidth="1.5"></circle>
</svg>

<div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-md p-space-xs px-space-sm rounded-lg shadow-md flex items-center justify-between text-on-surface" id="diff-hover-badge">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error shrink-0"></span>
<span className="font-mono-data-sm text-mono-data-sm font-bold" id="diff-coord-title">ROI [x: 252, y: 254]</span>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">|</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-semibold" id="diff-density-value">Density Shift: +34.8% (Mineralized Callus)</span>
</div>
<div className="font-mono-data-sm text-mono-data-sm text-on-surface-variant hidden md:block">
                  Epistemic Uncertainty: ±0.032
                </div>
</div>
</div>

<div className="pt-space-sm px-1 flex flex-col gap-1">
<div className="h-3 w-full rounded-full bg-gradient-to-r from-sky-600 via-slate-800 to-amber-500 shadow-inner"></div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="flex items-center gap-1 text-sky-700">
<span className="w-2 h-2 rounded-full bg-sky-600"></span>
                  -35% HU (Resorption)
                </span>
<span className="text-on-surface-variant font-medium">0% Stable</span>
<span className="flex items-center gap-1 text-amber-800 font-semibold">
                  +48% HU (Callus Deposition)
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
</span>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm" id="card-registration-metric">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">center_focus_strong</span>
              Registration Quality
            </span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-mono-data-sm text-mono-data-sm font-bold" id="badge-similarity-status">
              0.89 MI (Concordant)
            </span>
</div>

<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full transition-all duration-500" id="bar-similarity-progress" style={{width: '89%'}}></div>
</div>

<div className="grid grid-cols-2 gap-2 pt-1 font-mono-data-sm text-mono-data-sm">
<div className="bg-surface-container-low p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">Axis Rotation</span>
<span className="font-bold text-on-surface" id="metric-axis-tilt">-1.8° [AP Tilt OK]</span>
</div>
<div className="bg-surface-container-low p-2 rounded-lg">
<span className="text-on-surface-variant block text-[11px]">Magnification Scale</span>
<span className="font-bold text-on-surface" id="metric-mag-scale">1.02x [Matched]</span>
</div>
</div>
<div className="hidden text-error font-body-sm text-body-sm bg-error-container p-2 rounded-lg" id="card-reg-warning-text">
            Rotational error exceeds safety limit (8.4°). Automated difference map suppressed.
          </div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">stacked_line_chart</span>
              Normalized Callus Density
            </span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-medium">
              Ref-Indexed
            </span>
</div>
<div className="flex items-baseline gap-2 pt-1">
<span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight" id="val-net-density">+28.6%</span>
<span className="font-label-md text-label-md text-on-surface-variant">Net Radiopacity</span>
</div>

<div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between font-mono-data-sm text-mono-data-sm">
<span className="text-on-surface-variant">Ratio (ΔROI_fx / ΔROI_ref)</span>
<span className="font-bold text-on-surface">1.34</span>
</div>

<div className="flex flex-col gap-1 pt-1">
<div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm">
<span className="text-on-surface-variant">95% Confidence Band</span>
<span className="font-bold text-primary">[+24.1% to +33.2%]</span>
</div>

<div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="absolute left-[54%] w-[20%] h-full bg-primary-container/80 rounded-sm"></div>
<div className="absolute left-[64%] w-1 h-full bg-primary"></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
              Fracture Gap Progression
            </span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-mono-data-sm text-mono-data-sm font-semibold">
              Gap Closes -56%
            </span>
</div>

<div className="w-full h-24 bg-surface-container-low rounded-lg p-2 flex flex-col justify-between">
<div className="flex items-center justify-between text-[11px] font-mono-data-sm text-on-surface-variant px-1">
<span>Baseline: 4.8 mm</span>
<span className="text-tertiary-container font-semibold">Target Union: &lt;1.0 mm</span>
</div>
<svg className="w-full h-14 overflow-visible" viewBox="0 0 280 60">

<line stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" x1="10" x2="270" y1="50" y2="50"></line>

<defs>
<linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#0f5e6b" stop-opacity="0.3"></stop>
<stop offset="100%" stop-color="#0f5e6b" stop-opacity="0.0"></stop>
</linearGradient>
</defs>
<path d="M 20 12 L 140 28 L 260 41 L 260 55 L 20 55 Z" fill="url(#curveFill)"></path>

<path d="M 20 12 L 140 28 L 260 41" fill="none" stroke="#0f5e6b" strokeLinecap="round" strokeWidth="2.5"></path>

<circle cx="20" cy="12" fill="#004550" r="4"></circle>
<circle cx="140" cy="28" fill="#004550" r="4"></circle>
<circle cx="260" cy="41" fill="#00633a" r="5" stroke="#ffffff" strokeWidth="1.5"></circle>

<text fill="#131c28" font-family="JetBrains Mono" font-size="9" text-anchor="middle" x="20" y="8">4.8</text>
<text fill="#131c28" font-family="JetBrains Mono" font-size="9" text-anchor="middle" x="140" y="24">3.6</text>
<text fill="#00633a" font-family="JetBrains Mono" font-size="9" font-weight="bold" text-anchor="middle" x="260" y="36">2.1</text>
</svg>
</div>

<div className="overflow-hidden rounded-lg">
<table className="w-full text-left font-body-sm text-body-sm">
<thead className="bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
<tr>
<th className="py-1.5 px-2">Timeline</th>
<th className="py-1.5 px-2">Date</th>
<th className="py-1.5 px-2 text-right">Cortical Gap</th>
</tr>
</thead>
<tbody className="font-mono-data-sm text-mono-data-sm text-on-surface divide-y-0">
<tr className="bg-surface-container-lowest">
<td className="py-1.5 px-2">Week 0 (Base)</td>
<td className="py-1.5 px-2 text-on-surface-variant">12 Sep 2024</td>
<td className="py-1.5 px-2 text-right font-bold">4.8 mm</td>
</tr>
<tr className="bg-surface-container-low">
<td className="py-1.5 px-2">Week 3 (F/U 1)</td>
<td className="py-1.5 px-2 text-on-surface-variant">03 Oct 2024</td>
<td className="py-1.5 px-2 text-right font-bold">3.6 mm</td>
</tr>
<tr className="bg-tertiary-fixed/30 font-semibold">
<td className="py-1.5 px-2 text-tertiary-container">Week 6 (Current)</td>
<td className="py-1.5 px-2 text-on-surface-variant">24 Oct 2024</td>
<td className="py-1.5 px-2 text-right font-bold text-tertiary-container">2.1 mm</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">biotech</span>
              Healing Trajectory
            </span>

<span className="px-2.5 py-0.5 rounded-full bg-[#f9f5ff] text-[#6941c6] font-mono-data-sm text-mono-data-sm font-bold shadow-sm">
              EXPLORATORY
            </span>
</div>

<div className="bg-surface-container-low p-2.5 rounded-lg text-on-surface-variant font-body-sm text-body-sm leading-snug">
<p className="italic text-[12px]">
              "Exploratory estimate based on published literature priors. Not validated on patient outcomes."
            </p>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-body-md text-body-md text-on-surface font-medium">Callus Bridging Index</span>
<span className="font-mono-data-md text-mono-data-md font-bold text-tertiary-container">68%</span>
</div>
<div className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">
            Expected Range: 60% – 75% at 6 weeks post-injury
          </div>

<div className="p-2.5 rounded-lg bg-tertiary-fixed/40 flex items-center justify-between" id="trajectory-status-chip">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
<span className="font-label-md text-label-md font-bold text-tertiary-container">Normal Trajectory</span>
</div>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">Priors: Tibial Shaft</span>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Literature Priors Cited:</span>
<a className="text-[11px] font-mono-data-sm text-primary hover:underline leading-tight flex items-center justify-between" href="https://doi.org/10.1302/0301-620X.60B4.363261" rel="noopener noreferrer" target="_blank">
<span>McKibbin B. Biology of fracture healing in long bones. JBJS Br.</span>
<span className="material-symbols-outlined text-[13px] shrink-0">open_in_new</span>
</a>
<a className="text-[11px] font-mono-data-sm text-primary hover:underline leading-tight flex items-center justify-between" href="https://doi.org/10.1097/00003086-199810001-00003" rel="noopener noreferrer" target="_blank">
<span>Marsh D. Concepts of fracture union. Clin Orthop Relat Res.</span>
<span className="material-symbols-outlined text-[13px] shrink-0">open_in_new</span>
</a>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">assignment_turned_in</span>
              Record Clinician Confirmation
            </span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA Sync</span>
</div>
<form className="flex flex-col gap-space-sm" onSubmit="handleOutcomeSubmit(event)">
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Assessment Date</label>
<div className="relative">
<input className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" type="date" value="2024-10-24"/>
</div>
</div>
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Outcome Classification</label>
<div className="relative">
<select className="w-full appearance-none bg-surface-container-low text-on-surface font-body-sm text-body-sm py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" id="outcome-classification-select">
<option selected value="progressing">Progressing toward union</option>
<option value="delayed">Delayed union</option>
<option value="non-union">Non-union suspected</option>
<option value="complete">Complete radiographic union</option>
<option value="inconclusive">Inconclusive / Repeat view required</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
</div>
</div>
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Clinical Assessment Notes</label>
<textarea className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm resize-none" placeholder="Enter longitudinal observations, weight-bearing guidance, or immobilisation updates..." rows="3">Cortical bridging evident at posteromedial border. Caliper gap narrowed to 2.1mm. Patient advised partial progressive weight-bearing (50%) with patellar-tendon-bearing brace. Follow-up at 10 weeks.</textarea>
</div>
<button className="w-full py-2.5 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2 mt-1" type="submit">
<span className="material-symbols-outlined text-[18px]">verified</span>
<span>Save Outcome &amp; Push to ABHA</span>
</button>
</form>
</div>
</div>
</div>
</div>

<div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm hidden items-center justify-center p-space-md" id="calibration-modal">
<div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-xl p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-primary">
<span className="material-symbols-outlined text-[24px]">straighten</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Spatial Calibration</span>
</div>
<button className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg" onClick="closeCalibrationModal()" type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
        To calculate millimeter-accurate cortical gaps and healing metrics, establish a known reference baseline across two landmark points on the cortical bone shaft or calibration marker.
      </p>
<div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between font-mono-data-sm text-mono-data-sm">
<span className="text-on-surface-variant">Selected Pixel Span:</span>
<span className="font-bold text-on-surface" id="calib-pixel-count">70.42 px</span>
</div>
<div>
<label className="block font-label-sm text-label-sm text-on-surface font-semibold mb-1">Physical Known Distance (mm)</label>
<div className="relative">
<input className="w-full bg-surface-container-low text-on-surface font-mono-data-md text-mono-data-md p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm" id="input-calib-mm" step="0.1" type="number" value="10.0"/>
<span className="absolute right-3 top-2.5 font-mono-data-sm text-mono-data-sm text-on-surface-variant">mm</span>
</div>
<span className="text-[11px] text-on-surface-variant font-body-sm block mt-1">Default: 10.0 mm reference cortical diameter</span>
</div>
<div className="flex items-center justify-end gap-space-sm pt-space-xs">
<button className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-dim transition-colors" onClick="closeCalibrationModal()" type="button">
          Cancel
        </button>
<button className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5" onClick="applyCalibration()" type="button">
<span className="material-symbols-outlined text-[18px]">check</span>
<span>Apply Calibration</span>
</button>
</div>
</div>
</div>

<div className="fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none" id="toast-notification">
<div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-lg flex items-center gap-space-sm font-label-md text-label-md">
<span className="material-symbols-outlined text-tertiary-fixed text-[20px]" id="toast-icon">check_circle</span>
<span id="toast-message">Outcome record written and queued to ABHA network</span>
</div>
</div>
</div>

</>