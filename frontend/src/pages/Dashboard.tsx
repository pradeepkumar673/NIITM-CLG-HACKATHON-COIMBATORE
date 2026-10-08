import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudyCountsDashboardStudiesCountsGet, getQueueSizeDashboardStudiesQueueGet, getLatencyStatsDashboardStudiesLatencyGet } from '../client';
import { AppShell } from '../components/AppShell';
import { getAuthUser } from '../utils/auth';
import { DoctorReviewQueueContent } from './DoctorReviewQueue';
import { AdminDashboardContent } from './AdminDashboard';

export function Dashboard() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: countsData, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['studyCounts'],
    queryFn: () => getStudyCountsDashboardStudiesCountsGet()
  });

  const { data: queueData, isLoading: isLoadingQueue } = useQuery({
    queryKey: ['queueSize'],
    queryFn: () => getQueueSizeDashboardStudiesQueueGet()
  });

  const { data: latencyData, isLoading: isLoadingLatency } = useQuery({
    queryKey: ['latencyStats'],
    queryFn: () => getLatencyStatsDashboardStudiesLatencyGet()
  });

  const isLoading = isLoadingCounts || isLoadingQueue || isLoadingLatency;

  const totalToday = countsData?.data?.today ?? 0;
  const needsReview = countsData?.data?.by_status.processing ?? 0; // mapping processing as needs human review
  const doneToday = countsData?.data?.by_status.done ?? 0;
  const uploaded = countsData?.data?.by_status.uploaded ?? 0;
  
  const awaitingDoctor = queueData?.data?.awaiting_sign_off ?? 0;
  const avgResponseTime = latencyData?.data?.average_ms ? Math.round(latencyData.data.average_ms / 60000) : 0; // Convert ms to mins

  const dailyCounts = countsData?.data?.daily || [];
  const maxCount = Math.max(1, ...dailyCounts.map(d => d.count));
  const points = dailyCounts.map((d, i) => {
    const x = (i / Math.max(1, dailyCounts.length - 1)) * 240;
    const y = 28 - (d.count / maxCount) * 24;
    return `${x},${y}`;
  });
  const pathD = points.length > 0 ? `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(' ') : 'M0,28 L240,28';
  const lastY = points.length > 0 ? 28 - (dailyCounts[dailyCounts.length - 1].count / maxCount) * 24 : 28;

  return (
    <AppShell userRole={authUser?.role} userName={authUser?.name} clinicName={authUser?.clinicName}>
      <div className="flex flex-col w-full">
        {/* Unified Dashboard Navigation Tabs */}
        <div className="flex items-center gap-space-sm mb-space-lg border-b border-outline-variant pb-2">
          <button 
            className={`px-4 py-2 font-label-md text-label-md font-semibold transition-colors rounded-t-lg ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 font-label-md text-label-md font-semibold transition-colors rounded-t-lg ${activeTab === 'queue' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('queue')}
          >
            Review Queue
          </button>
          <button 
            className={`px-4 py-2 font-label-md text-label-md font-semibold transition-colors rounded-t-lg ${activeTab === 'admin' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
        </div>

        {activeTab === 'queue' && <DoctorReviewQueueContent />}
        {activeTab === 'admin' && <AdminDashboardContent />}
        
        {activeTab === 'overview' && (
          <>
            <section className="flex flex-col gap-space-md mb-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  EDGE-NODE v2.4-RT
                </span>
                <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Live</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Triage & Studies Overview</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Rural Edge Tele-radiology Decision Support • Automated pre-screen for district tele-consult</p>
            </div>
          </div>
        </section>

        {isLoading ? (
          /* ================= STATE CONTAINER 3: LOADING / SKELETON STATE ================= */
          <div className="flex flex-col gap-space-lg" id="state-loading-container">
            <div className="rounded-xl p-space-md bg-surface-container flex flex-col gap-space-xs shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Inferring DICOM study on local TensorRT...</span>
                </div>
                <span className="font-mono-data-sm text-mono-data-sm text-primary font-semibold">Loading...</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-1">
                <div className="bg-primary h-2 rounded-full transition-all duration-500 animate-pulse w-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col justify-between h-40">
                <div className="h-4 w-28 bg-surface-container-high rounded"></div>
                <div className="h-10 w-20 bg-surface-container-high rounded mt-4"></div>
                <div className="h-4 w-40 bg-surface-container-high rounded"></div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col justify-between h-40">
                <div className="h-4 w-32 bg-surface-container-high rounded"></div>
                <div className="h-10 w-16 bg-surface-container-high rounded mt-4"></div>
                <div className="h-4 w-36 bg-surface-container-high rounded"></div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm animate-pulse flex flex-col justify-between h-40">
                <div className="h-4 w-36 bg-surface-container-high rounded"></div>
                <div className="h-10 w-20 bg-surface-container-high rounded mt-4"></div>
                <div className="h-4 w-28 bg-surface-container-high rounded"></div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm animate-pulse flex flex-col lg:flex-row justify-between items-center gap-space-md h-36">
              <div className="w-full max-w-md flex flex-col gap-2">
                <div className="h-6 w-48 bg-surface-container-high rounded"></div>
                <div className="h-4 w-full bg-surface-container-high rounded"></div>
                <div className="h-3 w-3/4 bg-surface-container-high rounded"></div>
              </div>
              <div className="h-12 w-44 bg-surface-container-high rounded-lg shrink-0"></div>
            </div>
          </div>
        ) : (
          /* ================= STATE CONTAINER 1: ACTIVE WORKLIST ================= */
          <div className="flex flex-col gap-space-lg" id="state-active-container">
            {/* Clinical Warning Banner */}
            <div className="rounded-xl p-space-md bg-secondary-container flex items-start gap-space-md shadow-sm opacity-90">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">medical_services</span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Triage Protocol v1.4 Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface text-primary font-mono-data-sm text-mono-data-sm font-medium">95% CI Calibrated</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Local inference enabled on Edge Node edge server. Studies flagged "High" will trigger an automated SMS notification to {authUser?.name || 'Doctor'} (District Hospital Tele-radiology Unit).
                </p>
              </div>
            </div>
            {/* 3 Summary Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {/* Card 1: Studies today */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Studies today</span>
                  <span className="material-symbols-outlined text-primary text-[22px]">radiology</span>
                </div>
                <div className="flex items-baseline justify-between mt-space-md">
                  <span className="font-mono-data-lg text-[2.5rem] leading-none text-on-surface font-bold">{totalToday < 10 ? `0${totalToday}` : totalToday}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono-data-sm text-mono-data-sm text-tertiary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+{uploaded} upload queue
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{doneToday} sync finalized</span>
                  </div>
                </div>
                {/* Micro sparkline chart */}
                <div className="mt-space-md pt-space-xs">
                  <div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-[10px] mb-1">
                    <span>7d ago</span><span>3d ago</span><span>Today</span>
                  </div>
                  <svg className="w-full h-8 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 240 32">
                    <path className="text-primary-container" d={pathD} stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                    <circle className="text-primary" cx="240" cy={lastY} fill="currentColor" r="3"></circle>
                  </svg>
                </div>
              </div>
              {/* Card 2: Needs human review */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-error font-semibold uppercase tracking-wider">Needs human review</span>
                  <span className="material-symbols-outlined text-error text-[22px]">warning</span>
                </div>
                <div className="flex items-baseline justify-between mt-space-md">
                  <span className="font-mono-data-lg text-[2.5rem] leading-none text-error font-bold">{needsReview < 10 ? `0${needsReview}` : needsReview}</span>
                  <div className="flex flex-col items-end text-right">
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-semibold">Priority Action</span>
                    <span className="font-body-sm text-body-sm text-error mt-0.5">Equivocal or artifact</span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>Processing & Review required</span>
                    <span className="font-mono-data-sm text-mono-data-sm font-semibold text-on-surface">{needsReview} studies</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-1.5">
                    <div className="bg-error h-1.5 rounded-full" style={{ width: totalToday > 0 ? `${(needsReview/totalToday)*100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
              {/* Card 3: Awaiting doctor review */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Awaiting doctor review</span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">assignment_turned_in</span>
                </div>
                <div className="flex items-baseline justify-between mt-space-md">
                  <span className="font-mono-data-lg text-[2.5rem] leading-none text-on-surface font-bold">{awaitingDoctor < 10 ? `0${awaitingDoctor}` : awaitingDoctor}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-label-sm text-label-sm text-primary font-semibold">{authUser?.name || 'Doctor'}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Tele-radiology cluster</span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant">
                  <span className="font-body-sm text-body-sm">Avg response time:</span>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-semibold">{avgResponseTime} mins</span>
                </div>
              </div>
            </div>
            {/* Primary CTA: Analyse a new X-ray */}
            <div 
              onClick={() => navigate('/studies/new')}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col lg:flex-row items-center justify-between gap-space-lg cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <div className="flex items-start gap-space-md max-w-2xl">
                <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Analyse a new X-ray</h2>
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm">Offline Edge Ready</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Fast DICOM (.dcm), CR scan, or high-density JPEG/PNG ingest. Instant inference on local TensorRT for Chest AP/PA (pneumothorax, effusion, consolidation), Knee Bilateral, and Bone Trauma.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md mt-space-sm text-on-surface-variant font-body-sm text-body-sm">
                    <span className="flex items-center gap-1 font-mono-data-sm text-mono-data-sm">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>16-bit Windowing
                    </span>
                    <span className="flex items-center gap-1 font-mono-data-sm text-mono-data-sm">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>Anonymized ABHA
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full lg:w-auto">
                <div className="p-space-sm rounded-lg bg-surface-container-low text-center w-full lg:w-48 shadow-sm group-hover:bg-surface-container transition-colors">
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant block">Drag & Drop DICOM</span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Up to 120 MB</span>
                </div>
                <button 
                  className="w-full sm:w-auto h-12 min-h-[48px] px-space-lg rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 group-hover:scale-105" type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>New study</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
            {/* NO RECENT STUDIES ENDPOINT - REMOVED PER R1 */}
          </div>
        )}
        </>
        )}
      </div>
    </AppShell>
  );
}
