import React from 'react';
import { ShieldAlert, Server, Network, Download, Clock } from 'lucide-react';
import { AssessmentReport } from '../types/report';
import { Badge } from './Badge';

interface AssessmentOverviewProps {
  report: AssessmentReport;
  onExport: () => void;
  isExporting: boolean;
}

export const AssessmentOverview: React.FC<AssessmentOverviewProps> = ({
  report,
  onExport,
  isExporting,
}) => {
  const host = report.hosts[0];
  const score = host?.analysis.score ?? 0;
  const overallRisk = host?.analysis.level ?? 'LOW';
  const totalHosts = report.hosts.length;
  const totalServices = report.hosts.reduce(
    (sum, h) => sum + (h.host.services?.length || 0),
    0
  );

  const getScoreColor = (sc: number) => {
    if (sc >= 60) return 'text-red-400 border-red-500/50 bg-red-950/20';
    if (sc >= 30) return 'text-amber-400 border-amber-500/50 bg-amber-950/20';
    if (sc >= 10) return 'text-blue-400 border-blue-500/50 bg-blue-950/20';
    return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20';
  };

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      {/* Header bar with meta and Export button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-soc-borderDark">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              EXPOSURE ASSESSMENT
            </span>
            <Badge type="source" value="Heuristic Engine" />
          </div>
          <p className="text-sm font-mono text-slate-200 mt-1">
            Target: <span className="text-cyan-400 font-bold">{report.target}</span> &bull; Profile:{' '}
            <span className="uppercase text-slate-300">{report.profile}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date(report.timestamp).toLocaleString()}</span>
          </div>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono font-medium transition-colors"
            title="Download full JSON assessment"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* 4 Primary SOC Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exposure Score */}
        <div className={`rounded-xl border p-4 flex items-center justify-between ${getScoreColor(score)}`}>
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
              Exposure Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-mono font-bold">{score}</span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Capped cumulative weight</span>
          </div>
          <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center font-mono font-bold text-lg">
            {score}
          </div>
        </div>

        {/* Overall Risk */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
              Overall Risk Level
            </span>
            <div className="mt-1">
              <Badge type="risk" value={overallRisk} size="md" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
              Heuristic exposure threshold
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-soc-panel border border-slate-800 flex items-center justify-center text-slate-400">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Hosts Discovered */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
              Discovered Hosts
            </span>
            <span className="text-3xl font-mono font-bold text-slate-100">{totalHosts}</span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              Active responsive endpoints
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-soc-panel border border-slate-800 flex items-center justify-center text-slate-400">
            <Network className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Services Discovered */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 block mb-1">
              Open Services
            </span>
            <span className="text-3xl font-mono font-bold text-slate-100">{totalServices}</span>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              TCP ports probed with Nmap
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-soc-panel border border-slate-800 flex items-center justify-center text-slate-400">
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
