import React from 'react';
import { RiskLevel, BaselineSeverity, ApplicabilityStatus } from '../types/report';

interface BadgeProps {
  type: 'risk' | 'baseline' | 'applicability' | 'source' | 'status';
  value: string | RiskLevel | BaselineSeverity | ApplicabilityStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm font-semibold';

  if (type === 'risk' || type === 'baseline') {
    const val = String(value).toUpperCase();
    switch (val) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className={`inline-flex items-center font-mono font-medium rounded border border-red-500/30 bg-red-950/40 text-red-400 ${sizeClasses}`}>
            {val}
          </span>
        );
      case 'WARN':
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center font-mono font-medium rounded border border-amber-500/30 bg-amber-950/40 text-amber-400 ${sizeClasses}`}>
            {val}
          </span>
        );
      case 'LOW':
        return (
          <span className={`inline-flex items-center font-mono font-medium rounded border border-blue-500/30 bg-blue-950/40 text-blue-400 ${sizeClasses}`}>
            {val}
          </span>
        );
      case 'PASS':
        return (
          <span className={`inline-flex items-center font-mono font-medium rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 ${sizeClasses}`}>
            PASS
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className={`inline-flex items-center font-mono font-medium rounded border border-slate-700 bg-slate-800/60 text-slate-300 ${sizeClasses}`}>
            {val}
          </span>
        );
    }
  }

  if (type === 'applicability') {
    const status = String(value).toLowerCase();
    if (status === 'potentially_affected') {
      return (
        <span className={`inline-flex items-center font-mono font-medium rounded border border-red-500/40 bg-red-950/50 text-red-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
          POTENTIALLY AFFECTED
        </span>
      );
    }
    if (status === 'not_affected') {
      return (
        <span className={`inline-flex items-center font-mono font-medium rounded border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          NOT AFFECTED
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-mono font-medium rounded border border-slate-600 bg-slate-800/80 text-slate-300 ${sizeClasses}`}>
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
