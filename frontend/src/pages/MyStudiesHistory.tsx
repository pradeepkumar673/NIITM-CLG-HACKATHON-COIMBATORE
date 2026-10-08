import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';

interface StudyItem {
  id: number;
  patient_ext_ref?: string;
  patient_age?: number;
  patient_sex?: string;
  body_part: string;
  modality_hint?: string;
  status: string;
  created_at: string;
  needs_human_review: boolean;
  findings?: Record<string, unknown>;
  review_reasons?: Record<string, unknown>;
}

interface StudyListResponse {
  items: StudyItem[];
  total: number;
  page: number;
  size: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    done:       { bg: 'bg-[#ECFDF3]', text: 'text-[#067647]', dot: 'bg-[#067647]', label: 'Done' },
    processing: { bg: 'bg-secondary-container', text: 'text-primary', dot: 'bg-primary animate-ping', label: 'Processing' },
    uploaded:   { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Uploaded' },
    rejected:   { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', label: 'Rejected' },
    failed:     { bg: 'bg-error-container', text: 'text-error', dot: 'bg-error', label: 'Failed' },
  };
  const s = map[status] ?? { bg: 'bg-surface-container', text: 'text-on-surface-variant', dot: 'bg-outline', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} ${s.text} font-label-sm text-label-sm font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function TiageBadge({ findings }: { findings?: Record<string, unknown> }) {
  if (!findings) return <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">—</span>;
  const probs = Object.values(findings)
    .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null && 'probability' in v)
    .map(v => Number(v.probability));
  if (probs.length === 0) return <span className="text-on-surface-variant font-mono-data-sm text-mono-data-sm">—</span>;
  const top = Math.max(...probs);
  if (top >= 0.7) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono-data-sm text-mono-data-sm font-bold">
      <span className="material-symbols-outlined text-[13px]">crisis_alert</span>
      Tier 1 HIGH ({(top * 100).toFixed(0)}%)
    </span>
  );
  if (top >= 0.4) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] font-mono-data-sm text-mono-data-sm font-bold">
      Tier 2 MED ({(top * 100).toFixed(0)}%)
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono-data-sm text-mono-data-sm font-bold">
      Tier 3 LOW ({(top * 100).toFixed(0)}%)
    </span>
  );
}

export function MyStudiesHistory() {
  const token = localStorage.getItem('token') ?? '';
  // Decode JWT to get user info
  let userRole = 'health_worker';
  let userName = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userRole = payload.role ?? 'health_worker';
  } catch { /* ignore */ }
  const navigate = useNavigate();

  const [studies, setStudies] = useState<StudyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bodyPartFilter, setBodyPartFilter] = useState('all');

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (bodyPartFilter !== 'all') params.set('body_part', bodyPartFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`http://localhost:8000/studies?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: StudyListResponse = await res.json();
      setStudies(data.items);
      setTotal(data.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load studies');
    } finally {
      setLoading(false);
    }
  }, [token, page, size, statusFilter, bodyPartFilter, search]);

  useEffect(() => { fetchStudies(); }, [fetchStudies]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchStudies(); }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppShell userRole={userRole} userName={userName}>
      <div className="flex flex-col w-full gap-4 pb-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm mb-1">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-semibold">My Studies</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">My Studies</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              {total} {total === 1 ? 'study' : 'studies'} total
            </p>
          </div>
          <button
            onClick={() => navigate('/new-study')}
            className="self-start sm:self-auto h-11 px-5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Study
          </button>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-1">
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]">search</span>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                placeholder="Search by patient ID, ABHA…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Status */}
            <div className="relative">
              <select
                className="w-full h-11 appearance-none px-3 pr-8 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All Statuses</option>
                <option value="uploaded">Uploaded</option>
                <option value="processing">Processing</option>
                <option value="done">Done</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-3 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
            </div>
            {/* Body part */}
            <div className="relative">
              <select
                className="w-full h-11 appearance-none px-3 pr-8 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                value={bodyPartFilter}
                onChange={e => { setBodyPartFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All Body Parts</option>
                <option value="chest">Chest</option>
                <option value="bone">Bone</option>
                <option value="knee">Knee</option>
                <option value="unknown">Unknown</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-3 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>
          {/* Quick filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Quick:</span>
            {['done', 'processing', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(statusFilter === s ? 'all' : s); setPage(1); }}
                className={`h-7 px-3 rounded-full font-label-sm text-label-sm font-semibold transition-colors capitalize ${statusFilter === s ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}
              >
                {s}
              </button>
            ))}
            {(statusFilter !== 'all' || bodyPartFilter !== 'all' || search) && (
              <button
                onClick={() => { setStatusFilter('all'); setBodyPartFilter('all'); setSearch(''); setPage(1); }}
                className="h-7 px-2.5 rounded-full text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="font-body-sm text-body-sm">{error}</span>
            <button onClick={fetchStudies} className="ml-auto font-label-sm text-label-sm underline">Retry</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 animate-pulse border-b border-outline-variant/30 ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-bright'}`}>
                <div className="h-4 w-24 bg-surface-container-highest rounded" />
                <div className="h-4 w-32 bg-surface-container-highest rounded flex-1" />
                <div className="h-6 w-20 bg-surface-container-highest rounded-full" />
                <div className="h-6 w-24 bg-surface-container-highest rounded-full" />
                <div className="h-8 w-16 bg-surface-container-highest rounded-lg ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && studies.length === 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[36px]">folder_open</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">No studies yet</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
              {(statusFilter !== 'all' || bodyPartFilter !== 'all' || search)
                ? 'No studies match these filters. Try adjusting or resetting them.'
                : 'Upload your first X-ray to get started.'}
            </p>
            <button
              onClick={() => navigate('/new-study')}
              className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Study
            </button>
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && studies.length > 0 && (
          <>
            {/* Table — hidden on mobile, shown md+ */}
            <div className="hidden md:block bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
                      <th className="py-3.5 px-4 font-semibold" scope="col">Study ID</th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">Patient Ref</th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">Body Part</th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">Uploaded</th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">Status</th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">Top Finding</th>
                      <th className="py-3.5 px-4 font-semibold text-center" scope="col">Review</th>
                      <th className="py-3.5 px-4 font-semibold text-right" scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface font-body-sm text-body-sm">
                    {studies.map((s, i) => (
                      <tr
                        key={s.id}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-bright'}`}
                        onClick={() => navigate(`/studies/${s.id}/result`)}
                      >
                        <td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm font-semibold text-primary">
                          #{s.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono-data-sm text-mono-data-sm text-on-surface">
                            {s.patient_ext_ref ?? <span className="text-on-surface-variant italic">—</span>}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface font-medium capitalize">
                            {s.body_part}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                          {formatDate(s.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          <TiageBadge findings={s.findings} />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {s.needs_human_review ? (
                            <span className="material-symbols-outlined text-[#B54708] text-[20px]" title="Needs human review">notification_important</span>
                          ) : (
                            <span className="material-symbols-outlined text-[#067647] text-[20px]" title="No review needed">check_circle</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold group-hover:bg-primary group-hover:text-on-primary transition-all"
                            onClick={e => { e.stopPropagation(); navigate(`/studies/${s.id}/result`); }}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card list — shown below md */}
            <div className="md:hidden flex flex-col gap-3">
              {studies.map(s => (
                <div
                  key={s.id}
                  className="bg-surface-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-2.5 hover:bg-surface-container-low transition-colors cursor-pointer active:scale-[0.99]"
                  onClick={() => navigate(`/studies/${s.id}/result`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono-data-sm text-mono-data-sm font-bold text-primary">Study #{s.id}</span>
                      {s.patient_ext_ref && (
                        <p className="font-mono-data-sm text-mono-data-sm text-on-surface-variant mt-0.5">{s.patient_ext_ref}</p>
                      )}
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface capitalize">
                      {s.body_part}
                    </span>
                    <TiageBadge findings={s.findings} />
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
                    <span>{formatDate(s.created_at)}</span>
                    <div className="flex items-center gap-1.5">
                      {s.needs_human_review && (
                        <span className="material-symbols-outlined text-[#B54708] text-[18px]">notification_important</span>
                      )}
                      <span className="material-symbols-outlined text-secondary text-[20px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest rounded-xl shadow-sm px-4 py-3">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing <span className="font-semibold text-on-surface">{(page - 1) * size + 1}–{Math.min(page * size, total)}</span> of <span className="font-semibold text-on-surface">{total}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-9 px-3 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  <span className="hidden sm:inline">Prev</span>
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg font-mono-data-sm text-mono-data-sm font-medium transition-colors ${page === p ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="w-8 text-center text-on-surface-variant">…</span>}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-9 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
