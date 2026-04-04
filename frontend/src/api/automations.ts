import api from './axios';
import type { Automation, PaginatedResponse, Run } from '../types';

export async function getAutomations(params?: {
  q?: string;
  status?: string;
  project_id?: number;
  page?: number;
  per_page?: number;
}) {
  const cleanParams = {
    ...params,
    status: params?.status && params.status !== 'all' ? params.status : undefined,
  };

  const { data } = await api.get<PaginatedResponse<Automation>>('/automations', {
    params: cleanParams,
  });

  return data;
}

export async function createAutomation(payload: {
  project_id: number;
  name: string;
  trigger_type: 'webhook' | 'schedule' | 'manual';
  status?: 'draft' | 'active' | 'paused';
  config: Record<string, unknown>;
}) {
  const { data } = await api.post<{ message: string; data: Automation }>(
    '/automations',
    payload
  );
  return data;
}

export async function getAutomation(id: number) {
  const { data } = await api.get<{ data: Automation }>(`/automations/${id}`);
  return data;
}

export async function updateAutomation(
  id: number,
  payload: {
    project_id?: number;
    name?: string;
    trigger_type?: 'webhook' | 'schedule' | 'manual';
    status?: 'draft' | 'active' | 'paused';
    config?: Record<string, unknown>;
  }
) {
  const { data } = await api.put<{ message: string; data: Automation }>(
    `/automations/${id}`,
    payload
  );
  return data;
}

export async function deleteAutomation(id: number) {
  const { data } = await api.delete<{ message: string }>(`/automations/${id}`);
  return data;
}

export async function runAutomation(id: number) {
  const { data } = await api.post<{ message: string; data: Run }>(
    `/automations/${id}/run`
  );
  return data;
}

export async function getAutomationRuns(
  id: number,
  params?: { status?: string; page?: number; per_page?: number }
) {
  const cleanParams = {
    ...params,
    status: params?.status && params.status !== 'all' ? params.status : undefined,
  };

  const { data } = await api.get<PaginatedResponse<Run>>(
    `/automations/${id}/runs`,
    {
      params: cleanParams,
    }
  );

  return data;
}