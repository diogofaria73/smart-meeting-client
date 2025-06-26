// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 segundos
  UPLOAD_TIMEOUT: 120000, // 2 minutos para uploads
} as const;

// Verificar se a API está configurada corretamente
export const isApiConfigured = () => {
  return Boolean(API_CONFIG.BASE_URL);
};

// Log da configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    TIMEOUT: API_CONFIG.TIMEOUT,
    UPLOAD_TIMEOUT: API_CONFIG.UPLOAD_TIMEOUT,
  });
} 