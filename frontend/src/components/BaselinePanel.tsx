import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldX, Info, ShieldCheck } from 'lucide-react';
import { BaselineReport, BaselineSeverity } from '../types/report';
import { Badge } from './Badge';

interface BaselinePanelProps {
  baseline: BaselineReport;
}

export const BaselinePanel: React.FC<BaselinePanelProps> = ({ baseline }) => {
  const [filter, setFilter] = useState<'ALL' | BaselineSeverity>('ALL');

  const findings = baseline.findings || [];
  const filtered = filter === 'ALL' ? findings : findings.filter((f) => f.severity === filter);

  const counts = {
    PASS: findings.filter((f) => f.severity === 'PASS').length,
    WARN: findings.filter((f) => f.severity === 'WARN').length,
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    INFO: findings.filter((f) => f.severity === 'INFO').length,
  };

  const getIcon = (sev: BaselineSeverity) => {
    switch (sev) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'HIGH':
        return <ShieldX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            SECURITY BASELINE
          </h2>
          <Badge type="source" value="Rule Evaluation" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL ({findings.length})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'HIGH'
                ? 'bg-red-950 border border-red-500 text-red-300 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-red-300'
            }`}
          >
            HIGH ({counts.HIGH})
          </button>
          <button
            onClick={() => setFilter('WARN')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'WARN'
                ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-amber-300'
            }`}
          >
            WARN ({counts.WARN})
          </button>
          <button
            onClick={() => setFilter('PASS')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              filter === 'PASS'
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-emerald-300'
            }`}
          >
            PASS ({counts.PASS})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No baseline findings match filter criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => (
            <div
              key={`${f.message}-${i}`}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-800/80 bg-soc-surface hover:bg-soc-hover/60 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                {getIcon(f.severity)}
                <div>
                  <p className="text-xs font-mono text-slate-200">{f.message}</p>
                  {(f.port || f.service) && (
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Service: <span className="text-slate-300">{f.service || 'Unknown'}</span> &bull; Port:{' '}
                      <span className="text-cyan-300">{f.port}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <Badge type="baseline" value={f.severity} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
