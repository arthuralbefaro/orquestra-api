import api from './axios';
import type { PaginatedResponse, Run } from '../types';

export type GetRunsParams = {
  q?: string;
  status?: string;
  automation_id?: number;
  project_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export async function getRuns(params?: GetRunsParams) {
  const cleanParams = {
    ...params,
    status: params?.status && params.status !== 'all' ? params.status : undefined,
  };

  const { data } = await api.get<PaginatedResponse<Run>>('/runs', {
    params: cleanParams,
  });

  return data;
}

export async function retryRun(runId: number) {
  const { data } = await api.post<{ message: string; data: Run }>(
    `/runs/${runId}/retry`
  );
  return data;
}