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
  date: string; // ISO string
  participants: string[]; // JSON array as string
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