import React, { useState } from 'react';
import { Shield, History, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { ScanControls } from '../components/ScanControls';
import { ScanProgressBanner } from '../components/ScanProgressBanner';
import { AssessmentOverview } from '../components/AssessmentOverview';
import { ServicesTable } from '../components/ServicesTable';
import { BaselinePanel } from '../components/BaselinePanel';
import { IntelligencePanel } from '../components/IntelligencePanel';
import { CVEPanel } from '../components/CVEPanel';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { AssessmentHistory } from '../components/AssessmentHistory';
import { useHealth } from '../hooks/useHealth';
import { useReports } from '../hooks/useReports';
import { useScan } from '../hooks/useScan';

export const Dashboard: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  // Live health monitoring
  const { health, isLoading: isHealthLoading, refresh: refreshHealth } = useHealth();

  // Reports management
  const {
    reports,
    activeReport,
    isLoadingReport,
    isExporting,
    error: reportError,
    clearError: clearReportError,
    fetchReports,
    loadReport,
    deleteReport,
    exportCurrentReport,
  } = useReports();

  // Scan lifecycle management
  const {
    activeJob,
    isScanning,
    scanError,
    clearError: clearScanError,
    startScan,
  } = useScan(async (reportId) => {
    // When scan completes: refresh reports list and load the new report
    await fetchReports();
    await loadReport(reportId);
  });

  const primaryHost = activeReport?.hosts?.[0];

  return (
    <div className="min-h-screen bg-soc-bg text-soc-text font-sans">
      {/* Top Application Bar */}
      <Header
        health={health}
        isHealthLoading={isHealthLoading}
        onRefreshHealth={refreshHealth}
        onToggleHistory={() => setShowHistory(!showHistory)}
        historyCount={reports.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Scan Launcher Section */}
        <ScanControls
          onStartScan={startScan}
          isScanning={isScanning}
          scanStage={activeJob?.stage || null}
          errorMessage={scanError || reportError}
          onClearError={() => {
            clearScanError();
            clearReportError();
          }}
        />

        {/* Real-time Scan Progress Banner */}
        {activeJob && (isScanning || activeJob.status === 'failed') && (
          <ScanProgressBanner job={activeJob} />
        )}

        {/* Loading Report State */}
        {isLoadingReport && (
          <div className="rounded-xl border border-soc-border bg-soc-panel/60 p-12 text-center font-mono text-xs flex flex-col items-center justify-center gap-3 mb-6">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <p className="text-slate-300">Loading full assessment telemetry from backend...</p>
          </div>
        )}

        {/* Active Assessment View */}
        {activeReport && primaryHost && !isLoadingReport ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Overview & Scorecard */}
            <AssessmentOverview
              report={activeReport}
              onExport={exportCurrentReport}
              isExporting={isExporting}
            />

            {/* Discovered Services Table */}
            <ServicesTable hostAssessment={primaryHost} />

            {/* Security Baseline Findings */}
            <BaselinePanel baseline={primaryHost.baseline} />

            {/* ShadowTrace Intelligence Rules */}
            <IntelligencePanel findings={primaryHost.intelligence} />

            {/* NVD CVE Intelligence Correlation */}
            <CVEPanel cveResults={primaryHost.cve_intelligence} />

            {/* Remediation Recommendations */}
            <RecommendationsPanel recommendations={primaryHost.baseline.recommendations || []} />
          </div>
        ) : !isLoadingReport && !isScanning ? (
          /* Empty State: No active report */
          <div className="rounded-xl border border-dashed border-slate-800 bg-soc-panel/40 p-12 text-center font-mono">
            <div className="w-12 h-12 rounded-xl bg-soc-surface border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase mb-1">
              Ready for Network Exposure Assessment
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
              Enter an authorized target IP, hostname, or CIDR block above and launch an assessment, or select a previous report from history.
            </p>
            {reports.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-soc-surface hover:bg-soc-hover text-xs font-mono text-cyan-300 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>Open Previous Assessments ({reports.length})</span>
              </button>
            )}
          </div>
        ) : null}
      </main>

      {/* Assessment History Drawer */}
      {showHistory && (
        <AssessmentHistory
          reports={reports}
          selectedReportId={activeReport?.report_id}
          onSelectReport={async (id) => {
            await loadReport(id);
            setShowHistory(false);
          }}
          onDeleteReport={deleteReport}
          onRefresh={fetchReports}
          onClose={() => setShowHistory(false)}
          isLoading={false}
        />
      )}
    </div>
  );
};
