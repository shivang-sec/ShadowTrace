import React from 'react';
import { Cpu, ArrowRight, Tag, FileCode, CheckCircle2 } from 'lucide-react';
import { IntelligenceFinding } from '../types/report';
import { Badge } from './Badge';

interface IntelligencePanelProps {
  findings: IntelligenceFinding[];
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ findings }) => {
  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            SHADOWTRACE VULNERABILITY INTELLIGENCE
          </h2>
          <Badge type="source" value="Rule Catalog" />
        </div>

        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-soc-surface border border-slate-700 text-slate-300">
          {findings.length} Finding(s) Flagged
        </span>
      </div>

      {findings.length === 0 ? (
        /* Explicit non-complacency empty state */
        <div className="p-6 rounded-lg bg-soc-surface border border-slate-800 text-xs font-mono">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-200 text-sm">
                No ShadowTrace Rule Matches Observed
              </p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Discovered open services did not trigger any specific heuristic exposure rules in the active ShadowTrace catalog.
              </p>
              <div className="mt-3 p-2.5 rounded bg-soc-panel border border-slate-800/80 text-[11px] text-slate-500">
                <span className="text-slate-400 font-semibold">Scope Note: </span>
                Absence of matching rule signatures does not certify the target is immune to attack or devoid of configuration weaknesses. Full risk posture requires continuous evaluation.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((f) => {
            const ev = f.evidence;
            const detectedVersion = ev.version ? ev.version : 'Version undetected';

            return (
              <div
                key={f.id}
                className="rounded-lg border border-soc-border bg-soc-surface p-4 hover:border-slate-700 transition-all shadow-inner"
              >
                {/* Header: ID, Title, Category, Severity */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 font-mono font-bold text-xs text-cyan-300">
                      {f.id}
                    </span>
                    <h3 className="font-mono font-bold text-xs text-slate-100">
                      {f.finding}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-soc-panel px-2 py-0.5 rounded border border-slate-800">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {f.category}
                    </span>
                    <Badge type="risk" value={f.severity} />
                  </div>
                </div>

                {/* Evidence & Confidence Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 text-xs font-mono">
                  {/* Evidence block */}
                  <div className="md:col-span-8 p-3 rounded bg-soc-panel border border-slate-800/80">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      OBSERVED TELEMETRY EVIDENCE
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">SERVICE:</span>
                        <strong className="text-cyan-300">{ev.service}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PORT / PROTOCOL:</span>
                        <strong className="text-slate-200">{ev.port}/{ev.protocol}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PRODUCT BANNER:</span>
                        <span className="text-slate-300">{ev.product || 'Generic banner'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-slate-500 block text-[10px]">VERSION DETECTED:</span>
                        <code className="text-slate-200 bg-soc-surface px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
                          {detectedVersion}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Confidence block */}
                  <div className="md:col-span-4 p-3 rounded bg-soc-panel border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        CONFIDENCE RATING
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {f.confidence}
                        </span>
                        <span className="text-[10px] text-slate-400">Deterministic</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Direct signature match against open port response.
                    </p>
                  </div>
                </div>

                {/* Recommended Remediation Action */}
                <div className="p-3 rounded bg-soc-panel border border-cyan-900/30 text-xs font-mono flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-300 font-bold">Prescribed Remediation: </span>
                    <span className="text-slate-200 leading-relaxed">{f.recommendation}</span>
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
