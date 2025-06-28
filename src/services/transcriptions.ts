import { api, uploadApi, apiCall, handleApiError } from './api';
import type { Transcription, TranscriptionProgress, ApiError } from '../types';

export class TranscriptionService {
  // 🚀 NOVO: Iniciar transcrição ASSÍNCRONA de uma reunião
  static async transcribeMeetingAsync(
    meetingId: string,
    audioFile: File,
    enableDiarization: boolean = true,
    onProgress?: (progress: number) => void
  ): Promise<{
    task_id: string;
    meeting_id: number;
    status: string;
    filename: string;
    websocket_url: string;
    status_url: string;
    result_url: string;
    message: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const params = new URLSearchParams({
        meeting_id: meetingId,
        enable_diarization: enableDiarization.toString()
      });

      const response = await uploadApi.post(
        `/api/transcriptions/transcribe?${params.toString()}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              onProgress(progress);
            }
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao iniciar transcrição assíncrona:', error);
      throw handleApiError(error);
    }
  }

  // 📊 Consultar status de uma tarefa de transcrição
  static async getTranscriptionTaskStatus(taskId: string): Promise<{
    task_id: string;
    status: string;
    progress: {
      percentage: number;
      current_step: string;
      message: string;
      details?: string;
      estimated_remaining_seconds?: number;
    };
    meeting_id: number;
    timestamps: {
      started_at: string;
      updated_at: string;
    };
    error?: string;
    is_running: boolean;
  }> {
    try {
      return await apiCall(() =>
        api.get(`/api/transcriptions/status/${taskId}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 🛑 Cancelar tarefa de transcrição
  static async cancelTranscriptionTask(taskId: string): Promise<{
    message: string;
    task_id: string;
    cancelled: boolean;
  }> {
    try {
      return await apiCall(() =>
        api.delete(`/api/transcriptions/cancel/${taskId}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // 📋 Listar tarefas ativas
  static async getActiveTranscriptionTasks(): Promise<{
    total_active_tasks: number;
    tasks: Record<string, any>;
  }> {
    try {
      return await apiCall(() =>
        api.get('/api/transcriptions/tasks/active')
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ⚠️ DEPRECATED: Método síncrono (mantido para compatibilidade)
  static async transcribeMeeting(
    meetingId: string,
    audioFile?: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    console.warn('⚠️ transcribeMeeting() está deprecated. Use transcribeMeetingAsync() com WebSocket para melhor experiência');

    if (!audioFile) {
      throw new Error('Arquivo de áudio é obrigatório para transcrição');
    }

    try {
      // Inicia transcrição assíncrona
      const taskResult = await this.transcribeMeetingAsync(meetingId, audioFile, true, onProgress);

      // Polling para aguardar conclusão (não recomendado para produção)
      let attempts = 0;
      const maxAttempts = 60; // 5 minutos máximo

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Aguarda 5 segundos

        try {
          const status = await this.getTranscriptionTaskStatus(taskResult.task_id);

          if (status.status === 'completed') {
            return; // Transcrição concluída
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Falha na transcrição');
          }

          attempts++;
        } catch (error) {
          attempts++;
        }
      }

      throw new Error('Timeout: Transcrição não foi concluída em tempo hábil');
    } catch (error) {
      console.error('Erro ao transcrever reunião:', error);
      throw handleApiError(error);
    }
  }

  // Buscar transcrição de uma reunião
  static async getTranscription(meetingId: string): Promise<Transcription> {
    try {
      return await apiCall(() =>
        api.get<Transcription>(`/api/transcriptions/${meetingId}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Gerar resumo inteligente de uma reunião
  static async generateSummary(meetingId: string): Promise<Transcription> {
    try {
      return await apiCall(() =>
        api.post<Transcription>(`/api/transcriptions/summary/${meetingId}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Função auxiliar para formatar transcrição
  static formatTranscriptionContent(transcription: Transcription): {
    formattedContent: string;
    speakerSummary: { [speakerId: string]: { totalTime: number; segments: number } };
    totalDuration: number;
  } {
    let formattedContent = '';
    const speakerSummary: { [speakerId: string]: { totalTime: number; segments: number } } = {};
    let totalDuration = 0;

    transcription.speakers.forEach((speaker) => {
      const speakerId = speaker.speaker_id;
      let speakerTime = 0;
      let segmentCount = 0;

      speaker.segments.forEach((segment) => {
        const duration = segment.end - segment.start;
        speakerTime += duration;
        segmentCount++;
        totalDuration = Math.max(totalDuration, segment.end);

        // Formatar timestamp para exibição
        const startTime = this.formatTime(segment.start);
        const endTime = this.formatTime(segment.end);

        formattedContent += `[${startTime} - ${endTime}] ${speakerId}: ${segment.text}\n`;
      });

      speakerSummary[speakerId] = {
        totalTime: speakerTime,
        segments: segmentCount
      };
    });

    return {
      formattedContent,
      speakerSummary,
      totalDuration
    };
  }

  // Função auxiliar para formatar tempo
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Função para verificar status da transcrição
  static async checkTranscriptionStatus(meetingId: string): Promise<TranscriptionProgress> {
    try {
      // Como não temos um endpoint específico para status, vamos usar o endpoint de busca
      // e derivar o status baseado na resposta
      const transcription = await this.getTranscription(meetingId);

      return {
        meeting_id: meetingId,
        status: 'completed',
        progress: 100,
        message: 'Transcrição concluída'
      };
    } catch (error: any) {
      // Se não encontrar a transcrição, pode estar em processamento
      if (error.status_code === 404) {
        return {
          meeting_id: meetingId,
          status: 'processing',
          progress: 50,
          message: 'Processando transcrição...'
        };
      }

      return {
        meeting_id: meetingId,
        status: 'failed',
        progress: 0,
        message: 'Erro na transcrição'
      };
    }
  }
}

export default TranscriptionService; 