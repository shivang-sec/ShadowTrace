import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { IntelligenceFinding } from '../types/report';
import { Badge } from './Badge';

interface IntelligencePanelProps {
  findings: IntelligenceFinding[];
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ findings }) => {
  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            VULNERABILITY INTELLIGENCE
          </h2>
          <Badge type="source" value="ShadowTrace Rules" />
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {findings.length} Rule Matches
        </span>
      </div>

      {findings.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex flex-col items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <p className="font-semibold">[PASS] No high-risk vulnerability intelligence rules matched.</p>
          <p className="text-slate-400 text-[11px]">
            Discovered network services comply with the active baseline rule catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((f) => {
            const ev = f.evidence;
            const versionStr = ev.version ? ev.version : 'version not detected';

            return (
              <div
                key={f.id}
                className="rounded-lg border border-slate-800 bg-soc-surface p-4 hover:border-slate-700 transition-colors"
              >
                {/* Header: ID, Title, Severity & Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300">
                      {f.id}
                    </span>
                    <h3 className="font-mono font-semibold text-xs text-slate-200">
                      {f.finding}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {f.category}
                    </span>
                    <Badge type="risk" value={f.severity} />
                  </div>
                </div>

                {/* Evidence & Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs font-mono">
                  {/* Evidence block */}
                  <div className="p-2.5 rounded bg-soc-panel border border-slate-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                      DISCOVERED EVIDENCE
                    </span>
                    <p className="text-slate-200">
                      Service: <span className="text-cyan-300 font-bold">{ev.service}</span> on port{' '}
                      <span className="text-cyan-300 font-bold">{ev.port}</span> ({ev.protocol})
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Product: <span className="text-slate-300">{ev.product || 'Unknown'}</span> &bull; Version:{' '}
                      <span className="text-slate-300">{versionStr}</span>
                    </p>
                  </div>

                  {/* Confidence block */}
                  <div className="p-2.5 rounded bg-soc-panel border border-slate-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                      DETECTION CONFIDENCE
                    </span>
                    <p className="text-slate-200">
                      Confidence Level:{' '}
                      <span className="text-emerald-400 font-bold">{f.confidence}</span>
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Direct deterministic match on open port and service banner.
                    </p>
                  </div>
                </div>

                {/* Remediation Action */}
                <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-300 font-bold">Recommended Action: </span>
                    <span className="text-slate-300">{f.recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
