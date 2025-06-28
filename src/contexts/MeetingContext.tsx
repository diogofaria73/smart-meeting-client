import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Meeting, Transcription, MeetingCreate, CreateMeetingForm, MeetingWithTranscriptions, PaginatedMeetingsResponse, DashboardStats } from '@/types';
import { MeetingService } from '@/services/meetings';
import { TranscriptionService } from '@/services/transcriptions';

interface MeetingState {
  meetings: MeetingWithTranscriptions[];
  paginatedMeetings: PaginatedMeetingsResponse | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

type MeetingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEETINGS'; payload: MeetingWithTranscriptions[] }
  | { type: 'SET_PAGINATED_MEETINGS'; payload: PaginatedMeetingsResponse }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'ADD_MEETING'; payload: MeetingWithTranscriptions }
  | { type: 'UPDATE_MEETING'; payload: MeetingWithTranscriptions }
  | { type: 'DELETE_MEETING'; payload: number };

const initialState: MeetingState = {
  meetings: [],
  paginatedMeetings: null,
  dashboardStats: null,
  loading: false,
  error: null,
};

function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload, loading: false, error: null };
    case 'SET_PAGINATED_MEETINGS':
      return { ...state, paginatedMeetings: action.payload, loading: false, error: null };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload, loading: false, error: null };
    case 'ADD_MEETING':
      return {
        ...state,
        meetings: [action.payload, ...state.meetings],
        loading: false,
        error: null
      };
    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map(meeting =>
          meeting.id === action.payload.id ? action.payload : meeting
        ),
        loading: false,
        error: null
      };
    case 'DELETE_MEETING':
      return {
        ...state,
        meetings: state.meetings.filter(meeting => meeting.id !== action.payload),
        loading: false,
        error: null
      };
    default:
      return state;
  }
}

interface MeetingContextType {
  state: MeetingState;
  loadMeetings: () => Promise<void>;
  loadMeetingsPaginated: (page: number, pageSize: number) => Promise<void>;
  loadDashboardStats: (days?: number) => Promise<void>;
  createMeeting: (formData: { title: string; description?: string; participants: string[] }) => Promise<MeetingWithTranscriptions>;
  uploadAudioToMeeting: (meetingId: string, audioFile: File, onProgress?: (progress: number) => void) => Promise<void>;
  uploadAudioToExistingMeeting: (meetingId: string, audioFile: File, onProgress?: (progress: number) => void) => Promise<void>;
  addMeeting: (meeting: MeetingWithTranscriptions) => void;
  updateMeeting: (meeting: MeetingWithTranscriptions) => void;
  deleteMeeting: (meetingId: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};

interface MeetingProviderProps {
  children: ReactNode;
}

export const MeetingProvider: React.FC<MeetingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  const loadMeetings = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const meetings = await MeetingService.getAllMeetingsWithTranscriptions();
      dispatch({ type: 'SET_MEETINGS', payload: meetings });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar reuniões';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadMeetingsPaginated = useCallback(async (page: number = 1, pageSize: number = 10): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const paginatedMeetings = await MeetingService.getMeetingsPaginated(page, pageSize);
      dispatch({ type: 'SET_PAGINATED_MEETINGS', payload: paginatedMeetings });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar reuniões paginadas';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadDashboardStats = useCallback(async (days: number = 30): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const stats = await MeetingService.getDashboardStats(days);
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar estatísticas';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addMeeting = useCallback((meeting: MeetingWithTranscriptions) => {
    dispatch({ type: 'ADD_MEETING', payload: meeting });
  }, []);

  const updateMeeting = useCallback((meeting: MeetingWithTranscriptions) => {
    dispatch({ type: 'UPDATE_MEETING', payload: meeting });
  }, []);

  const deleteMeeting = useCallback((meetingId: number) => {
    dispatch({ type: 'DELETE_MEETING', payload: meetingId });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const createMeeting = useCallback(async (formData: {
    title: string;
    description?: string;
    participants: string[];
  }): Promise<MeetingWithTranscriptions> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Criar a reunião básica
      const meetingData: MeetingCreate = {
        title: formData.title,
        description: formData.description || '',
        date: new Date().toISOString(),
        participants: formData.participants,
      };

      const createdMeeting = await MeetingService.createMeeting(meetingData);

      // Criar um objeto compatível MeetingWithTranscriptions
      const newMeeting: MeetingWithTranscriptions = {
        id: parseInt(createdMeeting.id),
        title: createdMeeting.title,
        description: createdMeeting.description,
        date: createdMeeting.date,
        participants: createdMeeting.participants,
        created_at: createdMeeting.created_at,
        updated_at: createdMeeting.updated_at,
        has_transcription: false,
        has_summary: false,
        transcriptions: []
      };

      dispatch({ type: 'ADD_MEETING', payload: newMeeting });
      return newMeeting;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar reunião';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const uploadAudioToMeeting = useCallback(async (
    meetingId: string,
    audioFile: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Usar o novo método assíncrono sem polling - o WebSocket cuidará do progresso
      await TranscriptionService.transcribeMeetingAsync(meetingId, audioFile, true, onProgress);

      // Após o upload, atualizar a lista de reuniões para refletir as mudanças
      const updatedMeetings = await MeetingService.getAllMeetingsWithTranscriptions();
      dispatch({ type: 'SET_MEETINGS', payload: updatedMeetings });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer upload do áudio';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const uploadAudioToExistingMeeting = useCallback(async (
    meetingId: string,
    audioFile: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Usar o novo método assíncrono sem polling - o WebSocket cuidará do progresso  
      await TranscriptionService.transcribeMeetingAsync(meetingId, audioFile, true, onProgress);

      // Após o upload, recarregar as reuniões para obter o status atualizado
      await loadMeetings();
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer upload do áudio';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadMeetings]);

  const value: MeetingContextType = {
    state,
    loadMeetings,
    loadMeetingsPaginated,
    loadDashboardStats,
    createMeeting,
    uploadAudioToMeeting,
    uploadAudioToExistingMeeting,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    setError,
    setLoading,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeetingContext deve ser usado dentro de um MeetingProvider');
  }
  return context;
}; 