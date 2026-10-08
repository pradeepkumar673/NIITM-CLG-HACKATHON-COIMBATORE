import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';

export function LiveStudyAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [stage, setStage] = useState<string>('running'); // running, completed, rejected, unavailable
  const [pipelineState, setPipelineState] = useState<any>({
    1: 'completed',
    2: 'running',
    3: 'pending',
    4: 'pending',
    5: 'pending'
  });
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    if (!id) return;
    
    // Default start state
    setPipelineState({
      1: 'completed',
      2: 'running',
      3: 'pending',
      4: 'pending',
      5: 'pending'
    });
    setProgress(30);

    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/studies/${id}/events`, {
      withCredentials: true // Depending on auth setup, might need this or pass token in URL if SSE doesn't support headers
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'close') {
          eventSource.close();
        } else if (data.event === 'stage') {
          const s = data.data.stage;
          if (s === 'processing') {
            setPipelineState({ 1: 'completed', 2: 'running', 3: 'pending', 4: 'pending', 5: 'pending' });
            setProgress(30);
          } else if (s === 'classification') {
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'running', 4: 'pending', 5: 'pending' });
            setProgress(50);
          } else if (s === 'anatomy' || s === 'summary') {
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'running', 5: 'pending' });
            setProgress(70);
          } else if (s === 'rules') {
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'completed', 5: 'running' });
            setProgress(90);
          } else if (s === 'done') {
            setPipelineState({ 1: 'completed', 2: 'completed', 3: 'completed', 4: 'completed', 5: 'completed' });
            setProgress(100);
            setStage('completed');
            eventSource.close();
          } else if (s === 'failed') {
            setStage('rejected');
            eventSource.close();
          }
        }
      } catch (e) {
        console.error('SSE Error:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  const cancelStudy = () => {
    if (window.confirm(`Are you sure you want to cancel analysis for ${id}?`)) {
      setStage('unavailable');
    }
  };

  const getStepUI = (stepId: number, title: string, time: string, desc: string, isLast = false) => {
    const s = pipelineState[stepId as keyof typeof pipelineState];
    let icon = null;
    let titleClass = "font-headline-sm text-headline-sm text-on-surface-variant font-medium";
    let timeText = "Pending";

    if (s === 'completed') {
      icon = (
        <div className="z-10 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0 shadow-sm transition-all">
          <span className="material-symbols-outlined text-[18px]">check</span>
        </div>
      );
      timeText = time;
      titleClass = "font-headline-sm text-headline-sm text-on-surface font-semibold";
    } else if (s === 'running') {
      icon = (
        <div className="z-10 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm transition-all animate-pulse">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
        </div>
      );
      timeText = "In progress...";
      titleClass = "font-headline-sm text-headline-sm text-primary font-bold";
    } else {
      icon = (
        <div className="z-10 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 shadow-sm transition-all">
          <span className="font-mono-data-sm text-mono-data-sm font-semibold">{stepId}</span>
        </div>
      );
    }

    if (stage === 'rejected' && s === 'pending') {
      icon = (
        <div className="z-10 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant/40 flex items-center justify-center shrink-0 shadow-sm transition-all">
          <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
        </div>
      );
      timeText = "Skipped";
      titleClass = "font-headline-sm text-headline-sm text-on-surface-variant/40 font-normal";
    } else if (stage === 'rejected' && s === 'running') {
      icon = (
        <div className="z-10 w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm transition-all">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </div>
      );
      timeText = "Failed";
      titleClass = "font-headline-sm text-headline-sm text-error font-semibold";
    }

    return (
      <div className={`relative flex items-start gap-space-md ${!isLast ? 'pb-space-lg' : ''}`} key={stepId}>
        {!isLast && <div className="absolute left-4 top-9 -bottom-1 w-0.5 bg-surface-container"></div>}
        {icon}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className={titleClass}>{stepId}. {title}</span>
              {s === 'running' && <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider">Processing</span>}
            </div>
            <span className={`font-mono-data-sm text-mono-data-sm ${s === 'running' ? 'text-primary font-medium' : (stage === 'rejected' && s === 'running' ? 'text-error font-semibold' : 'text-on-surface-variant')}`}>{timeText}</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {desc}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AppShell userRole="health_worker" userName="Sister Lakshmi Devi">
      <div className="w-full flex justify-center transition-all duration-300 pb-space-lg pt-space-md">
        <div className="w-full max-w-[720px] flex flex-col gap-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>Triage Dashboard</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-on-surface font-medium">Active Analysis</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="font-mono-data-sm text-mono-data-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-semibold">#{id}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm transition-all duration-300 flex flex-col p-space-md sm:p-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pb-space-md border-b-0">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                    Analysing study <span className="font-mono-data-md text-mono-data-md text-primary font-bold">#{id}</span>
                  </h1>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {stage === 'running' ? 'Edge model processing radiograph. Real-time stream active.' : (stage === 'completed' ? 'All edge inference stages finished. Report bundle compiled.' : 'Analysis halted.')}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shrink-0 self-start">
                <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                <span className="font-mono-data-sm text-mono-data-sm text-on-surface font-medium">Live connection</span>
              </div>
            </div>

            {stage !== 'unavailable' && (
              <div className="mt-space-sm flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono-data-sm text-mono-data-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">speed</span>
                    <span>{stage === 'completed' ? 'Analysis Complete' : (stage === 'rejected' ? 'Halted: Validation Failure' : 'Phase: Processing')}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 rounded-full ${stage === 'rejected' ? 'bg-error' : 'bg-primary-container'}`} style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {stage === 'unavailable' && (
              <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[22px]">hard_drive_2</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Analysis service unavailable</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Edge model weights missing or service disconnected.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                  <button className="w-full sm:w-auto h-11 px-space-md rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-all flex items-center justify-center gap-2" type="button" onClick={() => navigate('/dashboard')}>
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to dashboard
                  </button>
                </div>
              </div>
            )}

            {stage === 'rejected' && (
              <div className="mt-space-md p-space-md rounded-xl bg-error-container/40 flex flex-col gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[22px]">warning</span>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <h2 className="font-headline-sm text-headline-sm text-error font-semibold">Analysis Failed</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      The uploaded image could not be processed.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-space-sm">
                  <button className="w-full sm:w-auto h-11 px-space-lg rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm" type="button" onClick={() => navigate('/studies/new')}>
                    <span className="material-symbols-outlined text-[18px]">file_upload</span>
                    Upload a different image
                  </button>
                </div>
              </div>
            )}

            {stage === 'completed' && (
              <div className="mt-space-md p-space-md rounded-xl bg-surface-container flex items-start gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Analysis complete</h2>
                    <span className="font-mono-data-sm text-mono-data-sm px-2 py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-semibold">Triage Ready</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Calibrated probabilities, heatmaps, and clinical rule evaluations are processed and ready for clinician review.
                  </p>
                </div>
              </div>
            )}

            {stage !== 'unavailable' && (
              <div className="mt-space-lg flex flex-col">
                {getStepUI(1, "Image quality check", "0.7 s", "Validates DICOM header integrity and spatial resolution.")}
                {getStepUI(2, "Analysis", "1.9 s", "Deep convolutional neural network feature extraction across findings.")}
                {getStepUI(3, "Heatmap generation", "0.9 s", "Synthesizing Grad-CAM saliency mapping and localization.")}
                {getStepUI(4, "Uncertainty estimate", "0.4 s", "Monte Carlo dropout variance and calibration.")}
                {getStepUI(5, "Clinical rules", "0.3 s", "Evaluates clinical risk history flags and protocols.", true)}
              </div>
            )}

            <div className="mt-space-lg pt-space-md border-t-0 flex flex-col sm:flex-row items-center justify-between gap-space-md">
              {stage === 'running' && (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] animate-spin">sync</span>
                    <span>Do not close this window while analysis is running</span>
                  </div>
                  <button className="h-11 px-space-md rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-high transition-colors" type="button" onClick={cancelStudy}>
                    Cancel analysis
                  </button>
                </div>
              )}
              {stage === 'completed' && (
                <div className="w-full flex flex-col sm:flex-row items-center justify-end gap-space-sm">
                  <button 
                    className="w-full sm:w-auto h-12 px-space-lg rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm" 
                    type="button"
                    onClick={() => navigate(`/studies/${id}`)}
                  >
                    <span>View result</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-[720px] mx-auto mt-space-sm px-space-sm flex items-start gap-space-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-body-sm">
              Edge processing runs locally on Kashti PHC node hardware with no offsite PHI transmission. All model outputs remain subject to mandatory clinician diagnostic review.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
