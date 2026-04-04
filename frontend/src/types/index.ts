export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: number;
  project_id: number;
  name: string;
  trigger_type: 'webhook' | 'schedule' | 'manual';
  status: 'draft' | 'active' | 'paused';
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  project?: Project;
  runs?: Run[];
  runs_count?: number;
}

export type RunStatus = 'queued' | 'running' | 'success' | 'failed';

export interface Run {
  id: number;
  automation_id: number;
  status: RunStatus;
  started_at: string | null;
  finished_at: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  automation?: Automation;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface TopAutomationMetric {
  id: number;
  name: string;
  status: Automation['status'];
  trigger_type: Automation['trigger_type'];
  runs_count: number;
  project: { id: number; name: string } | null;
}

export interface DashboardMetrics {
  totals: {
    projects: number;
    automations: number;
    runs: number;
  };
  run_stats: {
    queued: number;
    running: number;
    success: number;
    failed: number;
    success_rate: number;
    failure_rate: number;
  };
  top_automations: TopAutomationMetric[];
  latest_runs: Run[];
}