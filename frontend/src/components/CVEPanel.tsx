import React from 'react';
import { Database, AlertTriangle, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { CVEResult } from '../types/report';
import { Badge } from './Badge';
import { CaveatBanner } from './CaveatBanner';

interface CVEPanelProps {
  cveResults: CVEResult[];
}

export const CVEPanel: React.FC<CVEPanelProps> = ({ cveResults }) => {
  const totalMatches = cveResults.reduce((acc, res) => acc + (res.matches?.length || 0), 0);

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            NVD CVE INTELLIGENCE CORRELATION
          </h2>
          <Badge type="source" value="NIST NVD REST API v2.0" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-soc-surface border border-slate-700 text-slate-300">
            {totalMatches} Correlated Advisory Match(es)
          </span>
        </div>
      </div>

      {/* Mandatory Methodology & Disclaimers */}
      <CaveatBanner
        type="cve"
        title="NVD Search Caveat & Version Applicability Methodology"
        message="A keyword search result returned by NIST NVD does not constitute a confirmed vulnerability. Applicability is estimated through ShadowTrace heuristics comparing detected software banners with version ranges described in advisory text. Manual triage and verification are essential before remediation."
      />

      {cveResults.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No exposed services were eligible for NVD correlation (concrete product name and version detection required).
        </div>
      ) : (
        <div className="space-y-5">
          {cveResults.map((result, idx) => {
            const status = result.status;
            const queryName = result.query || 'Unidentified service';

            return (
              <div
                key={`${result.query}-${idx}`}
                className="rounded-lg border border-soc-border bg-soc-surface p-4 transition-all"
              >
                {/* Service Query Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 bg-soc-panel px-1.5 py-0.5 rounded border border-slate-800">
                      QUERY KEYWORD
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {queryName}
                    </span>
                    {result.detected_version && (
                      <span className="text-xs font-mono text-slate-400">
                        (Detected: <code className="text-slate-200 bg-soc-panel px-1 py-0.5 rounded">{result.detected_version}</code>)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-panel border border-slate-700 text-slate-300 uppercase font-semibold">
                      STATUS: {status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Status-specific notices */}
                {status === 'lookup_unavailable' && (
                  <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-200">NVD Query Unavailable</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        NIST NVD lookup could not complete for &ldquo;{queryName}&rdquo;. Unauthenticated NVD requests are subject to strict rate limits (5 requests per 30 seconds), or the host encountered an outbound network timeout.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'insufficient_evidence' && (
                  <div className="p-3.5 rounded-lg bg-soc-panel border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-200">Insufficient Telemetry Evidence</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        {result.reason || 'Software product banner was not conclusively identified during discovery. CVE correlation omitted to avoid false positives.'}
                      </p>
                    </div>
                  </div>
                )}

                {status === 'version_required' && (
                  <div className="p-3.5 rounded-lg bg-soc-panel border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-200">Concrete Version Required</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        Product was observed ({queryName}), but concrete version numbers were absent from the banner. Select &ldquo;Deep&rdquo; scan to execute banner version fingerprinting.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'no_matches' && (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No matching public CVE advisories returned by NVD for &ldquo;{queryName}&rdquo;.</span>
                  </div>
                )}

                {/* Match Cards */}
                {result.matches && result.matches.length > 0 && (
                  <div className="space-y-3.5 mt-3">
                    {result.matches.map((cve) => {
                      const app = cve.applicability || { status: 'unknown', reason: 'No applicability assessment' };

                      return (
                        <div
                          key={cve.cve_id}
                          className="rounded-lg border border-slate-800 bg-soc-panel p-4 hover:border-slate-700 transition-all font-mono text-xs"
                        >
                          {/* Card Header: CVE ID, CVSS, Severity, Applicability */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-800/80">
                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 group"
                                title="Inspect on NIST National Vulnerability Database"
                              >
                                {cve.cve_id}
                                <ExternalLink className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-300" />
                              </a>

                              {cve.cvss_score !== null && (
                                <Badge type="cvss" value={cve.cvss_score} />
                              )}

                              {cve.severity && (
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                  Severity: <strong className="text-slate-200">{cve.severity}</strong>
                                </span>
                              )}
                            </div>

                            <div>
                              <Badge type="applicability" value={app.status} />
                            </div>
                          </div>

                          {/* Advisory Narrative */}
                          <p className="text-slate-300 text-xs leading-relaxed mb-3 font-sans line-clamp-3">
                            {cve.description || 'No description provided in advisory record.'}
                          </p>

                          {/* Evidence & Applicability Analysis Box */}
                          <div className="p-3 rounded-lg bg-soc-surface border border-slate-800/80 text-[11px] space-y-1.5">
                            <div className="flex items-start gap-2">
                              <span className="text-slate-500 shrink-0">Applicability Analysis:</span>
                              <span className="text-slate-200">{app.reason}</span>
                            </div>

                            {app.fixed_version && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">Fixed / Upgrade Version:</span>
                                <strong className="text-emerald-400 font-mono">{app.fixed_version}</strong>
                              </div>
                            )}

                            {app.affected_upper_bound && (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">Affected Upper Bound:</span>
                                <strong className="text-amber-400 font-mono">{app.affected_upper_bound}</strong>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                              <span>Source: {cve.source}</span>
                              <span className="text-slate-600">Manual verification required</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
