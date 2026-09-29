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
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-soc-borderDark">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            NVD CVE INTELLIGENCE CORRELATION
          </h2>
          <Badge type="source" value="NIST NVD REST API v2.0" />
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {totalMatches} Advisory Matches
        </span>
      </div>

      {/* Mandatory Verification & Methodology Caveat */}
      <CaveatBanner
        type="cve"
        title="NVD Search Caveat & Version Applicability Methodology"
        message="A keyword match returned by the National Vulnerability Database (NVD) does not confirm that this target is vulnerable. Applicability is estimated by ShadowTrace through regex comparison between detected version strings and advisory prose. Always confirm manually."
      />

      {cveResults.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No services were eligible for NVD CVE correlation. (Requires product and version identification).
        </div>
      ) : (
        <div className="space-y-6">
          {cveResults.map((result, idx) => {
            const status = result.status;
            const queryName = result.query || 'Unidentified service';

            return (
              <div key={`${result.query}-${idx}`} className="rounded-lg border border-slate-800 bg-soc-surface p-4">
                {/* Service Query Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      QUERY KEYWORD
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {queryName}
                    </span>
                    {result.detected_version && (
                      <span className="ml-2 text-xs font-mono text-slate-400">
                        (Detected: <code className="text-slate-200">{result.detected_version}</code>)
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 uppercase">
                      Status: {status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Status-specific notices */}
                {status === 'lookup_unavailable' && (
                  <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">NVD Lookup Unavailable</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Unable to query NIST NVD API for &ldquo;{queryName}&rdquo;. Typically caused by rate-limiting (NVD allows 5 requests per 30s unauthenticated) or network connectivity constraints.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'insufficient_evidence' && (
                  <div className="p-3 rounded bg-slate-800/40 border border-slate-700 text-xs font-mono text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-200">Insufficient Evidence</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {result.reason || 'Software product banner was not identified during discovery. CVE correlation omitted to prevent false positives.'}
                      </p>
                    </div>
                  </div>
                )}

                {status === 'version_required' && (
                  <div className="p-3 rounded bg-slate-800/40 border border-slate-700 text-xs font-mono text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-200">Version Required</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Product identified ({queryName}), but concrete version could not be determined. Run a &ldquo;deep&rdquo; scan with version probing to enable correlation.
                      </p>
                    </div>
                  </div>
                )}

                {status === 'no_matches' && (
                  <div className="p-3 rounded bg-emerald-950/20 border border-emerald-900/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No known public CVE records matched this keyword query in NVD.</span>
                  </div>
                )}

                {/* Matches List */}
                {result.matches && result.matches.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {result.matches.map((cve) => {
                      const app = cve.applicability || { status: 'unknown', reason: 'No applicability data' };

                      return (
                        <div
                          key={cve.cve_id}
                          className="rounded-lg border border-slate-800/90 bg-soc-panel p-3.5 hover:border-slate-700 transition-colors text-xs font-mono"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/70">
                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 group"
                              >
                                {cve.cve_id}
                                <ExternalLink className="w-3 h-3 text-cyan-500 group-hover:text-cyan-300" />
                              </a>

                              {cve.cvss_score !== null && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                                  CVSS: <strong className="text-white">{cve.cvss_score}</strong>
                                </span>
                              )}

                              {cve.severity && (
                                <span className="text-[10px] text-slate-400 uppercase">
                                  Severity: <strong className="text-slate-200">{cve.severity}</strong>
                                </span>
                              )}
                            </div>

                            <div>
                              <Badge type="applicability" value={app.status} />
                            </div>
                          </div>

                          {/* Advisory Description */}
                          <p className="text-slate-300 text-xs leading-relaxed mb-3 line-clamp-3">
                            {cve.description || 'No description provided in advisory.'}
                          </p>

                          {/* Reasoning & Applicability Breakdown */}
                          <div className="p-2.5 rounded bg-soc-surface border border-slate-800/70 text-[11px] space-y-1">
                            <div>
                              <span className="text-slate-400">Applicability Reasoning: </span>
                              <span className="text-slate-200">{app.reason}</span>
                            </div>

                            {app.fixed_version && (
                              <div>
                                <span className="text-slate-400">Fixed Version: </span>
                                <span className="text-emerald-400 font-bold">{app.fixed_version}</span>
                              </div>
                            )}

                            <div>
                              <span className="text-slate-500">Source: {cve.source}</span>
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
