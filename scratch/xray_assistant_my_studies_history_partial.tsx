<>
<div className="flex flex-col w-full">

<div className="w-full bg-surface-container-high px-space-md py-space-sm rounded-xl mb-space-md shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px]">tune</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Interactive Prototype State:</span>
</div>
<div className="flex flex-wrap items-center gap-1.5" id="state-toggle-group">
<button className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all bg-primary text-on-primary shadow-sm flex items-center gap-1.5" id="btn-state-active" onClick="switchViewState('active')" type="button">
<span className="material-symbols-outlined text-[16px]">table_rows</span>
<span>1. Active Studies (Default)</span>
</button>
<button className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-sm flex items-center gap-1.5" id="btn-state-empty" onClick="switchViewState('empty')" type="button">
<span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
<span>2. Filtered Empty State</span>
</button>
<button className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-sm flex items-center gap-1.5" id="btn-state-skeleton" onClick="switchViewState('skeleton')" type="button">
<span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
<span>3. Loading Skeletons</span>
</button>
<button className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container shadow-sm flex items-center gap-1.5" id="btn-state-mobile" onClick="switchViewState('mobile')" type="button">
<span className="material-symbols-outlined text-[16px]">smartphone</span>
<span>4. Mobile Mode (390px Simulation)</span>
</button>
</div>
</div>

<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
<span>Triage Dashboard</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span>Studies</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">My Studies History</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">My studies</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
<span>Complete radiograph triage audit trail and edge case log</span>
<span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
<span className="font-mono-data-sm text-mono-data-sm text-primary font-medium">Kashti PHC Edge Node #04</span>
</p>
</div>

<div className="flex items-center gap-space-sm self-start md:self-auto">
<button className="h-11 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-secondary text-[20px]">download</span>
<span>Export CSV / Report</span>
</button>
<button className="h-11 px-5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2 font-medium" type="button">
<span className="material-symbols-outlined text-[20px]">add</span>
<span>+ New study</span>
</button>
</div>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">Today's Ingest</span>
<span className="material-symbols-outlined text-primary text-[20px]">upload_file</span>
</div>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-headline-lg text-headline-lg font-bold text-on-surface">18</span>
<span className="font-label-sm text-label-sm text-tertiary-container font-medium">+4 sync'd local</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-1">Total PHC quota: 50 / shift</span>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">Needs Review</span>
<span className="material-symbols-outlined text-[#B54708] text-[20px]">notification_important</span>
</div>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-headline-lg text-headline-lg font-bold text-[#B54708]">04</span>
<span className="font-label-sm text-label-sm text-[#B54708] font-medium bg-[#FFFAEB] px-1.5 py-0.5 rounded">Action pending</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-1">2 Motion blur • 2 High discord</span>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">Tier 1 High Triage</span>
<span className="material-symbols-outlined text-error text-[20px]">warning</span>
</div>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-headline-lg text-headline-lg font-bold text-error">12</span>
<span className="font-label-sm text-label-sm text-error bg-error-container px-1.5 py-0.5 rounded">Priority queue</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-1">Clinician escalations dispatched</span>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">ABHA Linked</span>
<span className="material-symbols-outlined text-tertiary-container text-[20px]">health_and_safety</span>
</div>
<div className="flex items-baseline gap-2 mt-2">
<span className="font-headline-lg text-headline-lg font-bold text-on-surface">96.4%</span>
<span className="font-label-sm text-label-sm text-tertiary-container font-medium">135 / 140</span>
</div>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-1">State Registry Auto-synced</span>
</div>
</div>

<div className="flex flex-col w-full" id="desktop-view-container">

<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-sm">
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm">

<div className="md:col-span-4 relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-secondary text-[20px]">search</span>
<input className="w-full h-11 pl-10 pr-9 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="filter-search-input" placeholder="Search Patient ID or ABHA ID..." type="text" value=""/>
<button className="absolute right-3 text-on-surface-variant hover:text-on-surface" onClick="document.getElementById('filter-search-input').value=''" type="button">
<span className="material-symbols-outlined text-[18px]">cancel</span>
</button>
</div>

<div className="md:col-span-2 relative">
<select className="w-full h-11 appearance-none px-3 pr-8 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="filter-status-select">
<option value="all">All Statuses</option>
<option value="ready">Ready</option>
<option value="processing">Processing</option>
<option value="needs_review">Needs review</option>
<option value="rejected">Rejected</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-3 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
</div>

<div className="md:col-span-2 relative">
<select className="w-full h-11 appearance-none px-3 pr-8 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="filter-modality-select">
<option value="all">All Modalities</option>
<option value="chest">Chest AP/PA</option>
<option value="knee">Knee Bilateral</option>
<option value="tibia">Tibia / Fibula</option>
<option value="spine">Spine Lumbar</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-3 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
</div>

<div className="md:col-span-4 relative flex items-center">
<div className="w-full h-11 flex items-center justify-between px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface shadow-sm cursor-pointer hover:bg-surface-container">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[20px]">date_range</span>
<span className="font-mono-data-sm text-mono-data-sm font-medium">01 Oct 2024 – 24 Oct 2024</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">calendar_today</span>
</div>
</div>
</div>

<div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div className="flex flex-wrap items-center gap-2">
<span className="font-label-sm text-label-sm text-on-surface-variant font-medium mr-1">Quick Filters:</span>
<button className="h-8 px-3 rounded-full bg-[#FFFAEB] text-[#B54708] font-label-sm text-label-sm font-semibold flex items-center gap-1.5 hover:bg-[#FEDF89]/60 transition-colors" type="button">
<span className="w-2 h-2 rounded-full bg-[#B54708]"></span>
<span>Needs review only (4)</span>
</button>
<button className="h-8 px-3 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1.5 hover:bg-error-container/80 transition-colors" type="button">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span>High triage (12)</span>
</button>
<button className="h-8 px-3 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors" type="button">
<span>Today (18)</span>
</button>
<button className="h-8 px-2.5 rounded-full text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1" onClick="resetFilters()" type="button">
<span className="material-symbols-outlined text-[16px]">restart_alt</span>
<span>Reset filters</span>
</button>
</div>
<div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-primary text-[16px]">database</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">140</span>
<span>total studies registered</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col" id="view-active-table">
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase sticky top-0 z-10 shadow-sm">
<th className="py-3.5 px-space-md font-semibold" scope="col">Study ID</th>
<th className="py-3.5 px-space-md font-semibold" scope="col">Patient ID / ABHA</th>
<th className="py-3.5 px-space-md font-semibold" scope="col">Body Part / View</th>
<th className="py-3.5 px-space-md font-semibold" scope="col">Uploaded (IST)</th>
<th className="py-3.5 px-space-md font-semibold" scope="col">Status</th>
<th className="py-3.5 px-space-md font-semibold" scope="col">Triage Classification</th>
<th className="py-3.5 px-space-md font-semibold text-center" scope="col">Quality / Flag</th>
<th className="py-3.5 px-space-md font-semibold text-right" scope="col">Action</th>
</tr>
</thead>
<tbody className="divide-y-0 text-on-surface font-body-sm text-body-sm">

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-container-lowest">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0984
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82109</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 9012</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 14:12 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#067647] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#067647]"></span>
                  Ready
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">
<span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                    Tier 1 HIGH (p=0.82)
                  </span>
<div className="w-32 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
<div className="h-full bg-error rounded-full" style={{width: '82%'}}></div>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#FFFAEB] text-[#B54708]" title="Diaphragm motion blur / Sub-optimal inspiration">
<span className="material-symbols-outlined text-[18px]">warning</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-bright">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0983
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82104</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 4421</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Chest AP Supine
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 13:48 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#067647] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#067647]"></span>
                  Ready
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 2 MED (p=0.58)
                  </span>
<div className="w-32 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
<div className="h-full bg-[#B54708] rounded-full" style={{width: '58%'}}></div>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#ECFDF3] text-[#067647]" title="Clinician verified optimal positioning">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-container-lowest">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0982
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82098</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 1187</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Knee Bilateral
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 13:15 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  Processing
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant italic">Inferencing on Edge...</span>
</td>
<td className="py-3.5 px-space-md text-center">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">—</span>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm opacity-60 cursor-not-allowed" disabled type="button">
                  Syncing
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-bright">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0981
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82087</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 5590</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 12:40 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#067647] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#067647]"></span>
                  Ready
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 3 LOW (p=0.04)
                  </span>
<div className="w-32 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{width: '8%'}}></div>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#ECFDF3] text-[#067647]" title="Clear exposure">
<span className="material-symbols-outlined text-[18px]">check_circle</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-container-lowest">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0980
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82082</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 7122</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Tibia / Fibula Left
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 11:22 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFAEB] text-[#B54708] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#B54708]"></span>
                  Needs review
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono-data-sm text-mono-data-sm font-bold">
                  ARTIFACT / UNRELIABLE
                </span>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#FFFAEB] text-[#B54708]" title="Collimator clipping on proximal joint">
<span className="material-symbols-outlined text-[18px]">warning</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-bright">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0979
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82075</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 3048</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Chest PA
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 10:55 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#067647] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#067647]"></span>
                  Ready
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">
<span className="material-symbols-outlined text-[14px]">crisis_alert</span>
                    Tier 1 HIGH (p=0.91)
                  </span>
<div className="w-32 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
<div className="h-full bg-error rounded-full" style={{width: '91%'}}></div>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#ECFDF3] text-[#067647]" title="Diagnostic quality approved">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-container-lowest">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0978
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82069</span>
<span className="font-mono-data-sm text-mono-data-sm text-error">ABHA: Unlinked</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Chest AP
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                24 Oct 09:30 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  Rejected
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="font-mono-data-sm text-mono-data-sm text-error font-medium">DICOM Header Parse Fail</span>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-error-container text-error" title="Corrupt metadata tag (0028,0010)">
<span className="material-symbols-outlined text-[18px]">error</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Inspect
                </button>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors cursor-pointer group bg-surface-bright">
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                STU-2024-0977
              </td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-mono-data-sm text-mono-data-sm font-medium text-on-surface">IND-MH-82054</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">ABHA: •••• 6802</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                  Spine Lumbar Lateral
                </span>
</td>
<td className="py-3.5 px-space-md font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                23 Oct 17:05 IST
              </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#067647] font-label-sm text-label-sm font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-[#067647]"></span>
                  Ready
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center w-fit gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono-data-sm text-mono-data-sm font-bold">
                    Tier 3 LOW (p=0.08)
                  </span>
<div className="w-32 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{width: '10%'}}></div>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-center">
<div className="inline-flex items-center justify-center p-1 rounded-md bg-[#ECFDF3] text-[#067647]" title="Quality check cleared">
<span className="material-symbols-outlined text-[18px]">check_circle</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<button className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all" type="button">
                  Open
                </button>
</td>
</tr>
</tbody>
</table>
</div>

<div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
<div className="text-on-surface-variant font-body-sm text-body-sm">
          Showing <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">1–25</span> of <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">140</span> studies
        </div>
<div className="flex items-center gap-1">
<button className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 opacity-70" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
<span>Previous</span>
</button>
<button className="w-9 h-9 rounded-lg bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-bold" type="button">1</button>
<button className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-mono-data-sm text-mono-data-sm font-medium" type="button">2</button>
<button className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-mono-data-sm text-mono-data-sm font-medium" type="button">3</button>
<span className="w-8 text-center text-on-surface-variant font-mono-data-sm text-mono-data-sm">...</span>
<button className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-mono-data-sm text-mono-data-sm font-medium" type="button">6</button>
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm flex items-center gap-1" type="button">
<span>Next</span>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
<span>Rows per page:</span>
<select className="appearance-none bg-surface-container-low px-2 py-1 pr-6 rounded-lg font-mono-data-sm text-mono-data-sm text-on-surface focus:outline-none shadow-sm">
<option>25</option>
<option>50</option>
<option>100</option>
</select>
</div>
</div>
</div>

<div className="hidden bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col items-center justify-center text-center py-16" id="view-empty-state">
<div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-space-md shadow-sm">
<span className="material-symbols-outlined text-[36px]">filter_alt_off</span>
</div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">No studies match these filters</h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
        Try adjusting your date range, body part modality, or triage status filters. Active parameters yielded 0 results on this PHC node.
      </p>
<div className="flex items-center gap-space-sm">
<button className="h-11 px-5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-sm flex items-center gap-2" onClick="resetFilters()" type="button">
<span className="material-symbols-outlined text-[20px]">restart_alt</span>
<span>Clear all filters</span>
</button>
<button className="h-11 px-4 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors" onClick="switchViewState('active')" type="button">
          View full study directory
        </button>
</div>
</div>

<div className="hidden bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col" id="view-skeleton-state">
<div className="p-space-md bg-surface-container-low flex items-center justify-between">
<div className="h-4 w-32 bg-surface-container-highest rounded animate-pulse"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded animate-pulse"></div>
</div>
<div className="p-space-md flex flex-col gap-4">

<div className="flex items-center justify-between gap-4 p-3 bg-surface-container-low rounded-lg animate-pulse">
<div className="h-4 w-28 bg-surface-container-highest rounded"></div>
<div className="h-4 w-36 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-6 w-32 bg-surface-container-highest rounded-full"></div>
<div className="h-8 w-16 bg-surface-container-highest rounded-lg"></div>
</div>
<div className="flex items-center justify-between gap-4 p-3 bg-surface-bright rounded-lg animate-pulse">
<div className="h-4 w-28 bg-surface-container-highest rounded"></div>
<div className="h-4 w-36 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-6 w-32 bg-surface-container-highest rounded-full"></div>
<div className="h-8 w-16 bg-surface-container-highest rounded-lg"></div>
</div>
<div className="flex items-center justify-between gap-4 p-3 bg-surface-container-low rounded-lg animate-pulse">
<div className="h-4 w-28 bg-surface-container-highest rounded"></div>
<div className="h-4 w-36 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-6 w-32 bg-surface-container-highest rounded-full"></div>
<div className="h-8 w-16 bg-surface-container-highest rounded-lg"></div>
</div>
<div className="flex items-center justify-between gap-4 p-3 bg-surface-bright rounded-lg animate-pulse">
<div className="h-4 w-28 bg-surface-container-highest rounded"></div>
<div className="h-4 w-36 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-6 w-32 bg-surface-container-highest rounded-full"></div>
<div className="h-8 w-16 bg-surface-container-highest rounded-lg"></div>
</div>
<div className="flex items-center justify-between gap-4 p-3 bg-surface-container-low rounded-lg animate-pulse">
<div className="h-4 w-28 bg-surface-container-highest rounded"></div>
<div className="h-4 w-36 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-4 w-24 bg-surface-container-highest rounded"></div>
<div className="h-6 w-20 bg-surface-container-highest rounded-full"></div>
<div className="h-6 w-32 bg-surface-container-highest rounded-full"></div>
<div className="h-8 w-16 bg-surface-container-highest rounded-lg"></div>
</div>
</div>
</div>
</div>

<div className="hidden flex flex-col items-center justify-center w-full my-space-md" id="view-mobile-state">
<div className="w-full max-w-[390px] bg-surface rounded-2xl shadow-xl overflow-hidden flex flex-col">

<div className="bg-surface-container-low p-space-md flex flex-col gap-3">
<div className="flex items-center justify-between">
<div>
<h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">My studies</h2>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Kashti PHC • 140 studies</span>
</div>
<button className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm" type="button">
<span className="material-symbols-outlined text-[20px]">add</span>
</button>
</div>

<div className="flex items-center gap-2">
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[18px]">search</span>
<input className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none shadow-sm" placeholder="Patient ID or ABHA..." type="text"/>
</div>
<button className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm" onClick="toggleMobileFilterDrawer()" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span>Filters</span>
<span className="w-5 h-5 rounded-full bg-primary text-on-primary font-mono-data-sm text-mono-data-sm flex items-center justify-center">2</span>
</button>
</div>
</div>

<div className="hidden bg-surface-container p-space-md shadow-inner flex flex-col gap-3" id="mobile-filter-drawer">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase font-bold text-on-surface">Active Filter Sheet</span>
<button className="text-on-surface-variant" onClick="toggleMobileFilterDrawer()" type="button">
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div className="flex flex-col gap-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">Status</label>
<select className="w-full h-9 rounded bg-surface-container-lowest font-body-sm text-body-sm px-2 text-on-surface">
<option>All Statuses</option>
<option selected>Needs Review (4)</option>
</select>
<label className="font-label-sm text-label-sm text-on-surface-variant">Modality</label>
<select className="w-full h-9 rounded bg-surface-container-lowest font-body-sm text-body-sm px-2 text-on-surface">
<option selected>Chest AP/PA</option>
<option>Knee</option>
</select>
</div>
<div className="flex items-center gap-2 pt-2">
<button className="flex-1 h-9 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold" onClick="toggleMobileFilterDrawer()" type="button">
            Apply filters (140)
          </button>
<button className="px-3 h-9 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm" onClick="toggleMobileFilterDrawer()" type="button">
            Reset
          </button>
</div>
</div>

<div className="p-space-sm flex flex-col gap-2.5 max-h-[520px] overflow-y-auto">

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-2 hover:bg-surface-container-low transition-colors cursor-pointer">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-82109</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647] font-mono-data-sm text-mono-data-sm font-semibold">
              Ready
            </span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="text-primary font-semibold">STU-2024-0984</span>
<span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Chest PA</span>
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
              Tier 1 (p=0.82)
            </span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">24 Oct 14:12 IST</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[#B54708] text-[18px]" title="Diaphragm motion blur">warning</span>
<span className="material-symbols-outlined text-secondary text-[20px]">chevron_right</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-2 hover:bg-surface-container-low transition-colors cursor-pointer">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-82104</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647] font-mono-data-sm text-mono-data-sm font-semibold">
              Ready
            </span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="text-primary font-semibold">STU-2024-0983</span>
<span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Chest AP Supine</span>
<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-bold">
              Tier 2 (p=0.58)
            </span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">24 Oct 13:48 IST</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[#067647] text-[18px]">verified</span>
<span className="material-symbols-outlined text-secondary text-[20px]">chevron_right</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col gap-2 hover:bg-surface-container-low transition-colors cursor-pointer">
<div className="flex items-center justify-between">
<span className="font-mono-data-sm text-mono-data-sm font-bold text-on-surface">IND-MH-82082</span>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-semibold">
              Needs review
            </span>
</div>
<div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="text-primary font-semibold">STU-2024-0980</span>
<span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">Tibia / Fibula</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-bold">
              Artifact
            </span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">24 Oct 11:22 IST</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[#B54708] text-[18px]">warning</span>
<span className="material-symbols-outlined text-secondary text-[20px]">chevron_right</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest border-t-0 p-space-xs flex items-center justify-around shadow-sm">
<button className="flex flex-col items-center text-on-surface-variant p-1" type="button">
<span className="material-symbols-outlined text-[20px]">grid_view</span>
<span className="font-label-sm text-[10px]">Dashboard</span>
</button>
<button className="flex flex-col items-center text-on-surface-variant p-1" type="button">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
<span className="font-label-sm text-[10px]">New</span>
</button>
<button className="flex flex-col items-center text-primary font-bold p-1" type="button">
<span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>folder_shared</span>
<span className="font-label-sm text-[10px]">Studies</span>
</button>
<button className="flex flex-col items-center text-on-surface-variant p-1" type="button">
<span className="material-symbols-outlined text-[20px]">person</span>
<span className="font-label-sm text-[10px]">Profile</span>
</button>
</div>
</div>
</div>

<div className="mt-space-lg w-full bg-surface-container-low p-space-md rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
<div className="flex items-start md:items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-primary text-[18px]">shield</span>
<div>
<span className="font-semibold text-on-surface">Clinical Decision Support System:</span>
<span className="ml-1">Decision support only. Not a diagnosis. Requires licensed clinician or tele-radiologist confirmation.</span>
</div>
</div>
<div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span className="inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-tertiary-container">verified</span>
<span>ABDM M2/M3 Validated</span>
</span>
<span>•</span>
<span>ISO 13485:2016 Compliant</span>
<span>•</span>
<span className="text-primary font-medium">MoHFW Tele-rad Cluster 2024</span>
</div>
</div>


</div>
</>