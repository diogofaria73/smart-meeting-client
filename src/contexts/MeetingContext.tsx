import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Meeting, Transcription, MeetingCreate, CreateMeetingForm, MeetingWithTranscriptions, PaginatedMeetingsResponse } from '@/types';
import { MeetingService } from '@/services/meetings';
import { TranscriptionService } from '@/services/transcriptions';

interface MeetingState {
  meetings: Meeting[];
  meetingsWithTranscriptions: MeetingWithTranscriptions[];
  paginatedMeetings: PaginatedMeetingsResponse | null;
  currentMeeting: Meeting | null;
  transcriptions: { [meetingId: string]: Transcription };
  loading: boolean;
  error: string | null;
}

type MeetingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEETINGS'; payload: Meeting[] }
  | { type: 'SET_MEETINGS_WITH_TRANSCRIPTIONS'; payload: MeetingWithTranscriptions[] }
  | { type: 'SET_PAGINATED_MEETINGS'; payload: PaginatedMeetingsResponse }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'UPDATE_MEETING'; payload: Meeting }
  | { type: 'DELETE_MEETING'; payload: string }
  | { type: 'SET_CURRENT_MEETING'; payload: Meeting | null }
  | { type: 'SET_TRANSCRIPTION'; payload: { meetingId: string; transcription: Transcription } };

const initialState: MeetingState = {
  meetings: [],
  meetingsWithTranscriptions: [],
  paginatedMeetings: null,
  currentMeeting: null,
  transcriptions: {},
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
      return { ...state, meetings: action.payload };
    case 'SET_MEETINGS_WITH_TRANSCRIPTIONS':
      return { ...state, meetingsWithTranscriptions: action.payload };
    case 'SET_PAGINATED_MEETINGS':
      return { ...state, paginatedMeetings: action.payload };
    case 'ADD_MEETING':
      return { ...state, meetings: [...state.meetings, action.payload] };
    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map(meeting =>
          meeting.id === action.payload.id ? action.payload : meeting
        ),
        currentMeeting: state.currentMeeting?.id === action.payload.id
          ? action.payload
          : state.currentMeeting,
      };
    case 'DELETE_MEETING':
      return {
        ...state,
        meetings: state.meetings.filter(meeting => meeting.id !== action.payload),
        currentMeeting: state.currentMeeting?.id === action.payload
          ? null
          : state.currentMeeting,
      };
    case 'SET_CURRENT_MEETING':
      return { ...state, currentMeeting: action.payload };
    case 'SET_TRANSCRIPTION':
      return {
        ...state,
        transcriptions: {
          ...state.transcriptions,
          [action.payload.meetingId]: action.payload.transcription
        },
        meetings: state.meetings.map(meeting =>
          meeting.id === action.payload.meetingId
            ? { ...meeting, status: 'completed' }
            : meeting
        ),
        currentMeeting: state.currentMeeting?.id === action.payload.meetingId
          ? { ...state.currentMeeting, status: 'completed' }
          : state.currentMeeting,
      };
    default:
      return state;
  }
}

interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
  // Actions
  loadAllMeetings: () => Promise<void>;
  loadMeetingsPaginated: (page: number, pageSize: number) => Promise<void>;
  createMeeting: (meeting: CreateMeetingForm) => Promise<Meeting>;
  loadMeeting: (meetingId: string) => Promise<Meeting>;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  transcribeMeeting: (meetingId: string, audioFile?: File) => Promise<void>;
  generateSummary: (meetingId: string) => Promise<void>;
  loadTranscription: (meetingId: string) => Promise<Transcription>;
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
  children: React.ReactNode;
}

export const MeetingProvider: React.FC<MeetingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  const loadAllMeetings = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const meetings = await MeetingService.getAllMeetingsWithTranscriptions();
      dispatch({ type: 'SET_MEETINGS_WITH_TRANSCRIPTIONS', payload: meetings });
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

  const createMeeting = useCallback(async (formData: CreateMeetingForm): Promise<Meeting> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const meetingData = MeetingService.formatMeetingForAPI(formData);
      const meeting = await MeetingService.createMeeting(meetingData);

      dispatch({ type: 'ADD_MEETING', payload: meeting });

      // Se há arquivo de áudio, fazer upload
      if (formData.audioFile) {
        await transcribeMeeting(meeting.id, formData.audioFile);
      }

      return meeting;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar reunião';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadMeeting = useCallback(async (meetingId: string): Promise<Meeting> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const meeting = await MeetingService.getMeeting(meetingId);
      dispatch({ type: 'SET_CURRENT_MEETING', payload: meeting });
      return meeting;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar reunião';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateMeeting = useCallback((meeting: Meeting) => {
    dispatch({ type: 'UPDATE_MEETING', payload: meeting });
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MEETING', payload: id });
  }, []);

  const transcribeMeeting = useCallback(async (meetingId: string, audioFile?: File): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Atualizar status da reunião para processamento
      const currentMeeting = state.meetings.find(m => m.id === meetingId);
      if (currentMeeting) {
        dispatch({
          type: 'UPDATE_MEETING',
          payload: { ...currentMeeting, status: 'processing' }
        });
      }

      await TranscriptionService.transcribeMeeting(meetingId, audioFile);

      // Verificar status e carregar transcrição quando completar
      // Em uma implementação real, você poderia usar WebSockets ou polling
      setTimeout(async () => {
        try {
          const transcription = await TranscriptionService.getTranscription(meetingId);
          dispatch({
            type: 'SET_TRANSCRIPTION',
            payload: { meetingId, transcription }
          });
        } catch (error) {
          // Transcrição ainda não está pronta
        }
      }, 5000);

    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao processar transcrição';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.meetings]);

  const generateSummary = useCallback(async (meetingId: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const transcription = await TranscriptionService.generateSummary(meetingId);
      dispatch({
        type: 'SET_TRANSCRIPTION',
        payload: { meetingId, transcription }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao gerar resumo';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadTranscription = useCallback(async (meetingId: string): Promise<Transcription> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const transcription = await TranscriptionService.getTranscription(meetingId);
      dispatch({
        type: 'SET_TRANSCRIPTION',
        payload: { meetingId, transcription }
      });
      return transcription;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar transcrição';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        state,
        dispatch,
        loadAllMeetings,
        loadMeetingsPaginated,
        createMeeting,
        loadMeeting,
        updateMeeting,
        deleteMeeting,
        transcribeMeeting,
        generateSummary,
        loadTranscription,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}; 