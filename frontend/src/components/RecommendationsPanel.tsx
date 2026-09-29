import React from 'react';
import { ListChecks, CheckCircle } from 'lucide-react';
import { Badge } from './Badge';

interface RecommendationsPanelProps {
  recommendations: string[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            SECURITY RECOMMENDATIONS
          </h2>
          <Badge type="source" value="Engine Prescriptions" />
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {recommendations.length} Actions
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-6 text-center text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>No immediate baseline remediation actions required based on discovered services.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recommendations.map((rec, idx) => (
            <div
              key={`${rec}-${idx}`}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-soc-surface hover:bg-soc-hover/60 transition-colors text-xs font-mono"
            >
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-bold shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <p className="text-slate-200 mt-0.5 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
