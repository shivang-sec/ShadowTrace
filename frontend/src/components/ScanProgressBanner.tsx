import React from 'react';
import { Loader2, Server, CheckCircle2, XCircle } from 'lucide-react';
import { ScanJob } from '../types/scan';

interface ScanProgressBannerProps {
  job: ScanJob;
}

export const ScanProgressBanner: React.FC<ScanProgressBannerProps> = ({ job }) => {
  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed';

  const stages = [
    { id: 'queued', label: 'Queued', active: job.status === 'queued' || job.status === 'running' },
    {
      id: 'discovery',
      label: 'Nmap Discovery',
      active: job.stage === 'discovery' || job.stage === 'analysis' || isCompleted,
      current: job.stage === 'discovery',
    },
    {
      id: 'analysis',
      label: 'Exposure & CVE Correlation',
      active: job.stage === 'analysis' || isCompleted,
      current: job.stage === 'analysis',
    },
    {
      id: 'complete',
      label: 'Assessment Ready',
      active: isCompleted,
      current: isCompleted,
    },
  ];

  return (
    <div
      className={`rounded-xl border p-4 mb-6 transition-all ${
        isFailed
          ? 'border-red-500/40 bg-red-950/20'
          : isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/20'
          : 'border-cyan-500/30 bg-soc-panel/90 shadow-glow'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {isFailed ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                {isFailed
                  ? 'ASSESSMENT FAILED'
                  : isCompleted
                  ? 'ASSESSMENT COMPLETE'
                  : 'SCAN IN PROGRESS'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Job: {job.job_id.slice(0, 8)}...
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="font-mono text-cyan-300">{job.target}</span> &bull; Profile:{' '}
              <span className="font-mono uppercase text-slate-300">{job.profile}</span>
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Executing Nmap engine on backend</span>
        </div>
      </div>

      {/* Progress Pipeline Indicator */}
      {!isFailed && (
        <div className="pt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stages.map((st, idx) => {
              const isDone = st.active && !st.current;
              const isCurrent = st.current;
              return (
                <div
                  key={st.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-colors ${
                    isCurrent
                      ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 shadow-sm'
                      : isDone
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                      : 'border-slate-800 bg-soc-surface text-slate-500'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span className="truncate">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {isFailed && job.error && (
        <div className="mt-3 p-2.5 rounded bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300">
          <span className="font-bold">Failure reason: </span>
          {job.error}
        </div>
      )}
    </div>
  );
};
