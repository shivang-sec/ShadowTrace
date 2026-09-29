import { useState, useRef, useCallback } from 'react';
import { ScanJob, ScanProfile } from '../types/scan';
import { apiService } from '../services/api';

export function useScan(onScanCompleted?: (reportId: string) => void) {
  const [activeJob, setActiveJob] = useState<ScanJob | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollJob = useCallback(
    async (jobId: string) => {
      try {
        const job = await apiService.getScanStatus(jobId);
        setActiveJob(job);

        if (job.status === 'completed') {
          setIsScanning(false);
          stopPolling();
          if (job.report_id && onScanCompleted) {
            onScanCompleted(job.report_id);
          }
        } else if (job.status === 'failed') {
          setIsScanning(false);
          stopPolling();
          setScanError(job.error || 'Scan process encountered an unhandled error.');
        } else {
          // Continue polling while queued or running
          pollTimerRef.current = window.setTimeout(() => pollJob(jobId), 1800);
        }
      } catch (err) {
        setIsScanning(false);
        stopPolling();
        setScanError(err instanceof Error ? err.message : 'Error polling scan status');
      }
    },
    [onScanCompleted, stopPolling]
  );

  const startScan = useCallback(
    async (target: string, profile: ScanProfile) => {
      setScanError(null);
      setIsScanning(true);
      stopPolling();

      try {
        const job = await apiService.startScan({ target, profile });
        setActiveJob(job);
        // Start polling immediately
        pollTimerRef.current = window.setTimeout(() => pollJob(job.job_id), 1200);
      } catch (err) {
        setIsScanning(false);
        setScanError(err instanceof Error ? err.message : 'Failed to initiate assessment');
      }
    },
    [pollJob, stopPolling]
  );

  return {
    activeJob,
    isScanning,
    scanError,
    clearError: () => setScanError(null),
    startScan,
  };
}
