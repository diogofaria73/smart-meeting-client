import { api, uploadApi, apiCall, handleApiError } from './api';
import type { Meeting, MeetingCreate, MeetingWithTranscriptions, PaginatedMeetingsResponse, ApiError, CreateMeetingData, DashboardStats } from '../types';
import type { AxiosProgressEvent } from 'axios';

export class MeetingService {
  // Buscar reuniões paginadas
  static async getMeetingsPaginated(page: number = 1, pageSize: number = 10): Promise<PaginatedMeetingsResponse> {
    try {
      return await apiCall(() =>
        api.get<PaginatedMeetingsResponse>(`/api/meetings/?page=${page}&page_size=${pageSize}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Buscar todas as reuniões com transcrições (sem paginação)
  static async getAllMeetingsWithTranscriptions(): Promise<MeetingWithTranscriptions[]> {
    try {
      return await apiCall(() =>
        api.get<MeetingWithTranscriptions[]>('/api/meetings/all')
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Criar nova reunião
  static async createMeeting(meetingData: MeetingCreate): Promise<Meeting> {
    try {
      const payload = {
        title: meetingData.title,
        description: meetingData.description || '',
        date: meetingData.date, // Enviar como ISO string, backend converte para datetime
        participants: meetingData.participants || [] // Enviar como array de strings (pode ser vazio)
      };

      console.log('📤 Sending meeting data:', payload);

      return await apiCall(() =>
        api.post<Meeting>('/api/meetings/', payload)
      );
    } catch (error) {
      console.error('❌ Create meeting error:', error);
      throw handleApiError(error);
    }
  }

  // Buscar reunião por ID
  static async getMeeting(meetingId: string): Promise<Meeting> {
    try {
      return await apiCall(() =>
        api.get<Meeting>(`/api/meetings/${meetingId}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Upload de arquivo de áudio para uma reunião
  static async uploadAudioFile(
    meetingId: string,
    audioFile: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);

      await uploadApi.post(`/api/meetings/${meetingId}/upload`, formData, {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Função auxiliar para formatar dados da reunião
  static formatMeetingForAPI(formData: {
    title: string;
    description: string;
    date: Date;
    participants: string[];
  }): MeetingCreate {
    return {
      title: formData.title,
      description: formData.description,
      date: formData.date.toISOString(),
      participants: formData.participants,
    };
  }

  // Função auxiliar para formatar reunião do backend para frontend
  static formatMeetingFromAPI(meeting: Meeting): Meeting & {
    participantsList: string[];
    formattedDate: Date;
  } {
    let participantsList: string[] = [];

    try {
      participantsList = typeof meeting.participants === 'string'
        ? JSON.parse(meeting.participants)
        : meeting.participants || [];
    } catch (error) {
      console.warn('Erro ao parsear participantes:', error);
      participantsList = [];
    }

    return {
      ...meeting,
      participantsList,
      formattedDate: new Date(meeting.date),
    };
  }

  // Função auxiliar para formatar reunião com transcrições do backend
  static formatMeetingWithTranscriptionsFromAPI(meeting: MeetingWithTranscriptions): MeetingWithTranscriptions & {
    formattedDate: Date;
    participantsList: string[];
    transcriptionsCount: number;
  } {
    return {
      ...meeting,
      formattedDate: new Date(meeting.date),
      participantsList: meeting.participants || [],
      transcriptionsCount: meeting.transcriptions.length,
    };
  }

  static async getDashboardStats(days: number = 30): Promise<DashboardStats> {
    try {
      return await apiCall(() =>
        api.get<DashboardStats>(`/api/meetings/stats?days=${days}`)
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default MeetingService; 