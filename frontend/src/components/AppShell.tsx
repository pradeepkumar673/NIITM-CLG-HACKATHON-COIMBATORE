import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getStudyResultStudiesIdResultGet } from '../client/sdk.gen';
import AnatomyHighlight from './AnatomyHighlight';

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  clinicName?: string;
}

export function AppShell({ children, userRole, userName, clinicName }: AppShellProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { t, i18n } = useTranslation();

  const studyMatch = matchPath('/studies/:id', location.pathname);
  const studyId = (studyMatch && studyMatch.params.id !== 'new') ? studyMatch.params.id : undefined;

  const { data: studyResult } = useQuery({
    queryKey: ['studyResult', studyId],
    queryFn: () => getStudyResultStudiesIdResultGet({ path: { id: parseInt(studyId!) } }),
    enabled: !!studyId
  });

  const studyData = studyResult?.data as any;
  const activeMuscles = studyData?.result?.anatomy?.muscle_group 
    ? [studyData.result.anatomy.muscle_group] 
    : [];

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  useEffect(() => {
    if (i18n.language === 'ta') {
      document.body.style.fontFamily = "'Noto Sans Tamil', 'Inter', sans-serif";
    } else if (i18n.language === 'hi') {
      document.body.style.fontFamily = "'Noto Sans Devanagari', 'Inter', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }
  }, [i18n.language]);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased">
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface-container-low z-50 flex flex-col justify-between py-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-space-md">
          <div className="px-space-md flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">{t('app.title', 'XRAY-ASSISTANT')}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-mono-data-sm text-mono-data-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-mono-data-sm text-mono-data-sm">
              <span className="material-symbols-outlined text-[14px]">wifi</span>
              <span>Sync: Local Edge</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-1 px-space-sm">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              Dashboard
            </Link>
                <Link 
                  to="/studies/new" 
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
                    isActive('/studies/new')
                      ? 'bg-primary text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]' 
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  New study
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
                    isActive('/history')
                      ? 'bg-primary text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]' 
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">folder_shared</span>
                  My studies
                </Link>
                <Link 
                  to="/compare" 
                  className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors ${
                    isActive('/compare')
                      ? 'bg-primary text-on-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]' 
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">compare</span>
                  Compare
                </Link>
          </nav>
          
          {studyId && (
            <div className="px-space-md py-4 mt-2 mb-2 border-t border-b border-outline-variant">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Region Highlight</span>
              <AnatomyHighlight selectedMuscles={activeMuscles} />
            </div>
          )}
          
          <div className="px-space-md pt-space-xs">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Language</label>
            <div className="relative">
              <select value={i18n.language} onChange={handleLangChange} className="w-full appearance-none bg-surface-container-lowest text-on-surface font-body-sm text-body-sm py-2 pl-3 pr-8 rounded-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="en">English</option>
                <option value="ta">Tamil [machine-drafted]</option>
                <option value="hi">Hindi [machine-drafted]</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>
        </div>
        
        <div className="px-space-md flex flex-col gap-space-sm">
          <div className="bg-surface-container-high p-space-sm rounded-lg flex flex-col gap-1">
            <div className="flex items-center justify-between text-on-surface-variant font-mono-data-sm text-mono-data-sm">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">dns</span>Edge Node</span>
              <span className="font-medium text-on-surface">Active</span>
            </div>
            <div className="font-mono-data-sm text-mono-data-sm text-primary font-semibold">KASHTI-PHC-04</div>
          </div>
          <button className="w-full flex items-center justify-center gap-space-sm py-2 px-space-md rounded-lg text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md transition-colors" type="button" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </aside>
      
      <div className="pl-60 min-h-screen flex flex-col justify-between">
        <div className="w-full">
          <header className="fixed top-0 left-60 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg">
            <div className="flex items-center gap-space-lg">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">{clinicName || 'Kashti Primary Health Centre, MH'}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">District Ahmadnagar • Rural Health Cluster 2</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                <span className="font-mono-data-sm text-mono-data-sm">ABHA Network Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-space-md relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-space-sm hover:bg-surface-container p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-outline-variant"
              >
                <div className="text-right hidden sm:flex flex-col px-2">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">{userName || 'Demo User'}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{userRole === 'doctor' ? 'Medical Officer' : (userRole === 'admin' ? 'System Admin' : 'Radiographer')}</span>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#063b46] flex items-center justify-center shadow-sm border-2 border-surface">
                    <span className="material-symbols-outlined text-white text-[20px]">person</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-1">
                  {isProfileOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-outline-variant mb-1 bg-surface-container-lowest rounded-t-xl -mt-2">
                    <div className="font-bold text-on-surface text-sm">{userName || 'Demo User'}</div>
                    <div className="text-xs text-on-surface-variant font-medium mt-0.5">{userRole === 'doctor' ? 'Medical Officer' : (userRole === 'admin' ? 'System Admin' : 'Radiographer')}</div>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">manage_accounts</span>
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">help</span>
                    Help & Support
                  </button>
                  
                  <div className="h-px bg-outline-variant my-1"></div>
                  
                  <button 
                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>
          <main className="w-full pt-16 px-space-lg py-space-md bg-surface">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
