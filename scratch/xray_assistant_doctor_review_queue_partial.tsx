<>
<div className="flex flex-col w-full">

<div className="w-full bg-surface-container-high/60 backdrop-blur-md px-space-lg py-2.5 rounded-xl shadow-sm mb-space-md flex flex-wrap items-center justify-between gap-3">
<div className="flex items-center gap-2">
<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-semibold">α</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Prototype View State:</span>
</div>
<div className="flex flex-wrap items-center gap-1.5" id="state-switcher-container">
<button className="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center gap-1.5" id="tab-prioritized" onClick="switchViewState('prioritized')" type="button">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
        1. Prioritized Queue (Default)
      </button>
<button className="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-200 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm flex items-center gap-1.5" id="tab-empty" onClick="switchViewState('empty')" type="button">
<span className="w-2 h-2 rounded-full bg-outline-variant"></span>
        2. Queue Clear (Empty State)
      </button>
<button className="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-200 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm flex items-center gap-1.5" id="tab-loading" onClick="switchViewState('loading')" type="button">
<span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-ping"></span>
        3. Loading Skeletons
      </button>
<button className="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-200 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface shadow-sm flex items-center gap-1.5" id="tab-mobile" onClick="switchViewState('mobile')" type="button">
<span className="material-symbols-outlined text-[15px]">stay_current_portrait</span>
        4. Mobile Viewport (390px)
      </button>
</div>
</div>

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="hover:text-primary cursor-pointer transition-colors">Triage Dashboard</span>
<span className="text-outline-variant">/</span>
<span className="text-primary font-medium">Clinical Review Queue</span>
<span className="text-outline-variant">•</span>
<span className="inline-flex items-center gap-1 text-on-tertiary-container font-medium">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
          Cluster Sync Live
        </span>
</div>
<div className="flex items-center gap-3 mt-1">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Review queue</h1>
<span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-md text-mono-data-md font-bold" id="queue-badge-count">14 awaiting sign-off</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
        Prioritized tele-consultation and radiograph sign-off worklist • Kashti PHC Node #04 &amp; Cluster Tele-rad • Calibrated deterministic triage pipeline.
      </p>
</div>
<div className="flex items-center gap-2.5 flex-wrap">
<button className="h-11 px-4 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container-low transition-all duration-150 flex items-center gap-2" onClick="batchSignOffModal()" type="button">
<span className="material-symbols-outlined text-[18px]">rule_folder</span>
<span>Batch Sign-off Eligible (3)</span>
</button>
<button className="h-11 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all duration-150 flex items-center gap-2" onClick="exportQueueLog()" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>Export Queue Log</span>
</button>
</div>
</div>

<div className="flex flex-col gap-space-lg transition-opacity duration-200" id="view-prioritized">

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">

<div className="cursor-pointer group relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden" id="card-urgent" onClick="filterBySummary('urgent')" role="button" tabIndex="0">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">local_fire_department</span>
</span>
<span className="font-label-md text-label-md font-semibold text-error">Urgent Triage</span>
</div>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-error px-2 py-0.5 rounded-full bg-error-container">5</span>
</div>
<div className="flex items-baseline justify-between">
<span className="font-body-sm text-body-sm text-on-surface-variant">Tier 1 High (Consolidation, Pneumothorax, Effusion)</span>
<span className="font-mono-data-sm text-mono-data-sm text-error font-medium group-hover:translate-x-0.5 transition-transform">Filter →</span>
</div>
<div className="w-full bg-error-container h-1 rounded-full mt-3 overflow-hidden">
<div className="bg-error h-full rounded-full w-2/3"></div>
</div>
</div>

<div className="cursor-pointer group relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden" id="card-review" onClick="filterBySummary('review')" role="button" tabIndex="0">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">flag</span>
</span>
<span className="font-label-md text-label-md font-semibold text-on-surface">Needs Human Review</span>
</div>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-on-secondary-fixed-variant px-2 py-0.5 rounded-full bg-secondary-container">6</span>
</div>
<div className="flex items-baseline justify-between">
<span className="font-body-sm text-body-sm text-on-surface-variant">Flagged: High CI variance, artifact blur, discordant priors</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-medium group-hover:translate-x-0.5 transition-transform">Filter →</span>
</div>
<div className="w-full bg-secondary-container h-1 rounded-full mt-3 overflow-hidden">
<div className="bg-secondary h-full rounded-full w-3/4"></div>
</div>
</div>

<div className="cursor-pointer group relative bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden" id="card-all" onClick="filterBySummary('all')" role="button" tabIndex="0">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-2">
<span className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</span>
<span className="font-label-md text-label-md font-semibold text-on-surface">Awaiting Sign-off</span>
</div>
<span className="font-mono-data-lg text-mono-data-lg font-bold text-primary px-2 py-0.5 rounded-full bg-surface-container">14</span>
</div>
<div className="flex items-baseline justify-between">
<span className="font-body-sm text-body-sm text-on-surface-variant">Combined Tier 1–3 studies pending final digital signature</span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-medium group-hover:translate-x-0.5 transition-transform">Show all →</span>
</div>
<div className="w-full bg-surface-container h-1 rounded-full mt-3 overflow-hidden">
<div className="bg-primary h-full rounded-full w-full"></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">

<div className="relative flex-1 min-w-[280px]">
<span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-on-surface-variant pointer-events-none">search</span>
<input className="w-full h-11 pl-10 pr-9 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-inner" id="filter-search" onInput="handleSearch(this.value)" placeholder="Search Patient ID, ABHA, Study ID, or Clinical Finding..." type="text"/>
<button className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface transition-colors" onClick="clearSearch()" type="button">
<span className="material-symbols-outlined text-[18px]">cancel</span>
</button>
</div>

<div className="flex flex-wrap items-center gap-2.5">

<div className="relative">
<select className="appearance-none h-11 pl-3 pr-8 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm shadow-inner focus:outline-none focus:bg-surface-container-lowest cursor-pointer font-medium" id="filter-status" onChange="applyFilters()">
<option value="all">All Sign-off Statuses</option>
<option value="awaiting">Awaiting Doctor Review (14)</option>
<option value="second">Second Opinion Requested (2)</option>
<option value="clarification">Clarification Needed (1)</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
</div>

<div className="relative">
<select className="appearance-none h-11 pl-3 pr-8 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm shadow-inner focus:outline-none focus:bg-surface-container-lowest cursor-pointer font-medium" id="filter-modality" onChange="applyFilters()">
<option value="all">All Modalities</option>
<option value="chest">Chest (PA / AP Supine)</option>
<option value="knee">Knee Bilateral</option>
<option value="bone">Bone / Trauma Extremity</option>
<option value="spine">Spine Lumbar</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
</div>

<div className="relative">
<select className="appearance-none h-11 pl-3 pr-8 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm shadow-inner focus:outline-none focus:bg-surface-container-lowest cursor-pointer font-medium" id="filter-tier" onChange="applyFilters()">
<option value="all">All Triage Tiers</option>
<option value="tier1">Tier 1 High (p &gt; 0.70)</option>
<option value="tier2">Tier 2 Medium (0.30 ≤ p ≤ 0.70)</option>
<option value="tier3">Tier 3 Low (p &lt; 0.30)</option>
<option value="artifact">Unreliable / Artifact</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[16px] text-on-surface-variant pointer-events-none">expand_more</span>
</div>

<div className="h-11 px-3 bg-surface-container-low rounded-lg flex items-center gap-1.5 text-on-surface font-mono-data-sm text-mono-data-sm shadow-inner">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
<span>Today (24 Oct 2024)</span>
</div>

<button className="h-11 px-3 text-on-surface-variant hover:text-error font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick="resetAllFilters()" type="button">
<span className="material-symbols-outlined text-[16px]">restart_alt</span>
<span>Reset</span>
</button>
</div>
</div>

<div className="flex items-center justify-between px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-primary">swap_vert</span>
<span className="font-semibold text-on-surface">Strict Sort Enforcement:</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-data-sm">Triage Tier (Tier 1 High &gt; Tier 2 Med &gt; Tier 3 Low)</span>
<span className="text-outline-variant">→</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-data-sm">Human Review Flagged (Flagged first)</span>
</div>
<div className="text-on-surface-variant">
        Protocol: <span className="text-on-surface font-medium">CDSS-IND-TB-REV-3.2</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse min-w-[1080px]" id="studies-table">
<thead>
<tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider sticky top-0 z-20">
<th className="py-3.5 px-4 font-semibold" scope="col">Triage Tier</th>
<th className="py-3.5 px-3 font-semibold" scope="col">Study ID</th>
<th className="py-3.5 px-3 font-semibold" scope="col">Patient Demographics</th>
<th className="py-3.5 px-3 font-semibold" scope="col">Body Part</th>
<th className="py-3.5 px-4 font-semibold min-w-[240px]" scope="col">Top AI Finding &amp; Inference</th>
<th className="py-3.5 px-3 font-semibold min-w-[200px]" scope="col">Needs Review Flag</th>
<th className="py-3.5 px-3 font-semibold" scope="col">Submitted</th>
<th className="py-3.5 px-4 text-right font-semibold" scope="col">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface" id="table-body">

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="true" data-modality="chest" data-tier="tier1">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-error-container"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 1 High
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0984</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-82109</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">F, 42y • ABHA: ••••9012</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-error">
<span>Right Lower Zone Consolidation</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-error">p = 0.84</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full" style={{width: '84%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.79–0.89]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<div className="inline-flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">warning</span>
                    Flagged (2 reasons)
                  </span>
<span className="text-[11px] font-mono-data-sm text-on-surface-variant">1. Motion artifact (mild) • 2. Prior TB scar</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-error">12m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">14:12 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="inline-flex items-center gap-1.5 justify-end">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1" onClick="openStudy('STU-2024-0984')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
<div className="relative">
<button className="h-9 w-8 rounded-md bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors" onClick="toggleRowMenu('menu-1')" type="button">
<span className="material-symbols-outlined text-[16px]">more_vert</span>
</button>
<div className="hidden absolute right-0 mt-1 w-48 bg-surface-container-lowest rounded-lg shadow-xl py-1 z-30 font-label-sm text-label-sm text-on-surface" id="menu-1">
<button className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center gap-2" onClick="quickSignOff('STU-2024-0984')" type="button"><span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>Quick Sign-off</button>
<button className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center gap-2" type="button"><span className="material-symbols-outlined text-[16px] text-on-surface-variant">refresh</span>Request Retake</button>
<button className="w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center gap-2" type="button"><span className="material-symbols-outlined text-[16px] text-on-surface-variant">forward_to_inbox</span>Escalate to Radiologist</button>
</div>
</div>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="true" data-modality="chest" data-tier="tier1">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-error-container"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 1 High
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0981</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-77402</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">M, 61y • ABHA: ••••4431</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest AP Supine
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-error">
<span>Left Pneumothorax (Tension suspect)</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-error">p = 0.91</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full" style={{width: '91%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.86–0.96]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<div className="inline-flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">priority_high</span>
                    Flagged (1 reason)
                  </span>
<span className="text-[11px] font-mono-data-sm text-on-surface-variant">Calibrated p &gt; 0.90 critical alert</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-error">21m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">14:03 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="inline-flex items-center gap-1.5 justify-end">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1" onClick="openStudy('STU-2024-0981')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
<button className="h-9 px-2 rounded-md bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" onClick="quickSignOff('STU-2024-0981')" type="button">
<span className="material-symbols-outlined text-[16px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="false" data-modality="chest" data-tier="tier1">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 1 High
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0979</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-91033</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">F, 50y • ABHA: ••••1820</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-error">
<span>Right Pleural Effusion (Blunted Costophrenic)</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-error">p = 0.79</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full" style={{width: '79%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.72–0.85]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  Clean ingest
                </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">34m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">13:50 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0979')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="false" data-modality="bone" data-tier="tier1">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 1 High
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0975</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-65129</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">M, 28y • ABHA: ••••6621</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Tibia / Fibula AP
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-error">
<span>Displaced Tibial Shaft Fracture</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-error">p = 0.88</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full" style={{width: '88%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.82–0.93]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  Clean ingest
                </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">45m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">13:39 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0975')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="false" data-modality="chest" data-tier="tier1">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 1 High
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0970</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-44211</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">M, 73y • ABHA: ••••0019</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-error">
<span>Cardiomegaly with Pulmonary Venous Congestion</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-error">p = 0.74</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full" style={{width: '74%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.68–0.81]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  Clean ingest
                </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">52m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">13:32 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0970')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="true" data-modality="chest" data-tier="tier2">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 2 Med
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0968</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-98101</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">F, 35y • ABHA: ••••8712</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
<span>Equivocal Reticular Interstitial Pattern</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">p = 0.58</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{width: '58%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.44–0.71]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<div className="inline-flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">warning</span>
                    Flagged (Wide CI)
                  </span>
<span className="text-[11px] font-mono-data-sm text-on-surface-variant">Spread &gt; 0.25 (model uncertainty)</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">1h 05m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">13:19 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0968')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="true" data-modality="knee" data-tier="tier2">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 2 Med
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0963</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-33829</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">M, 52y • ABHA: ••••4110</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Knee Bilateral
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
<span>Moderate Osteoarthritis (Joint Space Loss)</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">p = 0.62</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{width: '62%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.54–0.70]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<div className="inline-flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">flag</span>
                    Flagged (Jewelry artifact)
                  </span>
<span className="text-[11px] font-mono-data-sm text-on-surface-variant">Radio-opaque overlay left patella</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">1h 18m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">13:06 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0963')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="false" data-modality="chest" data-tier="tier2">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 2 Med
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0958</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-19280</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">F, 29y • ABHA: ••••5531</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
<span>Mild Bronchial Wall Thickening</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-secondary">p = 0.44</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{width: '44%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.38–0.51]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  Clean ingest
                </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">1h 40m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">12:44 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0958')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="true" data-modality="chest" data-tier="tier3">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-primary font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 3 Low
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0951</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-55209</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">M, 19y • ABHA: ••••9921</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
<span>No Acute Infiltrate Detected</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-tertiary">p = 0.08</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-tertiary-container h-full rounded-full" style={{width: '8%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.04–0.12]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3">
<div className="inline-flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">flag</span>
                    Flagged (Hemoptysis note)
                  </span>
<span className="text-[11px] font-mono-data-sm text-on-surface-variant">MO indicated clinical red flag</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">2h 10m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">12:14 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1" onClick="openStudy('STU-2024-0951')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
</td>
</tr>

<tr className="hover:bg-surface-container-low/60 transition-colors group" data-flagged="false" data-modality="chest" data-tier="tier3">
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-primary font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 3 Low
                  </span>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
<div className="flex items-center gap-1.5 group-hover:underline cursor-pointer">
<span className="material-symbols-outlined text-[16px] text-outline">radiology</span>
<span>STU-2024-0947</span>
</div>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-02844</span>
<span className="text-on-surface-variant font-label-sm text-label-sm">F, 24y • ABHA: ••••3319</span>
</div>
</td>
<td className="py-3.5 px-3">
<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-4">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
<span>Unremarkable Bilateral Lung Fields</span>
</div>
<div className="flex items-center gap-2">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-tertiary">p = 0.03</span>
<div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
<div className="bg-tertiary-container h-full rounded-full" style={{width: '3%'}}></div>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">[95% CI: 0.01–0.05]</span>
</div>
</div>
</td>
<td className="py-3.5 px-3 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
<span className="inline-flex items-center gap-1 text-on-tertiary-container font-medium">
<span className="material-symbols-outlined text-[16px]">verified</span>
                  Batch Eligible
                </span>
</td>
<td className="py-3.5 px-3">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">2h 38m ago</span>
<span className="text-on-surface-variant font-mono-data-sm text-[11px]">11:46 IST</span>
</div>
</td>
<td className="py-3.5 px-4 text-right">
<div className="inline-flex items-center gap-1.5 justify-end">
<button className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1" onClick="openStudy('STU-2024-0947')" type="button">
<span>Open</span>
<span className="material-symbols-outlined text-[15px]">arrow_forward</span>
</button>
<button className="h-9 px-2 rounded-md bg-tertiary-fixed text-on-tertiary-fixed-variant hover:bg-tertiary-fixed-dim transition-colors flex items-center" onClick="quickSignOff('STU-2024-0947')" title="Quick Sign-off as Normal" type="button">
<span className="material-symbols-outlined text-[18px]">done_all</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<div className="px-space-md py-3.5 bg-surface-container-high/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<div className="flex items-center gap-3">
<span>Showing <strong className="text-on-surface font-semibold">1–10</strong> of <strong className="text-on-surface font-semibold">14</strong> studies awaiting sign-off</span>
<span className="text-outline-variant">•</span>
<div className="flex items-center gap-1">
<span>Rows:</span>
<select className="bg-surface-container-lowest text-on-surface rounded px-2 py-0.5 border-0 focus:outline-none cursor-pointer">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
</div>
</div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-outline hover:text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-50" disabled type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-semibold flex items-center justify-center" type="button">1</button>
<button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors" type="button">2</button>
<button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>

<div className="hidden flex-col items-center justify-center py-16 px-space-md transition-opacity duration-200" id="view-empty">
<div className="w-full max-w-xl bg-surface-container-lowest p-space-xl rounded-2xl shadow-md text-center flex flex-col items-center">
<div className="w-20 h-20 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center mb-space-md shadow-sm">
<span className="material-symbols-outlined text-[44px]">task_alt</span>
</div>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-mono-data-sm text-mono-data-sm font-semibold mb-3">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
        Zero Pending Worklist • Local Edge In Sync
      </span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mb-2">Queue is clear. No studies waiting for review.</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
        All urgent triages and routine radiographs for Kashti PHC Node #04 have been reviewed and digitally signed. New DICOM acquisitions will appear here automatically via live WebSocket.
      </p>
<div className="flex flex-wrap items-center justify-center gap-3 w-full">
<button className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-2" onClick="switchViewState('prioritized')" type="button">
<span className="material-symbols-outlined text-[18px]">refresh</span>
<span>Refresh Queue</span>
</button>
<button className="h-11 px-5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container shadow-sm transition-all flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
<span>View Signed Studies History</span>
</button>
</div>
<div className="mt-space-lg pt-space-md border-t border-surface-container-low w-full flex items-center justify-center gap-4 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>Last signed: STU-2024-0946 (Dr. Arti Sharma)</span>
<span>•</span>
<span>14:28:10 IST</span>
</div>
</div>
</div>

<div className="hidden flex-col gap-space-lg transition-opacity duration-200" id="view-loading">

<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col gap-3">
<div className="flex items-center justify-between">
<div className="w-28 h-5 bg-surface-container-high rounded"></div>
<div className="w-8 h-6 bg-surface-container rounded-full"></div>
</div>
<div className="w-48 h-4 bg-surface-container rounded"></div>
<div className="w-full h-1 bg-surface-container-high rounded-full mt-2"></div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col gap-3">
<div className="flex items-center justify-between">
<div className="w-32 h-5 bg-surface-container-high rounded"></div>
<div className="w-8 h-6 bg-surface-container rounded-full"></div>
</div>
<div className="w-56 h-4 bg-surface-container rounded"></div>
<div className="w-full h-1 bg-surface-container-high rounded-full mt-2"></div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col gap-3">
<div className="flex items-center justify-between">
<div className="w-36 h-5 bg-surface-container-high rounded"></div>
<div className="w-8 h-6 bg-surface-container rounded-full"></div>
</div>
<div className="w-52 h-4 bg-surface-container rounded"></div>
<div className="w-full h-1 bg-surface-container-high rounded-full mt-2"></div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-md animate-pulse">
<div className="flex items-center justify-between mb-4">
<div className="w-64 h-10 bg-surface-container-high rounded-lg"></div>
<div className="flex gap-2">
<div className="w-32 h-10 bg-surface-container rounded-lg"></div>
<div className="w-32 h-10 bg-surface-container rounded-lg"></div>
</div>
</div>
<div className="flex flex-col gap-3">
<div className="w-full h-12 bg-surface-container-high/60 rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
<div className="w-full h-14 bg-surface-container-low rounded"></div>
</div>
<div className="mt-4 flex items-center justify-between">
<div className="w-48 h-4 bg-surface-container rounded"></div>
<div className="w-36 h-8 bg-surface-container rounded-lg"></div>
</div>
</div>
</div>

<div className="hidden flex-col items-center justify-center transition-opacity duration-200" id="view-mobile">
<div className="text-center mb-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container font-mono-data-sm text-mono-data-sm text-on-surface">
<span className="material-symbols-outlined text-[16px] text-primary">smartphone</span>
        Mobile Device Preview (390px Canvas) • Strict Triage Order
      </span>
</div>

<div className="w-[390px] max-w-full bg-surface-bright rounded-2xl shadow-xl overflow-hidden flex flex-col p-3 gap-3">

<div className="flex items-center justify-between px-1 py-1">
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Review queue</h2>
<span className="font-mono-data-sm text-mono-data-sm text-error font-semibold">14 awaiting sign-off</span>
</div>
<span className="px-2 py-1 rounded-full bg-surface-container font-mono-data-sm text-mono-data-sm text-primary">Sorted Tier 1→3</span>
</div>

<div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">

<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
<div className="pl-4 pr-3 py-3 flex flex-col gap-2">

<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">STU-2024-0984</span>
<span className="px-2 py-0.5 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">Tier 1 High p=0.84</span>
</div>

<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="font-semibold text-on-surface">IND-MH-82109 (F, 42y)</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px]">Chest PA</span>
</div>

<div className="font-label-md text-label-md font-semibold text-error">
            Right Lower Zone Consolidation
          </div>

<div className="p-2 rounded-lg bg-secondary-fixed/50 flex flex-col gap-0.5">
<div className="flex items-center gap-1 text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
<span className="material-symbols-outlined text-[14px]">warning</span>
<span>Needs review (2 reasons)</span>
</div>
<span className="font-mono-data-sm text-[11px] text-on-secondary-fixed-variant">Motion blur detected • Prior TB history</span>
</div>

<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm pt-1">
<span>Submitted 12m ago</span>
<span>Kashti PHC</span>
</div>
<button className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-all" onClick="openStudy('STU-2024-0984')" type="button">
<span>Open Study for Sign-off</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
<div className="pl-4 pr-3 py-3 flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">STU-2024-0981</span>
<span className="px-2 py-0.5 rounded-full bg-error-container text-error font-mono-data-sm text-mono-data-sm font-bold">Tier 1 High p=0.91</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="font-semibold text-on-surface">IND-MH-77402 (M, 61y)</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px]">Chest AP Supine</span>
</div>
<div className="font-label-md text-label-md font-semibold text-error">
            Left Pneumothorax (Tension suspect)
          </div>
<div className="p-2 rounded-lg bg-secondary-fixed/50 flex flex-col gap-0.5">
<div className="flex items-center gap-1 text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
<span className="material-symbols-outlined text-[14px]">priority_high</span>
<span>Needs review (Critical calibration)</span>
</div>
<span className="font-mono-data-sm text-[11px] text-on-secondary-fixed-variant">Inference p &gt; 0.90 requires mandatory tele-eval</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm pt-1">
<span>Submitted 21m ago</span>
<span>Emergency Node</span>
</div>
<button className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-all" onClick="openStudy('STU-2024-0981')" type="button">
<span>Open Study for Sign-off</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
<div className="pl-4 pr-3 py-3 flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">STU-2024-0968</span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">Tier 2 Med p=0.58</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="font-semibold text-on-surface">IND-MH-98101 (F, 35y)</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px]">Chest PA</span>
</div>
<div className="font-label-md text-label-md font-semibold text-on-surface">
            Equivocal Reticular Pattern
          </div>
<div className="p-2 rounded-lg bg-secondary-fixed/50 flex flex-col gap-0.5">
<div className="flex items-center gap-1 text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-bold">
<span className="material-symbols-outlined text-[14px]">warning</span>
<span>Needs review (Wide CI: 0.44–0.71)</span>
</div>
<span className="font-mono-data-sm text-[11px] text-on-secondary-fixed-variant">AI confidence margin exceeds threshold</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm pt-1">
<span>Submitted 1h 05m ago</span>
<span>Kashti PHC</span>
</div>
<button className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-container shadow-sm transition-all" onClick="openStudy('STU-2024-0968')" type="button">
<span>Open Study for Sign-off</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>

<div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-tertiary"></div>
<div className="pl-4 pr-3 py-3 flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">STU-2024-0947</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-data-sm text-mono-data-sm font-bold">Tier 3 Low p=0.03</span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="font-semibold text-on-surface">IND-MH-02844 (F, 24y)</span>
<span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[11px]">Chest PA</span>
</div>
<div className="font-label-md text-label-md font-semibold text-on-surface">
            Unremarkable Lung Fields
          </div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm pt-1">
<span className="text-tertiary font-medium">✓ Clean Ingest • Batch eligible</span>
<span>11:46 IST</span>
</div>
<button className="w-full h-11 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-container shadow-sm transition-all" onClick="openStudy('STU-2024-0947')" type="button">
<span>Open Study for Sign-off</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>

<div className="mt-space-xl p-space-md rounded-xl bg-surface-container-low text-on-surface-variant flex flex-col md:flex-row items-center justify-between gap-3 font-mono-data-sm text-mono-data-sm shadow-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span className="font-semibold text-on-surface">Clinical Decision Support System (CDSS):</span>
<span>Decision support only. Not a definitive diagnosis. Requires clinician sign-off.</span>
</div>
<div className="flex items-center gap-3 text-[11px] text-outline">
<span>ABDM Milestone 2/3 Validated</span>
<span>•</span>
<span>ISO 13485:2016 Compliant</span>
<span>•</span>
<span>Edge Node: KASHTI-PHC-04</span>
</div>
</div>


</div>
</>