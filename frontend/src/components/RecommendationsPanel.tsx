import React from 'react';
import { ListChecks, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

interface RecommendationsPanelProps {
  recommendations: string[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2.5">
          <ListChecks className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            ACTIONABLE REMEDIATION ROADMAP
          </h2>
          <Badge type="source" value="Engine Prescription" />
        </div>

        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-soc-surface border border-slate-700 text-slate-300">
          {recommendations.length} Action Items
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span className="font-bold">No High-Priority Baseline Interventions Pending</span>
          <span className="text-[11px] text-slate-400">
            All observed baseline network services satisfy security guidelines.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => {
            const priorityNumber = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={`${rec}-${idx}`}
                className="flex items-start gap-3.5 p-4 rounded-lg border border-soc-border bg-soc-surface hover:border-slate-700 transition-all font-mono text-xs"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold shrink-0 text-xs">
                  {priorityNumber}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      PRIORITY ACTION #{priorityNumber}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs">
                    {rec}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
