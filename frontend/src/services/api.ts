import { HealthStatus } from '../types/api';
import { ScanJob, ScanRequest } from '../types/scan';
import { AssessmentReport, ReportSummary } from '../types/report';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new ApiError(
      `Network connection failed: ${err instanceof Error ? err.message : 'Backend unreachable'}`,
      0
    );
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      // not JSON
    }
    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  async getHealth(): Promise<HealthStatus> {
    return request<HealthStatus>('/api/health');
  },

  async startScan(payload: ScanRequest): Promise<ScanJob> {
    return request<ScanJob>('/api/scans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getScanStatus(jobId: string): Promise<ScanJob> {
    return request<ScanJob>(`/api/scans/${jobId}`);
  },

  async listReports(): Promise<ReportSummary[]> {
    return request<ReportSummary[]>('/api/reports');
  },

  async getReport(reportId: string): Promise<AssessmentReport> {
    return request<AssessmentReport>(`/api/reports/${reportId}`);
  },

  async deleteReport(reportId: string): Promise<void> {
    await request<void>(`/api/reports/${reportId}`, {
      method: 'DELETE',
    });
  },

  getExportUrl(reportId: string): string {
    return `${API_BASE}/api/reports/${reportId}/export`;
  },

  async downloadReport(reportId: string, filename?: string): Promise<void> {
    const url = this.getExportUrl(reportId);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Export download failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `shadowtrace-${reportId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
