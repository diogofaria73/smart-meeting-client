import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  Search,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { MeetingWithTranscriptions } from '@/types';
import MeetingCard from '@/components/features/MeetingCard';
import Pagination from '@/components/ui/pagination';

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const { state, loadMeetingsPaginated } = useMeeting();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Carregar reuniões ao montar o componente
  useEffect(() => {
    const loadMeetings = async () => {
      try {
        await loadMeetingsPaginated(currentPage, pageSize);
      } catch (error) {
        console.error('Erro ao carregar reuniões:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    // Só carrega se ainda não carregou E não há dados já carregados
    if (isInitialLoad && (!state.paginatedMeetings || state.paginatedMeetings.meetings.length === 0) && !state.loading) {
      loadMeetings();
    } else if (state.paginatedMeetings && state.paginatedMeetings.meetings.length > 0) {
      // Se já tem dados, marca como carregado
      setIsInitialLoad(false);
    }
  }, [currentPage, pageSize, loadMeetingsPaginated, isInitialLoad, state.paginatedMeetings, state.loading]);

  const meetings = state.paginatedMeetings?.meetings || [];
  const filteredMeetings = meetings.filter((meeting: MeetingWithTranscriptions) => {
    const searchLower = searchTerm.toLowerCase();
    return meeting.title.toLowerCase().includes(searchLower) ||
      (meeting.description && meeting.description.toLowerCase().includes(searchLower)) ||
      meeting.participants.some(p => p.toLowerCase().includes(searchLower));
  });

  const handleMeetingClick = (meetingId: number) => {
    navigate(`/meeting/${meetingId}`);
  };

  const handleRetry = async () => {
    setIsInitialLoad(true);
    try {
      await loadMeetingsPaginated(currentPage, pageSize);
    } catch (error) {
      console.error('Erro ao recarregar reuniões:', error);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    try {
      await loadMeetingsPaginated(page, pageSize);
    } catch (error) {
      console.error('Erro ao carregar página:', error);
    }
  };

  // Loading state
  if (isInitialLoad && state.loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-body">Carregando reuniões...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="card-clean p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-subtitle mb-2 text-red-600">Erro ao carregar reuniões</h3>
          <p className="text-body mb-6">{state.error}</p>
          <button
            onClick={handleRetry}
            className="btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header com busca */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reuniões</h1>
          <p className="text-body">
            {filteredMeetings.length} reuniões encontradas
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar reuniões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-clean pl-10 w-80"
          />
        </div>
      </div>

      {/* Lista de reuniões */}
      {filteredMeetings.length > 0 ? (
        <>
          <div className="space-y-3">
            {filteredMeetings.map((meeting: MeetingWithTranscriptions) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={handleMeetingClick}
              />
            ))}
          </div>

          {/* Paginação - só mostra se não há busca ativa */}
          {!searchTerm && state.paginatedMeetings && (
            <Pagination
              currentPage={state.paginatedMeetings.page}
              totalPages={state.paginatedMeetings.total_pages}
              onPageChange={handlePageChange}
              hasNext={state.paginatedMeetings.has_next}
              hasPrev={state.paginatedMeetings.has_prev}
              total={state.paginatedMeetings.total}
              pageSize={state.paginatedMeetings.page_size}
            />
          )}
        </>
      ) : (
        <div className="card-clean p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-subtitle mb-2">
            {searchTerm ? 'Nenhuma reunião encontrada' : 'Nenhuma reunião ainda'}
          </h3>
          <p className="text-body mb-6">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando sua primeira reunião'
            }
          </p>
          {!searchTerm && (
            <Link to="/new-meeting" className="btn-primary">
              Criar Reunião
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Meetings; 