import React, { useState } from 'react';
import { Shield, History, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-soc-bg text-soc-text font-sans antialiased">
      {/* Top Application Bar */}
      <Header
        health={health}
        isHealthLoading={isHealthLoading}
        onRefreshHealth={refreshHealth}
        onToggleHistory={() => setShowHistory(true)}
        historyCount={reports.length}
        isScanning={isScanning}
      />

      {/* Main Operational Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Assessment Launcher Section */}
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

        {/* Loading Report Telemetry State */}
        {isLoadingReport && (
          <div className="rounded-xl border border-soc-border bg-soc-panel/80 p-12 text-center font-mono text-xs flex flex-col items-center justify-center gap-3 mb-6 shadow-soc">
            <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
            <p className="text-slate-200 font-bold uppercase tracking-wider">
              Ingesting Assessment Telemetry...
            </p>
            <p className="text-slate-500 text-[11px]">
              Querying backend report cache and compiling security scorecard
            </p>
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

            {/* Discovered Assets & Services Explorer */}
            <ServicesTable hosts={activeReport.hosts} />

            {/* Security Baseline Findings */}
            <BaselinePanel baseline={primaryHost.baseline} />

            {/* ShadowTrace Vulnerability Intelligence */}
            <IntelligencePanel findings={primaryHost.intelligence} />

            {/* NVD CVE Intelligence Correlation */}
            <CVEPanel cveResults={primaryHost.cve_intelligence} />

            {/* Remediation Action Roadmap */}
            <RecommendationsPanel recommendations={primaryHost.baseline.recommendations || []} />
          </div>
        ) : !isLoadingReport && !isScanning ? (
          /* Empty / Standby State */
          <div className="rounded-xl border border-soc-border bg-soc-panel/60 p-10 text-center font-mono shadow-soc">
            <div className="w-14 h-14 rounded-2xl bg-soc-surface border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-4 shadow-glowSm">
              <Shield className="w-7 h-7 stroke-[1.8]" />
            </div>

            <h3 className="text-sm font-bold tracking-widest text-slate-100 uppercase mb-2">
              Ready for Network Exposure Assessment
            </h3>

            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed font-sans">
              Enter an authorized target IP, hostname, or network range in the control panel above to initiate discovery, heuristic rule evaluation, and NVD advisory correlation.
            </p>

            {reports.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 bg-soc-surface hover:bg-soc-surfaceHover text-xs font-mono text-cyan-300 font-semibold transition-all shadow-sm hover:shadow-glowSm"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Browse Stored Assessments ({reports.length})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-cyan-400" />
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
