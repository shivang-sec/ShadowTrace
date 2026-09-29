import React from 'react';
import { RiskLevel, BaselineSeverity, ApplicabilityStatus } from '../types/report';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, ShieldX } from 'lucide-react';

interface BadgeProps {
  type: 'risk' | 'baseline' | 'applicability' | 'source' | 'status' | 'cvss';
  value: string | number | RiskLevel | BaselineSeverity | ApplicabilityStatus | null;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : size === 'md'
      ? 'px-2.5 py-1 text-xs font-semibold'
      : 'px-3 py-1.5 text-sm font-bold';

  if (type === 'risk' || type === 'baseline') {
    const val = String(value || 'INFO').toUpperCase();
    switch (val) {
      case 'CRITICAL':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-bold rounded border border-red-500/50 bg-red-950/70 text-red-300 shadow-glowDanger ${sizeClasses}`}>
            <ShieldX className="w-3 h-3 text-red-400" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-semibold rounded border border-rose-500/40 bg-rose-950/50 text-rose-300 ${sizeClasses}`}>
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            HIGH
          </span>
        );
      case 'WARN':
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-semibold rounded border border-amber-500/40 bg-amber-950/50 text-amber-300 ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {val === 'WARN' ? 'WARN' : 'MEDIUM'}
          </span>
        );
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-sky-500/40 bg-sky-950/40 text-sky-300 ${sizeClasses}`}>
            <Info className="w-3 h-3 text-sky-400" />
            LOW
          </span>
        );
      case 'PASS':
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-semibold rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 ${sizeClasses}`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            PASS
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-slate-700/80 bg-slate-800/60 text-slate-300 ${sizeClasses}`}>
            <Info className="w-3 h-3 text-slate-400" />
            INFO
          </span>
        );
    }
  }

  if (type === 'cvss') {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) {
      return (
        <span className={`inline-flex items-center font-mono rounded border border-slate-700 bg-slate-800 text-slate-400 ${sizeClasses}`}>
          CVSS N/A
        </span>
      );
    }

    let color = 'border-slate-700 bg-slate-800 text-slate-300';
    if (num >= 9.0) color = 'border-red-500/60 bg-red-950/80 text-red-200 shadow-glowDanger';
    else if (num >= 7.0) color = 'border-rose-500/50 bg-rose-950/60 text-rose-200';
    else if (num >= 4.0) color = 'border-amber-500/50 bg-amber-950/60 text-amber-200';
    else if (num > 0.0) color = 'border-sky-500/50 bg-sky-950/50 text-sky-200';

    return (
      <span className={`inline-flex items-center gap-1 font-mono font-bold rounded border ${color} ${sizeClasses}`}>
        <span className="text-[9px] uppercase tracking-wider text-slate-400">CVSS</span>
        <span>{num.toFixed(1)}</span>
      </span>
    );
  }

  if (type === 'applicability') {
    const status = String(value || '').toLowerCase();
    if (status === 'potentially_affected') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono font-bold rounded border border-rose-500/50 bg-rose-950/60 text-rose-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          POTENTIALLY AFFECTED
        </span>
      );
    }
    if (status === 'not_affected') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          NOT AFFECTED
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-slate-700 bg-slate-800/80 text-slate-300 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        UNKNOWN APPLICABILITY
      </span>
    );
  }

  if (type === 'source') {
    return (
      <span className={`inline-flex items-center font-mono text-[10px] tracking-wider uppercase rounded border border-cyan-800/50 bg-cyan-950/30 text-cyan-400 ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-mono rounded border border-slate-700 bg-slate-800 text-slate-300 ${sizeClasses}`}>
      {value}
    </span>
  );
};
