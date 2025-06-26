import React from 'react';
import {
  FileText,
  CheckCircle,
  RotateCcw,
  Play,
  Calendar,
  ArrowRight,
  MessageSquare,
  Users
} from 'lucide-react';
import type { MeetingWithTranscriptions } from '@/types';

interface MeetingCardProps {
  meeting: MeetingWithTranscriptions;
  onClick: (meetingId: number) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick }) => {
  const getStatusInfo = (meeting: MeetingWithTranscriptions) => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return { icon: CheckCircle, class: 'status-completed', label: 'Concluída' };
    } else if (meeting.has_transcription) {
      return { icon: RotateCcw, class: 'status-processing', label: 'Processando' };
    } else {
      return { icon: Play, class: 'status-created', label: 'Criada' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = getStatusInfo(meeting);

  return (
    <div
      className="card-clean p-4 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onClick(meeting.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {meeting.title}
          </h3>
          {meeting.description && (
            <p className="text-body truncate mt-1">
              {meeting.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className={`status-dot ${statusInfo.class}`} />
              <span className="text-caption">{statusInfo.label}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-caption">
                {formatDate(meeting.date)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-caption">
                {meeting.participants.length} participantes
              </span>
            </div>

            {meeting.transcriptions.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-green-500" />
                <span className="text-caption text-green-600">
                  {meeting.transcriptions.length} transcrição{meeting.transcriptions.length > 1 ? 'ões' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Mostrar participantes */}
          {meeting.participants.length > 0 && (
            <div className="mt-2">
              <span className="text-caption text-gray-500">
                Participantes: {meeting.participants.join(', ')}
              </span>
            </div>
          )}
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* Informações das transcrições */}
      {meeting.transcriptions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-caption text-gray-600 dark:text-gray-400">
            <strong>Transcrições disponíveis:</strong>
          </div>
          <div className="mt-1 space-y-1">
            {meeting.transcriptions.slice(0, 2).map((transcription) => (
              <div key={transcription.id} className="text-caption text-gray-500">
                • {transcription.content.substring(0, 100)}
                {transcription.content.length > 100 && '...'}
              </div>
            ))}
            {meeting.transcriptions.length > 2 && (
              <div className="text-caption text-gray-400">
                +{meeting.transcriptions.length - 2} transcrição{meeting.transcriptions.length - 2 > 1 ? 'ões' : ''} adicional{meeting.transcriptions.length - 2 > 1 ? 'is' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCard; 