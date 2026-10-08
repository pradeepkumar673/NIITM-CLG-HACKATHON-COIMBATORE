import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudyStudiesPost } from '../client';
import { AppShell } from '../components/AppShell';

export function NewStudy() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bodyPart, setBodyPart] = useState<string>('Auto');
  const [patientId, setPatientId] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<string>('unspecified');
  const [history, setHistory] = useState<Record<string, boolean>>({});
  
  const [state, setState] = useState<'resting' | 'preview' | 'uploading' | 'error'>('resting');
  const [reasons, setReasons] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null); // For DICOM, we might not have a simple preview
      }
      setState('preview');
      setReasons([]);
    }
  };

  const handleHistoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHistory(prev => ({
      ...prev,
      [e.target.value]: e.target.checked
    }));
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setState('resting');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const startAnalysis = async () => {
    if (!file) return;
    setState('uploading');
    try {
      const activeHistory = Object.entries(history).filter(([_, v]) => v).map(([k]) => k);
      const historyFlags = JSON.stringify(activeHistory);
      
      const response = await createStudyStudiesPost({
        body: {
          file,
          body_part: bodyPart === 'Auto' ? undefined : bodyPart.toLowerCase(),
          age: age ? parseInt(age) : undefined,
          sex,
          history_flags: historyFlags
        }
      });
      
      if (response.error) {
        setState('error');
        // @ts-ignore - response.error shape
        setReasons(response.error.reasons || [response.error.detail || 'Upload failed']);
      } else if (response.data) {
        // @ts-ignore
        const id = response.data.id;
        navigate(`/studies/${id}/live`);
      }
    } catch (e: any) {
      setState('error');
      setReasons([e.message || 'Network error']);
    }
  };

  return (
    <AppShell userRole="health_worker" userName="Sister Lakshmi Devi">
      <div className="w-full flex justify-center transition-all duration-300">
        <div className="w-full max-w-[1440px] flex flex-col gap-space-md" id="layout-inner-container">
          
          <header className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
            <div className="flex items-center gap-space-sm">
              <button onClick={() => navigate('/dashboard')} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Triage Dashboard
              </button>
              <span className="text-outline-variant font-mono-data-sm text-mono-data-sm">/</span>
              <span className="font-label-md text-label-md text-primary font-semibold">New Chest Study Intake</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-data-sm text-mono-data-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                ICD-11 / TB-LAMP Protocol
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* LEFT COLUMN: RADIOGRAPH CAPTURE & UPLOAD */}
            <section className="lg:col-span-7 flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h1 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">radiology</span>
                    Radiograph Capture & Upload
                  </h1>
                  <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Auto-Anonymize Active</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Upload native DICOM (.dcm), CR scan export, or high-resolution camera photograph of physical film placed on a view box.
                </p>
              </div>

              {state === 'resting' && (
                <div className="flex flex-col gap-space-md">
                  <div className="relative bg-surface p-space-lg rounded-xl text-center flex flex-col items-center justify-center gap-space-md min-h-[340px] shadow-sm hover:bg-surface-container-low transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-sm">
                      <span className="material-symbols-outlined text-[34px]">cloud_upload</span>
                    </div>
                    <div className="flex flex-col gap-1 max-w-md">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Drag an X-ray here (DICOM, JPEG or PNG)
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Supports optical lightbox transfers, CR phosphor plate dumps, and standard PACs bundles up to 120 MB.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
                      <input type="file" className="hidden" ref={fileInputRef} accept="image/*,.dcm" onChange={handleFileChange} />
                      <input type="file" className="hidden" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} />
                      
                      <button className="min-h-[44px] px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm flex items-center gap-2" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        <span className="material-symbols-outlined text-[18px]">file_open</span>
                        Browse local files
                      </button>
                      <button className="min-h-[44px] px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2" type="button" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        Take photo with camera
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm pt-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                      <span>Phone photos of illuminated film are accepted; the system checks image quality first.</span>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-low p-space-md rounded-xl flex flex-wrap items-center justify-between gap-space-sm">
                    <div className="flex flex-wrap items-center gap-1.5 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                      <span className="font-semibold text-on-surface">Supported:</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest shadow-sm text-on-surface">.DCM</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest shadow-sm text-on-surface">.PNG</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest shadow-sm text-on-surface">.JPG</span>
                      <span className="text-outline-variant">(≤ 120 MB)</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono-data-sm text-mono-data-sm text-tertiary-container">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>ABDM Compliant</span>
                    </div>
                  </div>
                </div>
              )}

              {state === 'preview' && file && (
                <div className="flex flex-col gap-space-md">
                  <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm flex flex-col md:flex-row gap-space-md">
                    <div className="relative w-full md:w-56 h-64 bg-inverse-surface rounded-lg overflow-hidden flex items-center justify-center shadow-md shrink-0">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover mix-blend-luminosity opacity-90" alt="Preview" />
                      ) : (
                        <span className="text-surface font-mono-data-sm">DICOM Preview N/A</span>
                      )}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-15">
                        <div className="bg-primary/20"></div><div></div><div className="bg-primary/20"></div>
                        <div></div><div className="bg-primary/20"></div><div></div>
                        <div className="bg-primary/20"></div><div></div><div className="bg-primary/20"></div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-space-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-start justify-between gap-space-sm">
                          <div>
                            <span className="font-mono-data-lg text-mono-data-lg text-on-surface font-semibold break-all">
                              {file.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1 font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                              <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                            </div>
                          </div>
                          <button className="text-error hover:bg-error-container hover:text-on-error-container p-1 rounded-lg transition-colors" onClick={removeFile} type="button">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                        <div className="mt-space-sm inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface">
                          <span className="material-symbols-outlined text-tertiary-container text-[18px]">check_circle</span>
                          <span className="font-medium">Quality Pre-check:</span>
                          <span className="font-mono-data-sm text-mono-data-sm text-tertiary-container font-semibold">PASS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state === 'uploading' && (
                <div className="flex flex-col gap-space-md">
                  <div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary animate-spin">
                          <span className="material-symbols-outlined text-[20px]">sync</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Uploading to Edge Accelerator</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden shadow-inner relative">
                        <div className="h-full bg-primary-container rounded-full transition-all duration-500 w-[100%] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-on-primary-container/30 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {state === 'error' && (
                <div className="flex flex-col gap-space-md">
                  <div className="bg-error-container p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">warning</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="font-headline-sm text-headline-sm text-on-error-container font-bold">
                          This image was rejected
                        </h3>
                        <div className="font-mono-data-sm text-mono-data-sm text-on-error-container mt-2 opacity-90">
                          {reasons.map((r, i) => <div key={i}>• {r}</div>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-sm pt-space-xs pl-12">
                      <button className="min-h-[44px] px-space-md py-2 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5" onClick={removeFile} type="button">
                        <span className="material-symbols-outlined text-[18px]">replay</span>
                        Try another image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: STUDY PARAMETERS */}
            <section className="lg:col-span-5 flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
              <div className="flex flex-col gap-1">
                <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                  Study Parameters & Clinical Context
                </h2>
              </div>
              <form className="flex flex-col gap-space-md" onSubmit={(e) => { e.preventDefault(); startAnalysis(); }}>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
                    <span>Body Part (Mandatory)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-surface-container-high rounded-xl">
                    {['Chest', 'Bone', 'Knee', 'Auto'].map((part) => (
                      <button 
                        key={part}
                        type="button"
                        onClick={() => setBodyPart(part)}
                        className={`py-2 px-1 rounded-lg font-label-sm text-label-sm shadow-sm transition-all text-center ${bodyPart === part ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container-lowest'}`}
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="patient-id-input">
                      Patient ID or ABHA ID
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">(Optional)</span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px] pointer-events-none">badge</span>
                    <input 
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 bg-surface-container-lowest rounded-lg font-mono-data-md text-mono-data-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline-variant transition-all border border-outline-variant" 
                      id="patient-id-input" 
                      placeholder="e.g. ABHA 91-8201-9481-22 or OPD-402" 
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md items-start">
                  <div className="sm:col-span-5 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="patient-age-input">
                      Age (Years)
                    </label>
                    <input 
                      className="w-full min-h-[44px] px-3 py-2 bg-surface-container-lowest rounded-lg font-mono-data-md text-mono-data-md text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline-variant transition-all border border-outline-variant" 
                      id="patient-age-input" 
                      max="120" min="0" 
                      placeholder="e.g. 42" 
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-7 flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">Sex</label>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      {['female', 'male', 'other', 'unspecified'].map((s) => (
                        <label key={s} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
                          <input 
                            className="accent-primary" 
                            name="patient_sex" 
                            type="radio" 
                            value={s}
                            checked={sex === s}
                            onChange={() => setSex(s)}
                          />
                          <span className="font-label-sm text-label-sm text-on-surface capitalize">{s === 'unspecified' ? 'Unknown' : s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
                    <span>Clinical History & Risk Factors</span>
                    <span className="font-mono-data-sm text-mono-data-sm text-on-surface-variant">Multi-select</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container-low p-space-sm rounded-xl">
                    {[
                      { id: 'diabetes', label: 'Diabetes Mellitus' },
                      { id: 'hiv', label: 'HIV / Immunocompromised' },
                      { id: 'smoker', label: 'Smoker' },
                      { id: 'hypertension', label: 'Hypertension' },
                      { id: 'ckd', label: 'Kidney disease (CKD)' },
                      { id: 'copd', label: 'COPD or Asthma' },
                      { id: 'tb', label: 'Prior TB History' },
                      { id: 'pregnancy', label: 'Pregnancy' }
                    ].map(h => (
                      <label key={h.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer shadow-sm">
                        <input className="w-4 h-4 rounded accent-primary" type="checkbox" value={h.id} checked={!!history[h.id]} onChange={handleHistoryChange} />
                        <span className="font-body-sm text-body-sm text-on-surface">{h.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-space-sm flex flex-col gap-2">
                  <button 
                    disabled={state !== 'preview'}
                    className="w-full min-h-[48px] px-space-lg py-3 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-primary active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-container"
                    type="submit"
                  >
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>Start analysis</span>
                  </button>
                  {state === 'resting' && (
                    <div className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>Select or capture an X-ray to start analysis</span>
                    </div>
                  )}
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
