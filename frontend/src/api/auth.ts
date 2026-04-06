import api from './axios'
import type { User } from '../types';

interface AuthResponse {
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export async function login(payload: {
    email: string;
    password: string;
    device_name?: string;
}) {
    const {data} = await api.post<AuthResponse>('/login', payload);
    return data;
}

export async function register(payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    device_name?: string;
}) {
    const {data} = await api.post<AuthResponse>('/register', payload);
    return data;
}

export async function me() {
    const {data} = await api.get<{ data: User }>('/me');
    return data.data;
}

export async function logout() {
    const {data} = await api.post('/logout');
    return data;
}