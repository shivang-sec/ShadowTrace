export type ScanProfile = 'quick' | 'standard' | 'deep';

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ScanRequest {
  target: string;
  profile: ScanProfile;
}

export interface ScanJob {
  job_id: string;
  status: ScanStatus;
  stage: 'discovery' | 'analysis' | 'complete' | null;
  target: string;
  profile: ScanProfile;
  created_at: string;
  completed_at: string | null;
  report_id: string | null;
  error: string | null;
}
