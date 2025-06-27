import { api, uploadApi, apiCall, handleApiError } from './api';
import type { Transcription, TranscriptionProgress, ApiError } from '../types';

export class TranscriptionService {
  // Iniciar transcrição de uma reunião
  static async transcribeMeeting(
    meetingId: string,
    audioFile?: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      if (audioFile) {
        // Se há arquivo de áudio, fazer upload
        const formData = new FormData();
        formData.append('file', audioFile); // Changed from 'audio_file' to 'file'

        // meeting_id vai como query parameter, não no FormData
        await uploadApi.post(`/api/transcriptions/transcribe?meeting_id=${meetingId}`, formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              onProgress(progress);
            }
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Se não há arquivo, erro - arquivo é obrigatório para transcrição
        throw new Error('Arquivo de áudio é obrigatório para transcrição');
      }
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