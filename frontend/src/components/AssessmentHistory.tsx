import React from 'react';
import { History, RefreshCw, Trash2, ArrowRight, X } from 'lucide-react';
import { ReportSummary } from '../types/report';
import { Badge } from './Badge';

interface AssessmentHistoryProps {
  reports: ReportSummary[];
  selectedReportId?: string;
  onSelectReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onDeleteReport,
  onRefresh,
  onClose,
  isLoading,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-mono">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-soc-panel border-l border-soc-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-soc-borderDark bg-soc-surface flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-soc-panel border border-cyan-500/30 text-cyan-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  ASSESSMENT ARCHIVE
                </h3>
                <span className="text-[10px] text-slate-400">
                  {reports.length} Telemetry Records Stored
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 rounded-lg border border-slate-700 bg-soc-panel hover:bg-soc-surface text-slate-400 hover:text-cyan-300 transition-colors"
                title="Refresh Records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-700 bg-soc-panel hover:bg-soc-surface text-slate-400 hover:text-slate-200 transition-colors"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300 uppercase">Archive Empty</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Completed security assessments will be automatically recorded here.
                </p>
              </div>
            ) : (
              reports.map((rep) => {
                const isSelected = rep.report_id === selectedReportId;

                return (
                  <div
                    key={rep.report_id}
                    onClick={() => onSelectReport(rep.report_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-cyan-500/70 bg-cyan-950/20 shadow-glow'
                        : 'border-soc-border bg-soc-surface hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row: Target & Risk */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-cyan-300 tracking-wide">
                            {rep.target}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 uppercase">
                          Profile: <strong className="text-slate-200">{rep.profile}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge type="risk" value={rep.overall_risk} />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete archived assessment for ${rep.target}?`)) {
                              onDeleteReport(rep.report_id);
                            }
                          }}
                          className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded hover:bg-soc-panel"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Meta Row: Score, Assets, Date */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800/80 pt-2.5 text-slate-400">
                      <div>
                        <span>Score: </span>
                        <strong className="text-slate-100 font-bold">{rep.exposure_score}</strong>
                        <span className="text-slate-500">/100</span>
                      </div>
                      <div className="text-right">
                        <span>Hosts: </span>
                        <strong className="text-slate-200">{rep.host_count}</strong>
                      </div>
                      <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{new Date(rep.timestamp).toLocaleString()}</span>
                        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Load <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
