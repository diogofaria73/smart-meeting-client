export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string from backend
  participants: string[]; // JSON array as string
  status: 'created' | 'processing' | 'analyzing' | 'completed' | 'error';
  audio_file_path?: string;
  duration?: number;
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
}

export interface MeetingCreate {
  title: string;
  description?: string;
  date: string; // ISO string - backend irá converter para datetime
  participants: string[]; // Array de strings - backend espera List[str]
}

// Tipo para criar reunião (dados do formulário)
export interface CreateMeetingData {
  title: string;
  description?: string;
  date: string; // ISO string
  participants: string[]; // Array de strings
}

// Novo tipo para reunião vinda do backend (seguindo a estrutura do Pydantic)
export interface MeetingResponse {
  id: number;
  title: string;
  description?: string;
  date: string; // ISO string from backend
  participants: string[]; // Already parsed array
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
  has_transcription: boolean;
  has_summary: boolean;
}

// Novo tipo para transcrição vinda do backend
export interface TranscriptionResponse {
  id: number;
  meeting_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_summarized: boolean;
  is_analyzed: boolean;
  summary?: string | null;
  topics: string[];
  analysis?: any | null; // MeetingAnalysisResult
}

// Novo tipo para reunião com transcrições (resposta do endpoint /api/meetings)
export interface MeetingWithTranscriptions {
  id: number;
  title: string;
  description?: string;
  date: string; // ISO string from backend
  participants: string[]; // Already parsed array
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
  has_transcription: boolean;
  has_summary: boolean;
  transcriptions: TranscriptionResponse[];
}

// Novo tipo para resposta paginada de reuniões
export interface PaginatedMeetingsResponse {
  meetings: MeetingWithTranscriptions[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Tipos para estatísticas do dashboard
export interface DailyStats {
  date: string; // YYYY-MM-DD
  meetings_count: number;
  transcriptions_count: number;
}

export interface DashboardStats {
  total_meetings: number;
  total_transcriptions: number;
  completed_transcriptions: number;
  processing_transcriptions: number;
  daily_stats: DailyStats[];
}

export interface Transcription {
  id: string;
  meeting_id: string;
  content: string;
  summary?: string;
  speakers: TranscriptionSpeaker[];
  created_at: string;
  updated_at: string;
}

export interface TranscriptionSpeaker {
  speaker_id: string;
  segments: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role?: string;
  speakingTime: number; // em segundos
  participationScore: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface Action {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  status: 'pending' | 'completed';
  createdAt: Date;
}

export interface UploadProgress {
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status_code: number;
  details?: any;
}

// Tipos para formulários
export interface CreateMeetingForm {
  title: string;
  description: string;
  date: Date;
  participants: string[];
  audioFile?: File;
}

export interface TranscriptionProgress {
  meeting_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
}

// 🚀 NOVOS TIPOS PARA SISTEMA ASSÍNCRONO

export interface TranscriptionTaskResponse {
  task_id: string;
  meeting_id: number;
  status: string;
  filename: string;
  websocket_url: string;
  status_url: string;
  result_url: string;
  message: string;
  enable_diarization: boolean;
}

export interface TranscriptionTaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
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
}

export interface WebSocketNotification {
  event_type: 'transcription_started' | 'transcription_progress' | 'transcription_completed' | 'transcription_failed' | 'analysis_started' | 'analysis_completed' | 'analysis_failed' | 'system_notification';
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