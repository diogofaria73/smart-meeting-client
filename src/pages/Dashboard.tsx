import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useMeeting();
  const meetings = (state as any).meetings || [];

  const stats = {
    total: meetings.length,
    completed: meetings.filter((m: any) => m.status === 'completed').length,
    processing: meetings.filter((m: any) => m.status === 'processing').length,
  };

  const recentMeetings = meetings.slice(0, 3);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      default: return 'Criada';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      default: return 'status-created';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-clean p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Total de Reuniões</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card-clean p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Transcrições Prontas</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card-clean p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption">Processando</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.processing}
              </p>
            </div>
            <RotateCcw className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Ação principal */}
      <div className="card-clean p-8 text-center">
        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-subtitle mb-2">Criar Nova Reunião</h3>
        <p className="text-body mb-6">
          Faça upload de um arquivo de áudio para gerar transcrições automáticas
        </p>
        <Link to="/new-meeting" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova Reunião
        </Link>
      </div>

      {/* Reuniões Recentes */}
      {recentMeetings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-subtitle">Reuniões Recentes</h2>
            <Link
              to="/meetings"
              className="text-body text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentMeetings.map((meeting: any, index: number) => (
              <div
                key={index}
                className="card-clean p-4 hover:shadow-sm cursor-pointer"
                onClick={() => navigate(`/meeting/${meeting.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <div className={`status-dot ${getStatusClass(meeting.status)}`} />
                          <span className="text-caption">{getStatusText(meeting.status)}</span>
                        </div>
                        <span className="text-caption">
                          {new Date(meeting.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard; 