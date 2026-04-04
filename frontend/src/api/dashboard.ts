import api from './axios';
import type { DashboardMetrics } from '../types';

export async function getDashboardMetrics() {
  const { data } = await api.get<{ data: DashboardMetrics }>('/dashboard/metrics');
  return data;
}
