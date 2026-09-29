export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type BaselineSeverity = 'PASS' | 'INFO' | 'WARN' | 'HIGH';

export type ApplicabilityStatus = 'potentially_affected' | 'not_affected' | 'unknown';

export type CVELookupStatus =
  | 'matches_found'
  | 'no_matches'
  | 'lookup_unavailable'
  | 'version_required'
  | 'insufficient_evidence';

export interface ReportSummary {
  report_id: string;
  target: string;
  profile: string;
  timestamp: string;
  host_count: number;
  overall_risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  exposure_score: number;
}

export interface DiscoveredService {
  protocol: string;
  port: number;
  state: string;
  service: string;
  product: string;
  version: string;
}

export interface ServiceFinding {
  port: number;
  level: RiskLevel;
  score: number;
  reason: string;
  evidence: {
    service: string;
    product: string;
    version: string;
    state: string;
  };
}

export interface HostAnalysis {
  score: number;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  findings: ServiceFinding[];
}

export interface BaselineFinding {
  severity: BaselineSeverity;
  message: string;
  port?: number;
  service?: string;
}

export interface BaselineReport {
  findings: BaselineFinding[];
  recommendations: string[];
}

export interface IntelligenceFinding {
  id: string;
  severity: RiskLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  finding: string;
  evidence: {
    port: number;
    protocol: string;
    service: string;
    product: string;
    version: string;
    state: string;
  };
  recommendation: string;
}

export interface CVEApplicability {
  status: ApplicabilityStatus;
  reason: string;
  fixed_version?: string;
  affected_upper_bound?: string;
}

export interface CVEMatch {
  cve_id: string;
  severity: string | null;
  cvss_score: number | null;
  description: string;
  published?: string;
  last_modified?: string;
  source: string;
  applicability: CVEApplicability;
}

export interface CVEResult {
  query: string;
  detected_version: string;
  status: CVELookupStatus;
  matches: CVEMatch[];
  reason?: string;
  error?: string;
}

export interface DiscoveredHost {
  host: string;
  state: string;
  hostname: string;
  profile: string;
  services: DiscoveredService[];
}

export interface HostAssessment {
  host: DiscoveredHost;
  analysis: HostAnalysis;
  baseline: BaselineReport;
  intelligence: IntelligenceFinding[];
  cve_intelligence: CVEResult[];
}

export interface AssessmentReport {
  report_id?: string;
  tool: string;
  version: string;
  timestamp: string;
  target: string;
  profile: string;
  hosts: HostAssessment[];
}
