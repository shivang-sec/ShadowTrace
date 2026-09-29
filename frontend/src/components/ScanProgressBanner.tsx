import React, { useEffect, useState } from 'react';
import { Loader2, Server, CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';
import { ScanJob } from '../types/scan';

interface ScanProgressBannerProps {
  job: ScanJob;
}

export const ScanProgressBanner: React.FC<ScanProgressBannerProps> = ({ job }) => {
  const [elapsed, setElapsed] = useState<number>(0);

  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed';

  // Real elapsed seconds calculated from created_at
  useEffect(() => {
    if (isCompleted || isFailed) return;

    const start = new Date(job.created_at).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [job.created_at, isCompleted, isFailed]);

  const stages = [
    {
      id: 'queued',
      name: '01. QUEUED',
      desc: 'Worker assigned',
      active: true,
      current: job.status === 'queued',
      done: job.status === 'running' || isCompleted,
    },
    {
      id: 'discovery',
      name: '02. NMAP DISCOVERY',
      desc: 'SYN scan & banner probing',
      active: job.stage === 'discovery' || job.stage === 'analysis' || isCompleted,
      current: job.stage === 'discovery',
      done: job.stage === 'analysis' || isCompleted,
    },
    {
      id: 'analysis',
      name: '03. HEURISTIC & CVE',
      desc: 'Baseline & NVD correlation',
      active: job.stage === 'analysis' || isCompleted,
      current: job.stage === 'analysis',
      done: isCompleted,
    },
    {
      id: 'complete',
      name: '04. COMPLETED',
      desc: 'Assessment synthesized',
      active: isCompleted,
      current: isCompleted,
      done: isCompleted,
    },
  ];

  return (
    <div
      className={`rounded-xl border p-5 mb-6 transition-all backdrop-blur-sm ${
        isFailed
          ? 'border-red-500/40 bg-red-950/20 shadow-glowDanger'
          : isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/20 shadow-glowSm'
          : 'border-cyan-500/40 bg-soc-panel/90 shadow-glow'
      }`}
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-soc-borderDark">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-soc-surface border border-slate-700/60 shrink-0">
            {isFailed ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
                {isFailed
                  ? 'ASSESSMENT HALTED'
                  : isCompleted
                  ? 'ASSESSMENT TELEMETRY READY'
                  : 'ACTIVE SCAN EXECUTION'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-surface border border-slate-700 text-cyan-300 font-semibold">
                JOB ID: {job.job_id.slice(0, 8)}
              </span>
            </div>

            <p className="text-xs font-mono text-slate-300 mt-1">
              Target: <span className="text-cyan-300 font-bold">{job.target}</span> &bull; Profile:{' '}
              <span className="uppercase text-slate-200 font-semibold">{job.profile}</span>
            </p>
          </div>
        </div>

        {/* Elapsed Timer & Backend Notice */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 self-end sm:self-auto">
          {!isCompleted && !isFailed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-soc-surface border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Elapsed: <strong className="text-cyan-300">{elapsed}s</strong></span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Kali Backend Execution</span>
          </div>
        </div>
      </div>

      {/* Stage Tracker Pipeline */}
      {!isFailed && (
        <div className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stages.map((st) => {
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                    st.current
                      ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200 shadow-glowSm'
                      : st.done
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-slate-800/80 bg-soc-surface/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold tracking-wide">{st.name}</span>
                    {st.done ? (
                      <span className="text-[10px] text-emerald-400 font-bold">DONE</span>
                    ) : st.current ? (
                      <span className="text-[10px] text-cyan-400 font-bold animate-pulse">ACTIVE</span>
                    ) : (
                      <span className="text-[10px] text-slate-600">PENDING</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Details */}
      {isFailed && job.error && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs font-mono text-red-200">
          <div className="flex items-center gap-2 font-bold mb-1 text-red-300">
            <Terminal className="w-4 h-4" />
            <span>Execution Interrupted</span>
          </div>
          <p className="text-[11px] text-red-300/90 leading-relaxed pl-6">{job.error}</p>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-red-900/40 pt-1.5 pl-6">
            Note: On Kali Linux, SYN scanning requires root / sudo capability. On Windows, ensure Nmap is on system PATH.
          </div>
        </div>
      )}
    </div>
  );
};
