<>
<div className="flex flex-col w-full">

<div className="mb-space-lg p-space-sm bg-surface-container-high rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">tune</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant uppercase tracking-wider font-semibold">Interactive Prototype State</span>
</div>
<div className="flex flex-wrap items-center gap-1.5" id="prototype-states">
<button className="state-btn px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold transition-all shadow-sm" data-state-btn="default" onClick="setAppState('default')" type="button">
        1. Full Management (Default)
      </button>
<button className="state-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-all shadow-sm" data-state-btn="mismatch-focused" onClick="setAppState('mismatch-focused')" type="button">
        2. Checksum Mismatch Alert Focused
      </button>
<button className="state-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-all shadow-sm" data-state-btn="empty" onClick="setAppState('empty')" type="button">
        3. Empty States (No Models / No Users)
      </button>
<button className="state-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-all shadow-sm" data-state-btn="loading" onClick="setAppState('loading')" type="button">
        4. Loading Skeletons
      </button>
<button className="state-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-all shadow-sm" data-state-btn="mobile" onClick="setAppState('mobile')" type="button">
        5. Mobile Simulation (390px)
      </button>
</div>
</div>

<div className="w-full transition-all duration-300 flex flex-col gap-space-xl" id="canvas-container">

<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-xs">
<span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm font-medium">ABDM NODE: KASHTI-PHC-04</span>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">•</span>
<span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">CDSCO CLASS-B CDSS</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Model &amp; User Management</h1>
<p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Clinical AI Governance, Edge Inference Nodes &amp; User Access Control • Kashti PHC Cluster #04
        </p>
</div>

<div className="flex flex-wrap items-center gap-space-sm self-start lg:self-center">
<button className="h-11 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium shadow-sm transition-all flex items-center gap-2" onClick="syncWithCentralRegistry()" type="button">
<span className="material-symbols-outlined text-[18px] text-primary" id="sync-icon">sync</span>
<span>Sync Central Registry</span>
</button>
<button className="h-11 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium shadow-sm transition-all flex items-center gap-2" onClick="verifyAllChecksums()" type="button">
<span className="material-symbols-outlined text-[18px] text-tertiary-container" id="verify-icon">verified_user</span>
<span>Verify All Checksums</span>
</button>
<button className="h-11 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all flex items-center gap-2" onClick="openCreateUserModal()" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span>+ Create user</span>
</button>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm uppercase font-semibold">Active Models</span>
<span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="font-headline-lg text-headline-lg font-bold text-on-surface">4</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">/ 5 Registered</span>
</div>
<span className="mt-1 font-body-sm text-body-sm text-tertiary-container flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
          NVIDIA TensorRT 8.6 Edge Engine
        </span>
</div>
<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm uppercase font-semibold">Integrity State</span>
<span className="material-symbols-outlined text-error text-[20px]">warning</span>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="font-headline-lg text-headline-lg font-bold text-error">1 Warning</span>
<span className="font-mono-data-sm text-mono-data-sm text-error">SHA-256 Drift</span>
</div>
<span className="mt-1 font-body-sm text-body-sm text-error flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">block</span>
          Quarantine auto-enforced
        </span>
</div>
<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm uppercase font-semibold">Authorized Staff</span>
<span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="font-headline-lg text-headline-lg font-bold text-on-surface">8</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Clinicians &amp; ANMs</span>
</div>
<span className="mt-1 font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">badge</span>
          MCI/NMC ID Verified
        </span>
</div>
<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm uppercase font-semibold">CDSCO Cloud Sync</span>
<span className="material-symbols-outlined text-primary text-[20px]">cloud_sync</span>
</div>
<div className="mt-2 flex items-baseline gap-2">
<span className="font-mono-data-lg text-mono-data-lg font-semibold text-on-surface">08:30 IST</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Today</span>
</div>
<span className="mt-1 font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
          Air-gapped sync buffer 100% OK
        </span>
</div>
</div>



<section className="flex flex-col gap-space-md" id="models-section">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-3">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Registered Clinical Inference Models</h2>
<span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
            4 Active • 1 Integrity Warning
          </span>
</div>
<div className="flex items-center gap-2">
<span className="font-body-sm text-body-sm text-on-surface-variant">CDSCO/MoHFW Certified Baseline</span>
<span className="material-symbols-outlined text-[16px] text-tertiary-container">verified</span>
</div>
</div>

<div className="p-space-md rounded-xl bg-error-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-all" id="mismatch-banner">
<div className="flex items-start gap-3">
<div className="w-10 h-10 rounded-lg bg-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-error text-[24px]">gpp_maybe</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-error-container font-bold flex items-center gap-2">
<span>Checksum mismatch detected in active edge runtime</span>
<span className="px-2 py-0.2 rounded bg-error text-on-error font-mono-data-sm text-mono-data-sm">QUARANTINE ACTIVE</span>
</span>
<p className="font-body-sm text-body-sm text-on-error-container mt-0.5">
              Local binary for <strong className="font-semibold">Knee-BoneCAD-v0.8.2-Alpha</strong> differs from the Central CDSCO/MoHFW Certified Registry hash. Automatic inference quarantined until re-verified.
            </p>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<button className="h-10 px-4 rounded-lg bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md font-semibold shadow-sm transition-all flex items-center gap-1.5" onClick="resolveMismatchModal()" type="button">
<span className="material-symbols-outlined text-[16px]">file_download</span>
<span>Force Replace Binary</span>
</button>
<button className="h-10 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-error-container font-label-md text-label-md font-medium transition-all" onClick="inspectMismatchDigest()" type="button">
            Inspect Digest
          </button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden" id="models-table-view">
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<tr>
<th className="py-3 px-4">Model &amp; Pipeline</th>
<th className="py-3 px-4">Anatomy</th>
<th className="py-3 px-4">Runtime Engine</th>
<th className="py-3 px-4">SHA-256 Digest</th>
<th className="py-3 px-4">Integrity Status</th>
<th className="py-3 px-4 text-right">Validation</th>
<th className="py-3 px-4">Sync Timestamp</th>
<th className="py-3 px-4 text-center">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container text-body-sm font-body-sm" id="models-table-body">

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3.5 px-4">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Chest-CAD-v4.2.1-RT</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Triage &amp; Multi-pathology (TB, Pneumonia, Effusion)</span>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-medium">
                    Chest PA/AP
                  </span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm font-medium">
                    v4.2.1-RT (TensorRT FP16)
                  </span>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface">
<div className="flex items-center gap-1.5">
<span className="bg-surface-container px-2 py-0.5 rounded">sha256:8f2a9c1b...3e80</span>
<button className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="copyHash('sha256:8f2a9c1b984711d5f309a4b37012ef490c29a8f33194be08412ec708913e3e80', this)" title="Copy SHA-256" type="button">
<span className="material-symbols-outlined text-[16px]">content_copy</span>
</button>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">verified</span>
<span>Loaded &amp; Verified</span>
</span>
</td>
<td className="py-3.5 px-4 text-right">
<a className="font-mono-data-md text-mono-data-md text-primary font-semibold hover:underline inline-flex items-center gap-0.5" href="#">
<span>AUROC 0.942</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  24 Oct 2024, 08:30 IST
                </td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="reverifyModel('Chest-CAD')" title="Re-verify Hash" type="button">
<span className="material-symbols-outlined text-[18px]">rule</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Model Diagnostics" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="bg-error-container/20 hover:bg-error-container/30 transition-colors">
<td className="py-3.5 px-4">
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-label-md text-label-md font-bold text-error">Knee-BoneCAD-v0.8.2-Alpha</span>
<span className="material-symbols-outlined text-error text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Trabecular Density &amp; Cortical Texture</span>

<div className="mt-1.5 p-2 rounded bg-surface-container-lowest text-error font-body-sm text-body-sm shadow-sm">
<span className="font-semibold">Verification Failure:</span> Local SHA-256 does not match Central Registry sha256:7c9e0a81... Expected digest failed verification. Inference quarantined to prevent unvalidated predictions.
                    </div>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-medium">
                    Knee Bilateral
                  </span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm font-medium">
                    v0.8.2-Alpha (ONNX-CPU)
                  </span>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-error font-semibold">
<div className="flex items-center gap-1.5">
<span className="bg-error-container px-2 py-0.5 rounded line-through text-error">sha256:4d12c0aa...1f99</span>
<button className="p-1 rounded text-error hover:bg-error/10 transition-colors" onClick="copyHash('sha256:4d12c0aa48209bb9910d5402fe091c33a2908811d7c9e0a8110b991f99c011a0', this)" type="button">
<span className="material-symbols-outlined text-[16px]">content_copy</span>
</button>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold shadow-sm">
<span className="material-symbols-outlined text-[16px]">dangerous</span>
<span>MISMATCH - QUARANTINED</span>
</span>
</td>
<td className="py-3.5 px-4 text-right">
<span className="font-mono-data-md text-mono-data-md text-on-surface-variant line-through">
                    AUROC 0.884
                  </span>
<div className="font-label-sm text-label-sm text-error">Audit Blocked</div>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  12 Sep 2024, 11:20 IST
                </td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1.5">
<button className="px-2.5 py-1 rounded-md bg-error hover:bg-on-error-container text-on-error font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick="resolveMismatchModal()" type="button">
<span className="material-symbols-outlined text-[14px]">refresh</span>
<span>Replace</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3.5 px-4">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Fracture-RegNet-v2.0</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Longitudinal Rigid+Affine Alignment &amp; Callus Density</span>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-medium">
                    Tibia / Fibula
                  </span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm font-medium">
                    v2.0-Prod (TensorRT)
                  </span>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface">
<div className="flex items-center gap-1.5">
<span className="bg-surface-container px-2 py-0.5 rounded">sha256:3a71fe90...11bc</span>
<button className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="copyHash('sha256:3a71fe904092bba40194883ef028c614bca881773099acfe14088211bc901a55', this)" title="Copy SHA-256" type="button">
<span className="material-symbols-outlined text-[16px]">content_copy</span>
</button>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[16px] text-tertiary-container">verified</span>
<span>Loaded &amp; Verified</span>
</span>
</td>
<td className="py-3.5 px-4 text-right">
<a className="font-mono-data-md text-mono-data-md text-primary font-semibold hover:underline inline-flex items-center gap-0.5" href="#">
<span>AUROC 0.918</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  18 Oct 2024, 14:05 IST
                </td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="reverifyModel('Fracture-RegNet')" title="Re-verify Hash" type="button">
<span className="material-symbols-outlined text-[18px]">rule</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Model Diagnostics" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3.5 px-4">
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Spine-Alignment-v1.1</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Vertebral Landmark &amp; Cobb Angle Quantometry</span>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-medium">
                    Spine Lumbar
                  </span>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm font-medium">
                    v1.1-Staging (PyTorch Edge)
                  </span>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface">
<div className="flex items-center gap-1.5">
<span className="bg-surface-container px-2 py-0.5 rounded">sha256:0d91ca82...99ee</span>
<button className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="copyHash('sha256:0d91ca824419aa400199fba67198bba108422ca1108842199eef091a182904bc', this)" title="Copy SHA-256" type="button">
<span className="material-symbols-outlined text-[16px]">content_copy</span>
</button>
</div>
</td>
<td className="py-3.5 px-4">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[16px] text-secondary">info</span>
<span>Loaded (Staging)</span>
</span>
</td>
<td className="py-3.5 px-4 text-right">
<a className="font-mono-data-md text-mono-data-md text-primary font-semibold hover:underline inline-flex items-center gap-0.5" href="#">
<span>AUROC 0.892</span>
<span className="material-symbols-outlined text-[14px]">open_in_new</span>
</a>
</td>
<td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  21 Oct 2024, 09:12 IST
                </td>
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="reverifyModel('Spine-Alignment')" title="Promote to Production" type="button">
<span className="material-symbols-outlined text-[18px]">publish</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Model Diagnostics" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="hidden flex-col gap-space-sm" id="models-mobile-view">

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-xs">
<div className="flex items-start justify-between">
<div>
<span className="font-label-md text-label-md font-bold text-on-surface block">Chest-CAD-v4.2.1-RT</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Triage &amp; Multi-pathology</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">verified</span>
              Verified
            </span>
</div>
<div className="flex flex-wrap gap-1 mt-1">
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm">Chest PA/AP</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm">TensorRT FP16</span>
</div>
<div className="p-2 bg-surface-container-low rounded flex items-center justify-between text-mono-data-sm font-mono-data-sm mt-1">
<span className="text-on-surface-variant truncate">sha256:8f2a9c1b...3e80</span>
<button className="text-primary ml-2 flex items-center gap-0.5" onClick="copyHash('sha256:8f2a9c1b...3e80', this)" type="button">
<span className="material-symbols-outlined text-[14px]">content_copy</span>
<span>Copy</span>
</button>
</div>
<div className="flex items-center justify-between pt-1 font-body-sm text-body-sm">
<a className="text-primary font-mono-data-sm text-mono-data-sm font-semibold flex items-center gap-0.5" href="#">
              AUROC 0.942 [Report ↗]
            </a>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">24 Oct, 08:30</span>
</div>
</div>

<div className="p-space-md bg-error-container/20 rounded-xl shadow-sm flex flex-col gap-space-xs">
<div className="flex items-start justify-between">
<div>
<span className="font-label-md text-label-md font-bold text-error block">Knee-BoneCAD-v0.8.2-Alpha</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Trabecular Density &amp; Cortical</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[14px]">dangerous</span>
              Quarantined
            </span>
</div>
<div className="p-2 rounded bg-surface-container-lowest text-error font-body-sm text-body-sm">
            Local SHA-256 mismatch vs central registry. Quarantined.
          </div>
<div className="flex items-center justify-between pt-1">
<button className="w-full py-2 px-3 rounded-lg bg-error text-on-error font-label-md text-label-md font-semibold text-center" onClick="resolveMismatchModal()" type="button">
              Force Replace Binary
            </button>
</div>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-xs">
<div className="flex items-start justify-between">
<div>
<span className="font-label-md text-label-md font-bold text-on-surface block">Fracture-RegNet-v2.0</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Callus Density Alignment</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary-container font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">verified</span>
              Verified
            </span>
</div>
<div className="flex flex-wrap gap-1 mt-1">
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm">Tibia / Fibula</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm">TensorRT Prod</span>
</div>
<div className="flex items-center justify-between pt-1 font-body-sm text-body-sm">
<a className="text-primary font-mono-data-sm text-mono-data-sm font-semibold flex items-center gap-0.5" href="#">
              AUROC 0.918 [Report ↗]
            </a>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">18 Oct, 14:05</span>
</div>
</div>
</div>

<div className="hidden p-space-xl bg-surface-container-lowest rounded-xl shadow-sm flex-col items-center justify-center text-center gap-space-md" id="models-empty-state">
<div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[32px]">deployed_code</span>
</div>
<div className="max-w-md flex flex-col gap-1">
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Models Deployed on Edge Node</h3>
<p className="font-body-md text-body-md text-on-surface-variant">
            No AI models deployed on this edge node. Upload or sync models from Central Health Cloud registry to enable local CDSS inference.
          </p>
</div>
<button className="h-11 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all flex items-center gap-2" onClick="deployNewModel()" type="button">
<span className="material-symbols-outlined text-[18px]">add_box</span>
<span>+ Deploy model</span>
</button>
</div>

<div className="hidden bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-md flex-col gap-space-md animate-pulse" id="models-skeleton-state">
<div className="h-8 bg-surface-container-high rounded w-1/4"></div>
<div className="space-y-3">
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
</div>
</div>
</section>



<section className="flex flex-col gap-space-md" id="users-section">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-3">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Clinical Users &amp; Access Permissions</h2>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-mono-data-sm text-mono-data-sm font-semibold">
            8 Active Users • Kashti PHC &amp; Tele-Cluster
          </span>
</div>
<div className="flex items-center gap-2">
<div className="relative">
<input className="h-9 pl-8 pr-3 bg-surface-container-lowest rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant shadow-sm focus:outline-none focus:ring-1 focus:ring-primary w-64" placeholder="Search clinician name, NMC/State ID..." type="text"/>
<span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-on-surface-variant pointer-events-none">search</span>
</div>
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[16px]">filter_list</span>
<span>Filter</span>
</button>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden" id="users-table-view">
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<tr>
<th className="py-3 px-4">Clinical User &amp; Registration</th>
<th className="py-3 px-4">Role Tier</th>
<th className="py-3 px-4">Facility / Edge Node</th>
<th className="py-3 px-4">Last Activity</th>
<th className="py-3 px-4 text-center">Inference Access</th>
<th className="py-3 px-4 text-center">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container text-body-sm font-body-sm" id="users-table-body">

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3 px-4">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[13px] shrink-0">
                      AS
                    </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Dr. Arti Sharma</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">MO / Tele-radiologist • <span className="font-mono-data-sm text-mono-data-sm font-medium">#MH-MED-82194</span></span>
</div>
</div>
</td>
<td className="py-3 px-4">

<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">stethoscope</span>
<span>Doctor</span>
</span>
</td>
<td className="py-3 px-4">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Ahmadnagar Tele-Radiology Hub</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Cluster Tele-Node #01</span>
</div>
</td>
<td className="py-3 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
<span className="text-tertiary-container font-semibold">12m ago</span> • 24 Oct 14:18
                </td>
<td className="py-3 px-4 text-center">
<button aria-checked="true" className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-tertiary-container transition-colors duration-200 ease-in-out focus:outline-none" onClick="toggleUserAccess(this)" role="switch" type="button">
<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-tertiary shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"></span>
</button>
</td>
<td className="py-3 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="editUser('Dr. Arti Sharma')" title="Edit permissions" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3 px-4">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[13px] shrink-0">
                      LD
                    </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Sister Lakshmi Devi</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">ANM / Radiographer • <span className="font-mono-data-sm text-mono-data-sm font-medium">#MH-NUR-4012</span></span>
</div>
</div>
</td>
<td className="py-3 px-4">

<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">volunteer_activism</span>
<span>Health worker</span>
</span>
</td>
<td className="py-3 px-4">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Kashti Primary Health Centre</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Rural Health Cluster 2</span>
</div>
</td>
<td className="py-3 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  Today, 09:15 IST
                </td>
<td className="py-3 px-4 text-center">
<button aria-checked="true" className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-tertiary-container transition-colors duration-200 ease-in-out focus:outline-none" onClick="toggleUserAccess(this)" role="switch" type="button">
<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-tertiary shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"></span>
</button>
</td>
<td className="py-3 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="editUser('Sister Lakshmi Devi')" title="Edit permissions" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3 px-4">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[13px] shrink-0">
                      RK
                    </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Dr. Rajesh Kulkarni</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Lead Medical Officer / Admin • <span className="font-mono-data-sm text-mono-data-sm font-medium">#MH-MED-10928</span></span>
</div>
</div>
</td>
<td className="py-3 px-4">

<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
<span>Admin</span>
</span>
</td>
<td className="py-3 px-4">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Kashti PHC / District Cluster</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Edge Host Administrator</span>
</div>
</td>
<td className="py-3 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  Active Now • Session Active
                </td>
<td className="py-3 px-4 text-center">
<button aria-checked="true" className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed opacity-80 rounded-full bg-tertiary-container transition-colors" disabled role="switch" title="Admin lock" type="button">
<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-tertiary shadow mt-0.5 ml-0.5"></span>
</button>
</td>
<td className="py-3 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="editUser('Dr. Rajesh Kulkarni')" title="Edit permissions" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-3 px-4">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-[13px] shrink-0">
                      BR
                    </div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Babu Rao</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Edge IT / Cluster Technician • <span className="font-mono-data-sm text-mono-data-sm font-medium">#TECH-KASHTI-09</span></span>
</div>
</div>
</td>
<td className="py-3 px-4">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
<span className="material-symbols-outlined text-[14px]">terminal</span>
<span>Admin</span>
</span>
</td>
<td className="py-3 px-4">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Kashti Primary Health Centre</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Local Hardware Custodian</span>
</div>
</td>
<td className="py-3 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant whitespace-nowrap">
                  Yesterday, 17:40 IST
                </td>
<td className="py-3 px-4 text-center">
<button aria-checked="false" className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-surface-container-high transition-colors duration-200 ease-in-out focus:outline-none" onClick="toggleUserAccess(this)" role="switch" type="button">
<span className="translate-x-0.5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"></span>
</button>
</td>
<td className="py-3 px-4 text-center">
<div className="flex items-center justify-center gap-1">
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors" onClick="editUser('Babu Rao')" title="Edit permissions" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="hidden flex-col gap-space-sm" id="users-mobile-view">

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[12px]">
                AS
              </div>
<div>
<span className="font-label-md text-label-md font-bold text-on-surface block">Dr. Arti Sharma</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">#MH-MED-82194</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
              Doctor
            </span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Ahmadnagar Tele-Radiology Hub</span>
<div className="flex items-center justify-between pt-2">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Active: 12m ago</span>
<div className="flex items-center gap-3">
<button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-tertiary-container" onClick="toggleUserAccess(this)" role="switch" type="button">
<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-tertiary mt-0.5 ml-0.5"></span>
</button>
<button className="p-1 text-primary" onClick="editUser('Dr. Arti Sharma')" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
</div>
</div>

<div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[12px]">
                LD
              </div>
<div>
<span className="font-label-md text-label-md font-bold text-on-surface block">Sister Lakshmi Devi</span>
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">#MH-NUR-4012</span>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
              Health worker
            </span>
</div>
<span className="font-body-sm text-body-sm text-on-surface-variant">Kashti Primary Health Centre</span>
<div className="flex items-center justify-between pt-2">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Active: Today, 09:15</span>
<div className="flex items-center gap-3">
<button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-tertiary-container" onClick="toggleUserAccess(this)" role="switch" type="button">
<span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-tertiary mt-0.5 ml-0.5"></span>
</button>
<button className="p-1 text-primary" onClick="editUser('Sister Lakshmi Devi')" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
</div>
</div>
</div>

<div className="hidden p-space-xl bg-surface-container-lowest rounded-xl shadow-sm flex-col items-center justify-center text-center gap-space-md" id="users-empty-state">
<div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[32px]">person_off</span>
</div>
<div className="max-w-md flex flex-col gap-1">
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Clinical Users Found</h3>
<p className="font-body-md text-body-md text-on-surface-variant">
            No users found matching current filters or facility node permissions. Create new clinical operator accounts to grant access.
          </p>
</div>
<button className="h-11 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all flex items-center gap-2" onClick="openCreateUserModal()" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span>+ Invite user</span>
</button>
</div>

<div className="hidden bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-md flex-col gap-space-md animate-pulse" id="users-skeleton-state">
<div className="h-8 bg-surface-container-high rounded w-1/3"></div>
<div className="space-y-3">
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
<div className="h-12 bg-surface-container rounded-lg"></div>
</div>
</div>
</section>

<div className="p-space-md bg-surface-container-low rounded-xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-[20px]">encrypted</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-semibold text-on-surface">Automated Binary Signature Attestation</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">
            TPM 2.0 Hardware root of trust enabled. Model execution rejected if hash mismatches certified manifests.
          </span>
</div>
</div>
<div className="flex items-center gap-3">
<span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Attestation Log ID: #ATT-2024-9981</span>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold shadow-sm transition-colors flex items-center gap-1" onClick="exportAuditManifest()" type="button">
<span className="material-symbols-outlined text-[16px]">download</span>
<span>Export Manifest</span>
</button>
</div>
</div>

<div className="pt-space-md flex flex-col items-center justify-center text-center gap-1">
<div className="flex flex-wrap items-center justify-center gap-2 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
<span>Clinical Decision Support System (CDSS) Administration</span>
<span>•</span>
<span>Edge Node ID: <strong className="text-on-surface">KASHTI-PHC-04</strong></span>
<span>•</span>
<span>Compliant with ISO 13485:2016, ABDM M2/M3 &amp; CDSCO Digital Health Governance Guidelines</span>
</div>
<div className="font-label-sm text-label-sm text-secondary font-medium mt-0.5">
        Permanent Regulatory Notice: Decision support only. Not a diagnosis. Requires clinician review.
      </div>
</div>
</div>

<div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm hidden items-center justify-center p-4" id="modal-create-user">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-lg w-full p-space-lg flex flex-col gap-space-md animate-in fade-in zoom-in-95">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">person_add</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Create Clinical Operator</h3>
</div>
<button className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container" onClick="closeCreateUserModal()" type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<form className="flex flex-col gap-space-sm" onSubmit="handleUserSubmit(event)">
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Full Legal Name</label>
<input className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Dr. / Sister / Shri..." required="" type="text"/>
</div>
<div className="grid grid-cols-2 gap-2">
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Role Classification</label>
<select className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
<option value="doctor">Doctor (Medical Officer)</option>
<option value="worker">Health Worker (ANM/Tech)</option>
<option value="admin">Admin / System Lead</option>
</select>
</div>
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Council Registration #</label>
<input className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" placeholder="MH-MED-XXXX" required="" type="text"/>
</div>
</div>
<div>
<label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Assigned Facility Node</label>
<input className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" type="text" value="Kashti Primary Health Centre (Cluster #04)"/>
</div>
<div className="p-3 bg-surface-container rounded-lg flex items-center justify-between mt-1">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-semibold text-on-surface">Grant Inference Execution</span>
<span className="font-body-sm text-body-sm text-on-surface-variant">Allows triggering AI pipelines on radiographs</span>
</div>
<input checked className="w-4 h-4 accent-primary rounded" type="checkbox"/>
</div>
<div className="flex items-center justify-end gap-2 pt-space-xs mt-2">
<button className="h-10 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium" onClick="closeCreateUserModal()" type="button">
            Cancel
          </button>
<button className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm" type="submit">
            Save &amp; Issue Credentials
          </button>
</div>
</form>
</div>
</div>

<div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm hidden items-center justify-center p-4" id="modal-replace-binary">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-lg w-full p-space-lg flex flex-col gap-space-md animate-in fade-in zoom-in-95">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">system_update_alt</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Resolve Mismatch: Knee-BoneCAD</h3>
</div>
<button className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container" onClick="closeReplaceModal()" type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<div className="flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant">
<p>The local weight tensor failed CDSCO certification check. Selecting pull will overwrite the corrupted edge artifact with the authenticated package from the Ahmadnagar central server.</p>
<div className="p-3 bg-surface-container-low rounded-lg font-mono-data-sm text-mono-data-sm flex flex-col gap-1">
<div className="flex justify-between">
<span className="text-error font-semibold">Active Local:</span>
<span className="text-on-surface line-through">sha256:4d12c0aa...</span>
</div>
<div className="flex justify-between">
<span className="text-tertiary-container font-semibold">Certified Target:</span>
<span className="text-on-surface font-bold">sha256:7c9e0a81...</span>
</div>
</div>
<div className="hidden flex-col gap-1.5 pt-2" id="download-progress-bar">
<div className="flex justify-between font-mono-data-sm text-mono-data-sm text-on-surface">
<span>Pulling from Central Cloud...</span>
<span id="download-pct">42%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary transition-all duration-300" id="download-fill" style={{width: '42%'}}></div>
</div>
</div>
</div>
<div className="flex items-center justify-end gap-2 pt-space-xs mt-2" id="replace-actions">
<button className="h-10 px-4 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium" onClick="closeReplaceModal()" type="button">
          Cancel
        </button>
<button className="h-10 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm flex items-center gap-1.5" onClick="startBinaryDownload()" type="button">
<span className="material-symbols-outlined text-[18px]">cloud_download</span>
<span>Download &amp; Hot-Reload</span>
</button>
</div>
</div>
</div>

<div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 opacity-0 pointer-events-none translate-y-2" id="toast">
<span className="material-symbols-outlined text-[20px] text-tertiary-fixed" id="toast-icon">check_circle</span>
<span className="font-body-sm text-body-sm" id="toast-text">Action completed successfully</span>
</div>
</div>

</>