import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueueSizeDashboardStudiesQueueGet, listStudiesStudiesGet, getTriageDistributionDashboardStudiesTriageGet } from '../client';
import { AppShell } from '../components/AppShell';
import { Link } from 'react-router-dom';

export function DoctorReviewQueue() {
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [status, setStatus] = useState('all'); 
  const [bodyPart, setBodyPart] = useState('all');
  const [tier, setTier] = useState('all');
  const [search, setSearch] = useState('');

  const { data: queueData } = useQuery({
    queryKey: ['queueSize'],
    queryFn: () => getQueueSizeDashboardStudiesQueueGet()
  });
  
  const { data: triageData } = useQuery({
    queryKey: ['triageDistribution'],
    queryFn: () => getTriageDistributionDashboardStudiesTriageGet()
  });

  const { data: studiesData, isLoading } = useQuery({
    queryKey: ['studiesList', page, size, status, bodyPart, tier, search],
    queryFn: () => listStudiesStudiesGet({ 
      query: { 
        page, 
        size, 
        status: status !== 'all' ? status : undefined, 
        body_part: bodyPart !== 'all' ? bodyPart : undefined, 
        tier: tier !== 'all' ? tier : undefined, 
        search: search || undefined 
      } 
    })
  });

  const awaitingDoctor = queueData?.data?.awaiting_sign_off ?? 0;
  const studies = studiesData?.data?.items ?? [];
  const total = studiesData?.data?.total ?? 0;
  const totalPages = Math.ceil(total / size);

  // Helper for formatting tier
  const getTierInfo = (study: any) => {
    let tierVal = 3;
    if (study.findings) {
      if (Object.values(study.findings).some((v: any) => v.tier === 'high')) tierVal = 1;
      else if (Object.values(study.findings).some((v: any) => v.tier === 'medium')) tierVal = 2;
    }
    if (tierVal === 1) return { label: 'Tier 1 High', color: 'error' };
    if (tierVal === 2) return { label: 'Tier 2 Med', color: 'secondary' };
    return { label: 'Tier 3 Low', color: 'tertiary' };
  };

  // Helper to get top finding
  const getTopFinding = (study: any) => {
    if (!study.findings) return { name: 'No Acute Findings', p: 0, ci: [0,0] };
    let max = -1;
    let name = 'No Acute Findings';
    let ci = [0,0];
    for (const [k, v] of Object.entries(study.findings) as any) {
      if (v.probability > max) {
        max = v.probability;
        name = k;
        ci = v.ci_95 || [0,0];
      }
    }
    return { name, p: max, ci };
  };

  return (
    <AppShell userRole="doctor" userName={localStorage.getItem('userName') || 'Doctor'}>
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-high/60 backdrop-blur-md px-space-lg py-2.5 rounded-xl shadow-sm mb-space-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary font-mono-data-sm text-mono-data-sm font-semibold">α</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Prototype View State:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button className="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center gap-1.5" type="button">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>1. Prioritized Queue
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
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>Cluster Sync Live
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Review queue</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-md text-mono-data-md font-bold">{awaitingDoctor} awaiting sign-off</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
              Prioritized tele-consultation and radiograph sign-off worklist.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button className="h-11 px-4 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-surface-container-low transition-all duration-150 flex items-center gap-2" type="button">
              <span className="material-symbols-outlined text-[18px]">rule_folder</span>
              <span>Batch Sign-off Eligible</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-error">Urgent Triage</span>
                </div>
                <span className="font-mono-data-lg text-mono-data-lg font-bold text-error px-2 py-0.5 rounded-full bg-error-container">{triageData?.data?.high ?? 0}</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">flag</span>
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Needs Human Review</span>
                </div>
                <span className="font-mono-data-lg text-mono-data-lg font-bold text-on-secondary-fixed-variant px-2 py-0.5 rounded-full bg-secondary-container">{triageData?.data?.needs_review ?? 0}</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Awaiting Sign-off</span>
                </div>
                <span className="font-mono-data-lg text-mono-data-lg font-bold text-primary px-2 py-0.5 rounded-full bg-surface-container">{awaitingDoctor}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
            <div className="relative flex-1 min-w-[280px]">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-on-surface-variant pointer-events-none">search</span>
              <input 
                className="w-full h-11 pl-10 pr-9 bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none" 
                placeholder="Search Study ID or Patient..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <select className="h-11 px-3 bg-surface-container-low rounded-lg text-on-surface font-body-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="all">All Statuses</option>
                <option value="uploaded">Uploaded</option>
                <option value="done">Done</option>
              </select>
              <select className="h-11 px-3 bg-surface-container-low rounded-lg text-on-surface font-body-sm" value={bodyPart} onChange={e => { setBodyPart(e.target.value); setPage(1); }}>
                <option value="all">All Modalities</option>
                <option value="chest">Chest</option>
                <option value="knee">Knee</option>
                <option value="bone">Bone</option>
              </select>
              <select className="h-11 px-3 bg-surface-container-low rounded-lg text-on-surface font-body-sm" value={tier} onChange={e => { setTier(e.target.value); setPage(1); }}>
                <option value="all">All Tiers</option>
                <option value="tier1">Tier 1 High</option>
                <option value="tier2">Tier 2 Med</option>
                <option value="tier3">Tier 3 Low</option>
              </select>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1080px]">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm uppercase tracking-wider sticky top-0 z-20">
                    <th className="py-3.5 px-4">Triage Tier</th>
                    <th className="py-3.5 px-3">Study ID</th>
                    <th className="py-3.5 px-3">Patient</th>
                    <th className="py-3.5 px-3">Body Part</th>
                    <th className="py-3.5 px-4 min-w-[240px]">Top Finding</th>
                    <th className="py-3.5 px-3 min-w-[200px]">Review Flag</th>
                    <th className="py-3.5 px-3">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-body-sm text-on-surface">
                  {isLoading ? (
                    <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
                  ) : studies.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8">No studies found.</td></tr>
                  ) : (
                    studies.map(study => {
                      const tierInfo = getTierInfo(study);
                      const topFind = getTopFinding(study);
                      return (
                        <tr key={study.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-${tierInfo.color}-container text-${tierInfo.color} font-mono-data-sm font-bold`}>
                              {tierInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono-data-sm font-semibold text-primary">
                            STU-{study.id}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className="font-mono-data-sm font-bold">{study.patient_ext_ref || 'Unknown'}</span>
                              <span className="text-on-surface-variant font-label-sm">{study.patient_sex}, {study.patient_age}y</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 capitalize">
                            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium">{study.body_part}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span className={`font-label-md font-semibold text-${tierInfo.color}`}>{topFind.name}</span>
                              {topFind.p > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono-data-sm font-bold text-${tierInfo.color}`}>p = {topFind.p.toFixed(2)}</span>
                                  <div className="w-24 bg-surface-container h-1.5 rounded-full overflow-hidden">
                                    <div className={`bg-${tierInfo.color} h-full`} style={{width: `${topFind.p*100}%`}}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {study.needs_human_review ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed-variant font-mono-data-sm font-semibold">
                                <span className="material-symbols-outlined text-[14px]">warning</span>Flagged
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-on-surface-variant">
                                <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>Clean
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-mono-data-sm">{new Date(study.created_at).toLocaleTimeString()}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link to={`/review/${study.id}`} className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-sm font-semibold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-1">
                              Open <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {!isLoading && total > 0 && (
              <div className="px-space-md py-3.5 bg-surface-container-high/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-mono-data-sm">
                <span>Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</span>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="px-2">{page} / {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
