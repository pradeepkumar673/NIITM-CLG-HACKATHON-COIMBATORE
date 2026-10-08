import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAuthLoginPost } from '../client';
import { client } from '../client/client.gen';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await loginAuthLoginPost({
        body: {
          email,
          password
        }
      });
      if (response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
        client.interceptors.request.use((request) => {
          request.headers.set('Authorization', `Bearer ${response.data.access_token}`);
          return request;
        });
        // Decode token to get role, for now just redirect to dashboard
        // A real app would decode JWT payload here
        const base64Url = response.data.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        
        if (payload.role === 'admin') navigate('/admin');
        else if (payload.role === 'doctor') navigate('/queue');
        else navigate('/dashboard');
      } else if (response.error) {
        setErrorMsg('Email or password is incorrect.');
      }
    } catch (error) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#E6F4F6] selection:text-[#0F5E6B] font-body-md text-on-surface">
      <main className="flex-1 flex flex-col lg:flex-row w-full min-h-screen">
        {/* LEFT HALF: Calm Deep Teal Panel */}
        <section className="lg:w-1/2 bg-primary text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden transition-all duration-300" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
          <div className="absolute -right-16 -bottom-16 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <circle cx="200" cy="200" r="160" strokeDasharray="8 8" />
              <path d="M200 40 L200 360" />
              <path d="M110 130 C130 90 270 90 290 130 C310 180 300 270 260 310 C220 340 180 340 140 310 C100 270 90 180 110 130 Z" />
              <path d="M150 150 C170 170 230 170 250 150" />
              <path d="M140 200 C170 220 230 220 260 200" />
              <path d="M150 250 C175 265 225 265 250 250" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 sm:mb-10">
              <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-teal-100 font-semibold block">National Rural Tele-Radiology Network</span>
                <span className="text-[13px] text-white/80">Ayushman Bharat Digital Mission (ABDM) Compatible</span>
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs text-teal-50 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FEDF89] animate-pulse"></span>
                <span>Local Offline Inference Ready</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                XRAY-ASSISTANT
              </h1>
              <p className="text-lg sm:text-xl text-teal-50 font-normal leading-relaxed">
                AI-assisted X-ray decision support for clinics
              </p>
              <p className="text-sm text-teal-100/90 leading-normal pt-2 font-normal max-w-md hidden sm:block">
                Engineered specifically for Medical Officers, Radiographers, and Auxiliary Nurse Midwives in Primary Health Centres (PHCs) and Community Health Centres (CHCs).
              </p>
            </div>
          </div>
          <div className="relative z-10 pt-8 mt-8 border-t border-white/15 space-y-4 hidden sm:block">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <span className="text-teal-200 block text-[11px] font-medium">Supported Modalities</span>
                <span className="font-medium text-white text-xs mt-0.5 block">Chest AP/PA, Knee Bilateral, Bone Trauma</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <span className="text-teal-200 block text-[11px] font-medium">Model Calibration Rule</span>
                <span className="font-mono text-white text-xs mt-0.5 block">Platt-scaled 95% CI</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-teal-200">
              <span>Security Protocol: ISO 27799 / DISHA Compliant</span>
              <span className="font-mono text-white/80">Edge ID: IND-MH-821</span>
            </div>
          </div>
        </section>

        {/* RIGHT HALF */}
        <section className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-surface">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden flex items-center justify-between mb-4 pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-base">XRAY-ASSISTANT</span>
                <span className="text-xs bg-surface-container text-primary px-2 py-0.5 rounded font-medium">Primary Care</span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">Mobile View</span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 sm:p-8 relative">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">Clinician Sign in</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-primary bg-surface-container px-2 py-0.5 rounded border border-primary/20">
                    <span className="material-symbols-outlined text-[12px]">badge</span>
                    ABHA / Clinic ID
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Enter your clinical credentials or Government Health ID to access the triage queue.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <div className="space-y-1.5">
                  <label htmlFor="email-input" className="block text-sm font-semibold text-on-surface">
                    Email address or Health Worker ID <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@clinic.gov.in or ABHA ID"
                      className={`w-full px-3.5 py-2.5 rounded-lg border bg-surface-container-lowest text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 transition-all min-h-[44px] ${errorMsg ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                      required
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant">Standard email format or 14-digit ABHA number</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password-input" className="block text-sm font-semibold text-on-surface">
                      Password <span className="text-error">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-on-surface-variant">Min. 8 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your security password"
                      className={`w-full px-3.5 py-2.5 pr-12 rounded-lg border bg-surface-container-lowest text-on-surface text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 transition-all min-h-[44px] ${errorMsg ? 'border-error focus:border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center text-on-surface-variant hover:text-on-surface focus:outline-none focus:text-primary min-h-[44px] min-w-[44px]"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-on-surface-variant">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary" />
                    <span>Remember this local terminal</span>
                  </label>
                  <span className="text-tertiary-container font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                    Encrypted Session
                  </span>
                </div>

                {errorMsg && (
                  <div className="rounded-lg bg-error-container border border-[#FECDCA] p-3 text-on-error-container flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-error mt-0.5 text-[20px]">error</span>
                    <div className="text-xs">
                      <span className="font-semibold block">Authentication Failed</span>
                      <span className="text-error/90">{errorMsg}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[48px] bg-primary hover:bg-primary/90 active:bg-primary-fixed-dim text-on-primary font-semibold text-sm rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-75 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {!isLoading ? (
                      <>
                        <span>Sign in</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        <span>Authenticating...</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-4 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                <span>Edge AI Sync: <span className="font-mono text-on-surface font-medium">Synced just now</span></span>
              </div>
              <span className="font-mono text-[11px] text-primary">v2.4-PROD</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-2.5 px-4 text-center z-20 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            <p className="font-medium text-on-surface">
              Decision support only. Not a diagnosis. Requires clinician review.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-on-surface-variant">
            <span className="hidden md:inline">Protocol: IN-RURAL-CDS-2024</span>
            <span className="font-mono">WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
