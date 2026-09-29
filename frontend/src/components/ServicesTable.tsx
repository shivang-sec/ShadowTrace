import React from 'react';
import { Server } from 'lucide-react';
import { HostAssessment } from '../types/report';
import { Badge } from './Badge';

interface ServicesTableProps {
  hostAssessment: HostAssessment;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({ hostAssessment }) => {
  const services = hostAssessment.host.services || [];
  const findingsMap = new Map(
    (hostAssessment.analysis.findings || []).map((f) => [f.port, f])
  );

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            DISCOVERED SERVICES
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {services.length} Exposed
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Host:</span>
          <span className="text-cyan-300 font-bold">{hostAssessment.host.host}</span>
          {hostAssessment.host.hostname && (
            <span className="text-slate-500">({hostAssessment.host.hostname})</span>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No exposed TCP services discovered on target host.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {services.map((svc) => {
                const finding = findingsMap.get(svc.port);
                const riskLevel = finding?.level || 'INFO';
                const riskScore = finding?.score ?? 1;

                return (
                  <tr key={`${svc.protocol}-${svc.port}`} className="hover:bg-soc-hover/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {svc.port}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-slate-400">
                      {svc.protocol}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {svc.service || 'unknown'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {svc.product || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {svc.version ? (
                        <span className="text-slate-200 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {svc.version}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {svc.state}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Badge type="risk" value={riskLevel} />
                        <span className="text-[11px] text-slate-400">
                          (+{riskScore} pts)
                        </span>
                      </div>
                      {finding?.reason && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
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
  );
};
