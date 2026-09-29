export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export interface ApiError {
  detail: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}
