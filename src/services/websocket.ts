/**
 * 🔔 SERVIÇO DE WEBSOCKET PARA NOTIFICAÇÕES EM TEMPO REAL
 * Conecta com a API para receber atualizações de progresso e conclusão de transcrições
 */

export interface WebSocketNotification {
  event_type: string;
  meeting_id?: number;
  task_id?: string;
  timestamp: string;
  message?: string;

  // Dados específicos por tipo de evento
  filename?: string;
  transcription_id?: number;
  speakers_count?: number;
  error?: string;
  progress?: {
    status: string;
    step: string;
    progress_percentage: number;
    message: string;
    details?: string;
    estimated_remaining_seconds?: number;
  };
  analysis?: {
    transcription_id: number;
    summary_length: number;
    topics_count: number;
    has_analysis: boolean;
  };
}

export type NotificationCallback = (notification: WebSocketNotification) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo inicial
  private callbacks: NotificationCallback[] = [];

  constructor(private baseUrl: string = 'ws://localhost:8000/api') { }

  /**
   * 🔌 Conecta ao WebSocket de uma reunião específica
   */
  connectToMeeting(meetingId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl}/ws/meeting/${meetingId}`;
        console.log(`🔌 Conectando ao WebSocket: ${wsUrl}`);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (event) => {
          console.log(`✅ WebSocket conectado à reunião ${meetingId}`);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const notification: WebSocketNotification = JSON.parse(event.data);
            console.log('📢 Notificação recebida:', notification);

            // Chama todos os callbacks
            this.callbacks.forEach(callback => {
              try {
                callback(notification);
              } catch (error) {
                console.error('❌ Erro no callback de notificação:', error);
              }
            });
          } catch (error) {
            console.error('❌ Erro ao processar notificação:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`🔌 WebSocket desconectado (código: ${event.code})`);
          this.handleReconnect(meetingId);
        };

        this.ws.onerror = (error) => {
          console.error('❌ Erro no WebSocket:', error);
          reject(new Error('Falha na conexão WebSocket'));
        };

      } catch (error) {
        console.error('❌ Erro ao criar WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * 🔌 Conecta ao WebSocket global
   */
  connectGlobal(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl}/ws/global`;
        console.log(`🌐 Conectando ao WebSocket global: ${wsUrl}`);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket global conectado');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const notification: WebSocketNotification = JSON.parse(event.data);
            console.log('🌐 Notificação global recebida:', notification);

            this.callbacks.forEach(callback => {
              try {
                callback(notification);
              } catch (error) {
                console.error('❌ Erro no callback global:', error);
              }
            });
          } catch (error) {
            console.error('❌ Erro ao processar notificação global:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`🌐 WebSocket global desconectado (código: ${event.code})`);
        };

        this.ws.onerror = (error) => {
          console.error('❌ Erro no WebSocket global:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🔄 Tenta reconectar automaticamente
   */
  private handleReconnect(meetingId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);

      setTimeout(() => {
        this.connectToMeeting(meetingId).catch(error => {
          console.error(`❌ Falha na reconexão ${this.reconnectAttempts}:`, error);
        });
      }, delay);
    } else {
      console.error('❌ Máximo de tentativas de reconexão atingido');
    }
  }

  /**
   * 📞 Adiciona callback para receber notificações
   */
  onNotification(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);

    // Retorna função para remover o callback
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 💓 Envia ping para manter conexão viva
   */
  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
    }
  }

  /**
   * 🔌 Desconecta WebSocket
   */
  disconnect() {
    if (this.ws) {
      console.log('🔌 Desconectando WebSocket...');
      this.ws.close();
      this.ws = null;
    }
    this.callbacks = [];
    this.reconnectAttempts = 0;
  }

  /**
   * 📊 Retorna status da conexão
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 📊 Retorna estado da conexão
   */
  get connectionState(): string {
    if (!this.ws) return 'DISCONNECTED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// 🚀 Hook React para usar WebSocket
export function useWebSocketNotifications(meetingId?: number) {
  const [wsService] = useState(() => new WebSocketService());
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);

  useEffect(() => {
    if (meetingId) {
      // Conecta ao WebSocket da reunião
      wsService.connectToMeeting(meetingId)
        .then(() => setIsConnected(true))
        .catch(error => {
          console.error('❌ Erro ao conectar WebSocket:', error);
          setIsConnected(false);
        });

      // Adiciona callback para notificações
      const removeCallback = wsService.onNotification((notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      return () => {
        removeCallback();
        wsService.disconnect();
        setIsConnected(false);
      };
    }
  }, [meetingId, wsService]);

  // Mantém conexão viva
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        wsService.ping();
      }, 30000); // Ping a cada 30 segundos

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, wsService]);

  return {
    isConnected,
    notifications,
    wsService,
    clearNotifications: () => setNotifications([])
  };
}

import { useState, useEffect } from 'react'; 