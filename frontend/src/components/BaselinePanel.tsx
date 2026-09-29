import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldX, Info, ShieldCheck, Filter } from 'lucide-react';
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
    HIGH: findings.filter((f) => f.severity === 'HIGH').length,
    WARN: findings.filter((f) => f.severity === 'WARN').length,
    INFO: findings.filter((f) => f.severity === 'INFO').length,
    PASS: findings.filter((f) => f.severity === 'PASS').length,
  };

  const getStatusIcon = (sev: BaselineSeverity) => {
    switch (sev) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'HIGH':
        return <ShieldX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (sev: BaselineSeverity) => {
    switch (sev) {
      case 'HIGH':
        return 'border-red-500/40 bg-red-950/20';
      case 'WARN':
        return 'border-amber-500/30 bg-amber-950/20';
      case 'PASS':
        return 'border-emerald-500/30 bg-emerald-950/20';
      case 'INFO':
      default:
        return 'border-slate-800 bg-soc-surface';
    }
  };

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            SECURITY BASELINE AUDIT
          </h2>
          <Badge type="source" value="Rule Table Evaluation" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              filter === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL ({findings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('HIGH')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              filter === 'HIGH'
                ? 'bg-red-950 border border-red-500 text-red-200 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-red-300'
            }`}
          >
            HIGH ({counts.HIGH})
          </button>
          <button
            type="button"
            onClick={() => setFilter('WARN')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              filter === 'WARN'
                ? 'bg-amber-950 border border-amber-500 text-amber-200 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-amber-300'
            }`}
          >
            WARN ({counts.WARN})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PASS')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              filter === 'PASS'
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-200 font-bold'
                : 'bg-soc-surface text-slate-400 hover:text-emerald-300'
            }`}
          >
            PASS ({counts.PASS})
          </button>
        </div>
      </div>

      {/* Findings Listing */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No baseline findings match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((f, i) => (
            <div
              key={`${f.message}-${i}`}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-all ${getBorderColor(
                f.severity
              )}`}
            >
              <div className="flex items-start gap-2.5">
                {getStatusIcon(f.severity)}
                <div>
                  <p className="text-xs font-mono font-semibold text-slate-200">{f.message}</p>
                  {(f.port || f.service) && (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                      <span>Service: <strong className="text-slate-300">{f.service || 'Unknown'}</strong></span>
                      <span className="text-slate-600">&bull;</span>
                      <span>Port: <strong className="text-cyan-300">{f.port}</strong></span>
                    </div>
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
