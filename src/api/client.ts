import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import CONFIG from '@/configs/config';

let currentAuthToken: string | null = null;

/**
 * Configure the global bearer token used for API requests.
 */
export const setAuthToken = (token: string | null) => {
  currentAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
};

/**
 * Get the current bearer token.
 */
export const getAuthToken = (): string | null => {
  if (currentAuthToken) return currentAuthToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// 2026-11-06: wspólna fabryka klientów - `apiClient` dla /v1/wf,
// `eduClient` dla /v1/edu. Oba dostają nagłówek Authorization z tokenu
// ustawionego przez layout aplikacji (src/layouts/app/AppLayout.tsx ->
// setAuthToken), więc wywołania API nie przekazują już tokenu jawnie.
const createClient = (url: string | undefined, fallback: string): AxiosInstance => {
  const client = axios.create({
    // Base URL normalization: remove trailing slash if needed
    baseURL: (url || fallback).replace(/\/+$/, ''),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  return client;
};

export const apiClient: AxiosInstance = createClient(CONFIG?.api_url, '/v1/wf');
export const eduClient: AxiosInstance = createClient(CONFIG?.edu_api_url, '/v1/edu');
// 2026-11-10: kalendarz (agregator terminów w hubie).
export const kalendarzClient: AxiosInstance = createClient(CONFIG?.kalendarz_api_url, '/v1/kalendarz');

export interface ApiErrorMessage {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{
      detail?: string | Array<{ msg?: string; loc?: string[] }>;
    }>;
    const data = axiosErr.response?.data;
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      }
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Wystąpił nieznany błąd podczas komunikacji z serwerem.';
};
