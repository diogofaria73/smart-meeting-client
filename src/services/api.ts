import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosProgressEvent } from 'axios';
import type { ApiResponse, ApiError } from '../types';
import { API_CONFIG } from '../config/api';

// Criar instância do axios
export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    const apiError: ApiError = {
      message: error.message || 'Erro desconhecido',
      status_code: error.response?.status || 500,
      details: error.response?.data,
    };

    // Log detalhado do erro
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error Request:', error.request);
      console.error('No response received from server');
    }

    return Promise.reject(apiError);
  }
);

// Instância especial para upload de arquivos
export const uploadApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.UPLOAD_TIMEOUT,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Adicionar interceptors para upload também
uploadApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`📤 Upload Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => {
    console.error('❌ Upload Request Error:', error);
    return Promise.reject(error);
  }
);

uploadApi.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ Upload Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Upload Response Error:', error);
    return Promise.reject(handleApiError(error));
  }
);

// Wrapper para chamadas da API
export const apiCall = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Função auxiliar para tratar erros de forma consistente
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'Erro na comunicação com o servidor',
      status_code: error.response?.status || 500,
      details: error.response?.data,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    status_code: 500,
  };
};

// Tipo para callback de progresso
export type ProgressCallback = (progressEvent: AxiosProgressEvent) => void;

export default api; 