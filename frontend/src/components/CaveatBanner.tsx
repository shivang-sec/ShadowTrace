import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface CaveatBannerProps {
  type?: 'cve' | 'info' | 'general';
  title?: string;
  message?: string;
}

export const CaveatBanner: React.FC<CaveatBannerProps> = ({
  type = 'cve',
  title = 'Assessment Caveat & Verification Notice',
  message,
}) => {
  const defaultMessage =
    type === 'cve'
      ? 'NVD CVE correlations are keyword search results from the National Vulnerability Database. They do NOT represent confirmed vulnerabilities without concrete applicability evidence and manual verification. Detected software versions are heuristically compared against advisory ranges.'
      : message;

  return (
    <div className="rounded-lg border border-cyan-900/40 bg-soc-panel/70 p-3.5 mb-4 text-xs">
      <div className="flex items-start gap-2.5">
        {type === 'cve' ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-semibold text-slate-200 tracking-wide">{title}</p>
          <p className="text-slate-400 leading-relaxed">{message || defaultMessage}</p>
        </div>
      </div>
    </div>
  );
};
