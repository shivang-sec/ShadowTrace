import { useState, useEffect, useCallback } from 'react';
import { AssessmentReport, ReportSummary } from '../types/report';
import { apiService } from '../services/api';

export function useReports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [activeReport, setActiveReport] = useState<AssessmentReport | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const list = await apiService.listReports();
      setReports(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const loadReport = useCallback(async (reportId: string) => {
    setIsLoadingReport(true);
    try {
      const report = await apiService.getReport(reportId);
      setActiveReport(report);
      setError(null);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load report ${reportId}`);
      return null;
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  const deleteReport = useCallback(
    async (reportId: string) => {
      try {
        await apiService.deleteReport(reportId);
        setReports((prev) => prev.filter((r) => r.report_id !== reportId));
        if (activeReport?.report_id === reportId) {
          setActiveReport(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to delete report ${reportId}`);
      }
    },
    [activeReport]
  );

  const exportCurrentReport = useCallback(async () => {
    if (!activeReport?.report_id) return;
    setIsExporting(true);
    try {
      await apiService.downloadReport(
        activeReport.report_id,
        `shadowtrace-${activeReport.target}-${activeReport.profile}.json`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [activeReport]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    activeReport,
    setActiveReport,
    isLoadingList,
    isLoadingReport,
    isExporting,
    error,
    clearError: () => setError(null),
    fetchReports,
    loadReport,
    deleteReport,
    exportCurrentReport,
  };
}
