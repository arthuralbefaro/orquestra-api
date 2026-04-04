import api from './axios';
import type { PaginatedResponse, Project } from '../types';

export async function getProjects() {
  const {data} = await api.get<PaginatedResponse<Project>>('/projects');
  return data;
}

export async function updateProject(
  id: number,
  payload: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }
) {
  const {data} = await api.put<{message: string; data: Project}>(`/projects/${id}`, payload);
  return data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
  is_active?: boolean;
}) {
  const { data } = await api.post<{ message: string; data: Project }>('/projects', payload);
  return data;
}

export async function getProject(id: number) {
  const {data} = await api.get<{data: Project}>(`/projects/${id}`);
  return data;
}

export async function deleteProject(id: number) {
  const {data} = await api.delete<{message: string}>(`/projects/${id}`);
  return data;
}