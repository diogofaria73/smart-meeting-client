import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Download,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Mic
} from 'lucide-react';
import type { MeetingWithTranscriptions } from '@/types';

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, loadAllMeetings } = useMeeting();
  const [meeting, setMeeting] = useState<MeetingWithTranscriptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // Primeiro, tenta encontrar nos dados já carregados
      if (state.meetingsWithTranscriptions.length > 0) {
        const foundMeeting = state.meetingsWithTranscriptions.find(
          m => m.id.toString() === id
        );
        if (foundMeeting) {
          setMeeting(foundMeeting);
          setIsLoading(false);
          return;
        }
      }

      // Se não encontrou, recarrega todas as reuniões
      try {
        await loadAllMeetings();
        // Após recarregar, tenta encontrar novamente
        const foundMeeting = state.meetingsWithTranscriptions.find(
          m => m.id.toString() === id
        );
        setMeeting(foundMeeting || null);
      } catch (error) {
        console.error('Erro ao carregar reunião:', error);
        setMeeting(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetingData();
  }, [id, state.meetingsWithTranscriptions, loadAllMeetings]);

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

  const getStatusInfo = (meeting: MeetingWithTranscriptions) => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return { icon: CheckCircle, class: 'status-completed', label: 'Concluída' };
    } else if (meeting.has_transcription) {
      return { icon: Clock, class: 'status-processing', label: 'Processando' };
    } else {
      return { icon: AlertCircle, class: 'status-created', label: 'Criada' };
    }
  };

  const handleBack = () => {
    navigate('/meetings');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <div className="card-clean p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-subtitle mb-2">Reunião não encontrada</h3>
          <p className="text-body">
            A reunião que você está procurando não foi encontrada.
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(meeting);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div>
            <h1 className="text-title">
              {meeting.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-caption">
                  {formatDate(meeting.date)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`status-dot ${statusInfo.class}`} />
                <span className="text-caption">{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações da reunião */}
      <div className="card-clean p-6 space-y-4">
        <h2 className="text-subtitle">Informações da Reunião</h2>

        {meeting.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </h4>
            <p className="text-body">{meeting.description}</p>
          </div>
        )}

        {meeting.participants && meeting.participants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participantes ({meeting.participants.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {meeting.participants.map((participant: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded"
                >
                  {participant}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transcrições */}
      {meeting.transcriptions && meeting.transcriptions.length > 0 ? (
        <div className="space-y-4">
          {meeting.transcriptions.map((transcription, index) => (
            <div key={transcription.id} className="card-clean p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-subtitle">
                  Transcrição {meeting.transcriptions.length > 1 ? `${index + 1}` : ''}
                </h2>
                <button className="btn-secondary">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-body leading-relaxed">
                  {transcription.content}
                </div>
              </div>

              {transcription.summary && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Resumo
                  </h3>
                  <div className="text-body leading-relaxed">
                    {transcription.summary}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 text-caption text-gray-500">
                <span>Criada em: {formatDate(transcription.created_at)}</span>
                {transcription.is_summarized && (
                  <span className="text-green-600">• Resumo disponível</span>
                )}
                {transcription.is_analyzed && (
                  <span className="text-blue-600">• Análise disponível</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-clean p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-subtitle mb-2">Nenhuma transcrição disponível</h3>
          <p className="text-body mb-6">
            Esta reunião ainda não possui transcrição.
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingDetail; 