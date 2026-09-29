import React from 'react';
import { History, RefreshCw, Trash2, X } from 'lucide-react';
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
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-soc-panel border-l border-soc-border shadow-2xl z-50 flex flex-col font-mono text-xs animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-soc-borderDark bg-soc-surface">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold uppercase tracking-wider text-slate-200">
            ASSESSMENT ARCHIVE
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {reports.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No saved assessments found. Execute a scan to populate reports.
          </div>
        ) : (
          reports.map((rep) => {
            const isSelected = rep.report_id === selectedReportId;
            return (
              <div
                key={rep.report_id}
                onClick={() => onSelectReport(rep.report_id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/60 bg-cyan-950/20 shadow-glow'
                    : 'border-slate-800 bg-soc-surface hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-bold text-cyan-300 block">
                      {rep.target}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase">
                      Profile: {rep.profile} &bull; {rep.host_count} host(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge type="risk" value={rep.overall_risk} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete report for ${rep.target}?`)) {
                          onDeleteReport(rep.report_id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>Score: <strong className="text-slate-200">{rep.exposure_score}/100</strong></span>
                  <span>{new Date(rep.timestamp).toLocaleDateString()} {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
