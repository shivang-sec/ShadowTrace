import React, { useState } from 'react';
import { Server, ChevronDown, ChevronRight } from 'lucide-react';
import { HostAssessment } from '../types/report';
import { Badge } from './Badge';

interface ServicesTableProps {
  hosts?: HostAssessment[];
  hostAssessment?: HostAssessment;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({ hosts, hostAssessment }) => {
  // Support either multiple hosts or single hostAssessment
  const hostList: HostAssessment[] = hosts && hosts.length > 0
    ? hosts
    : hostAssessment
    ? [hostAssessment]
    : [];

  const [expandedHosts, setExpandedHosts] = useState<Record<string, boolean>>(() => {
    // Default: expand the first host
    const initial: Record<string, boolean> = {};
    if (hostList.length > 0) {
      initial[hostList[0].host.host] = true;
    }
    return initial;
  });

  const toggleHost = (hostIp: string) => {
    setExpandedHosts((prev) => ({
      ...prev,
      [hostIp]: !prev[hostIp],
    }));
  };

  const totalServices = hostList.reduce(
    (sum, h) => sum + (h.host.services?.length || 0),
    0
  );

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            DISCOVERED ASSETS & SERVICE EXPLORER
          </h2>
          <Badge type="source" value="Active Port Discovery" />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>{hostList.length} Host(s)</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-cyan-300 font-bold">{totalServices} Open Service(s)</span>
        </div>
      </div>

      {hostList.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No responsive network targets discovered.
        </div>
      ) : (
        <div className="space-y-4">
          {hostList.map((h, hostIdx) => {
            const hostData = h.host;
            const services = hostData.services || [];
            const isExpanded = !!expandedHosts[hostData.host];
            const findingsMap = new Map((h.analysis.findings || []).map((f) => [f.port, f]));

            return (
              <div
                key={`${hostData.host}-${hostIdx}`}
                className="rounded-lg border border-soc-border bg-soc-surface overflow-hidden transition-all"
              >
                {/* Host Card Header (Collapsible) */}
                <div
                  onClick={() => toggleHost(hostData.host)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-soc-surfaceHover transition-colors border-b border-transparent data-[expanded=true]:border-slate-800/80"
                  data-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      aria-label="Toggle Host Details"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Host State: UP" />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-cyan-300 tracking-wide">
                          {hostData.host}
                        </span>
                        {hostData.hostname && (
                          <span className="text-xs font-mono text-slate-400">
                            ({hostData.hostname})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        State: <strong className="text-emerald-400 uppercase">{hostData.state || 'UP'}</strong> &bull; Profile: {hostData.profile || 'standard'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-soc-panel border border-slate-700/60 text-slate-300">
                      {services.length} Exposed Ports
                    </span>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-slate-400">Host Risk:</span>
                      <Badge type="risk" value={h.analysis.level} />
                      <span className="text-slate-500 text-[11px]">({h.analysis.score} pts)</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Services Table */}
                {isExpanded && (
                  <div className="p-4 bg-soc-panel/60 border-t border-slate-800/80">
                    {services.length === 0 ? (
                      <div className="p-4 text-center text-xs font-mono text-slate-500">
                        No open ports detected on this host.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-800/80 text-slate-400 text-[10px] uppercase tracking-wider">
                              <th className="py-2 px-3">Port / Protocol</th>
                              <th className="py-2 px-3">Service</th>
                              <th className="py-2 px-3">Product Banner</th>
                              <th className="py-2 px-3">Detected Version</th>
                              <th className="py-2 px-3">Port State</th>
                              <th className="py-2 px-3">Heuristic Assessment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            {services.map((svc) => {
                              const finding = findingsMap.get(svc.port);
                              const riskLevel = finding?.level || 'INFO';
                              const riskScore = finding?.score ?? 1;

                              return (
                                <tr
                                  key={`${svc.protocol}-${svc.port}`}
                                  className="hover:bg-soc-surfaceHover/70 transition-colors"
                                >
                                  <td className="py-2.5 px-3">
                                    <span className="font-bold text-cyan-300">
                                      {svc.port}
                                    </span>
                                    <span className="text-slate-500 text-[11px]">
                                      /{svc.protocol}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                                    {svc.service || 'unknown'}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-300">
                                    {svc.product || '-'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {svc.version ? (
                                      <span className="px-1.5 py-0.5 rounded bg-soc-surface border border-slate-700 text-slate-200 text-[11px]">
                                        {svc.version}
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      {svc.state}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <Badge type="risk" value={riskLevel} />
                                      <span className="text-[11px] text-slate-400 font-bold">
                                        +{riskScore} pts
                                      </span>
                                    </div>
                                    {finding?.reason && (
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {finding.reason}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
