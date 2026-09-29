import React from 'react';
import { ShieldAlert, Network, Download, Clock, Database } from 'lucide-react';
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
  const primaryHost = report.hosts[0];
  const score = primaryHost?.analysis.score ?? 0;
  const overallRisk = primaryHost?.analysis.level ?? 'LOW';
  const totalHosts = report.hosts.length;

  const totalServices = report.hosts.reduce(
    (sum, h) => sum + (h.host.services?.length || 0),
    0
  );

  const totalBaselineFindings = report.hosts.reduce(
    (sum, h) => sum + (h.baseline.findings?.length || 0),
    0
  );

  const totalIntelligenceRules = report.hosts.reduce(
    (sum, h) => sum + (h.intelligence?.length || 0),
    0
  );

  const totalCveMatches = report.hosts.reduce(
    (sum, h) =>
      sum +
      (h.cve_intelligence?.reduce((cveSum, cveRes) => cveSum + (cveRes.matches?.length || 0), 0) || 0),
    0
  );

  const getScoreTheme = (sc: number) => {
    if (sc >= 60) {
      return {
        text: 'text-red-400',
        bg: 'bg-red-950/20',
        border: 'border-red-500/50',
        bar: 'bg-red-500',
        label: 'CRITICAL EXPOSURE',
      };
    }
    if (sc >= 30) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-950/20',
        border: 'border-amber-500/50',
        bar: 'bg-amber-500',
        label: 'ELEVATED EXPOSURE',
      };
    }
    if (sc >= 10) {
      return {
        text: 'text-sky-400',
        bg: 'bg-sky-950/20',
        border: 'border-sky-500/50',
        bar: 'bg-sky-500',
        label: 'MODERATE EXPOSURE',
      };
    }
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/50',
      bar: 'bg-emerald-500',
      label: 'LOW EXPOSURE',
    };
  };

  const scoreTheme = getScoreTheme(score);

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Top Header Row with Meta & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-soc-borderDark">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              EXPOSURE SCORECARD & TELEMETRY
            </h2>
            <Badge type="source" value="Engine Assessment" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-surface border border-slate-700 text-slate-400">
              Target: <strong className="text-cyan-300">{report.target}</strong>
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Engine: {report.tool} v{report.version} &bull; Profile:{' '}
            <span className="uppercase text-slate-200 font-bold">{report.profile}</span>
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono font-bold transition-all shadow-glowSm hover:shadow-glow"
            title="Download full JSON assessment"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'EXPORTING...' : 'EXPORT JSON'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key SOC Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Exposure Score Card */}
        <div className={`rounded-xl border p-4 ${scoreTheme.bg} ${scoreTheme.border}`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Exposure Score
            </span>
            <span className={`text-[10px] font-mono font-bold ${scoreTheme.text}`}>
              {scoreTheme.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-4xl font-mono font-extrabold ${scoreTheme.text}`}>{score}</span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>

          {/* Visual Score Meter */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${scoreTheme.bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 block mt-2">
            Heuristic cumulative exposure index
          </span>
        </div>

        {/* Overall Risk Card */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Overall Risk Level
            </span>
            <ShieldAlert className="w-4 h-4 text-slate-500" />
          </div>

          <div className="my-1">
            <Badge type="risk" value={overallRisk} size="lg" />
          </div>

          <span className="text-[10px] font-mono text-slate-500 block mt-2">
            Derived from highest service risk threshold
          </span>
        </div>

        {/* Discovered Hosts & Services */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Assets Discovered
            </span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-1">
            <div>
              <span className="text-2xl font-mono font-bold text-slate-100">{totalHosts}</span>
              <span className="text-[10px] font-mono text-slate-400 block">Host(s)</span>
            </div>
            <div>
              <span className="text-2xl font-mono font-bold text-cyan-400">{totalServices}</span>
              <span className="text-[10px] font-mono text-slate-400 block">Open Ports</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 block mt-2">
            Active responsive network endpoints
          </span>
        </div>

        {/* Intelligence & CVE Matches */}
        <div className="rounded-xl border border-soc-border bg-soc-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Intelligence Findings
            </span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-1">
            <div>
              <span className="text-2xl font-mono font-bold text-slate-100">{totalIntelligenceRules}</span>
              <span className="text-[10px] font-mono text-slate-400 block">Rule Matches</span>
            </div>
            <div>
              <span className={`text-2xl font-mono font-bold ${totalCveMatches > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {totalCveMatches}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block">NVD Matches</span>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 block mt-2">
            Baseline checks: {totalBaselineFindings} evaluated
          </span>
        </div>
      </div>
    </div>
  );
};
