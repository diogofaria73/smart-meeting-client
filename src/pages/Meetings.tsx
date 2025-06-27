import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Users,
  Mic,
  Loader2,
  Eye,
  ExternalLink,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useMeeting } from '@/contexts/MeetingContext';
import MeetingDetailsModal from '@/components/features/MeetingDetailsModal';
import type { MeetingWithTranscriptions } from '@/types';

const Meetings: React.FC = () => {
  const {
    state: { meetings, loading, error },
    loadMeetings
  } = useMeeting();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithTranscriptions | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && meeting.has_transcription && meeting.transcriptions.length > 0) ||
      (statusFilter === 'processing' && meeting.has_transcription && meeting.transcriptions.length === 0) ||
      (statusFilter === 'pending' && !meeting.has_transcription);
    return matchesSearch && matchesStatus;
  });

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Cálculos da paginação
  const totalItems = sortedMeetings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeetings = sortedMeetings.slice(startIndex, endIndex);

  const stats = {
    total: meetings.length,
    transcribed: meetings.filter(m => m.has_transcription && m.transcriptions.length > 0).length,
    processing: meetings.filter(m => m.has_transcription && m.transcriptions.length === 0).length,
    pending: meetings.filter(m => !m.has_transcription).length
  };

  const getStatusInfo = (meeting: MeetingWithTranscriptions) => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return {
        badge: <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Transcrita
        </Badge>,
        icon: CheckCircle,
        color: 'emerald'
      };
    } else if (meeting.has_transcription) {
      return {
        badge: <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
          <Clock className="w-3 h-3 mr-1" />
          Processando
        </Badge>,
        icon: Clock,
        color: 'amber'
      };
    } else {
      return {
        badge: <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pendente
        </Badge>,
        icon: AlertCircle,
        color: 'slate'
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleViewDetails = (meeting: MeetingWithTranscriptions) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push(-1); // Representa "..."
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(-1); // Representa "..."
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-slate-600 dark:text-slate-400">Carregando reuniões...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Erro ao carregar reuniões</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Reuniões</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Transcritas</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.transcribed}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Processando</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.processing}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 dark:from-slate-800/20 dark:to-slate-700/20 dark:border-slate-600/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Pendentes</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-500 flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                Suas Reuniões
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {totalItems > 0 ? `${totalItems} reunião${totalItems !== 1 ? 'ões' : ''} encontrada${totalItems !== 1 ? 's' : ''}` : 'Nenhuma reunião encontrada'}
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl">
              <Link to="/new-meeting">
                <Plus className="mr-2 h-4 w-4" />
                Nova Reunião
              </Link>
            </Button>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar reuniões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11 bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Transcritas</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-11 bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Mais recentes</SelectItem>
                  <SelectItem value="title">Nome</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-24 h-11 bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                  <SelectValue placeholder="Por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
        <CardContent className="p-0">
          {paginatedMeetings.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhuma reunião encontrada' : 'Ainda não há reuniões'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira reunião para começar'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Link to="/new-meeting">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeira reunião
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Reunião</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Data</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Participantes</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMeetings.map((meeting) => {
                    const statusInfo = getStatusInfo(meeting);
                    return (
                      <TableRow
                        key={meeting.id}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900 dark:text-white">{meeting.title}</div>
                            {meeting.description && (
                              <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                {meeting.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatRelativeDate(meeting.created_at)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(meeting.created_at)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {meeting.participants.length} participante{meeting.participants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {statusInfo.badge}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(meeting)}
                              className="h-8 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                              <Link to={`/meeting/${meeting.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(meeting)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/meeting/${meeting.id}`}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir página
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-slate-200 dark:border-slate-700">
                  {/* Informação dos resultados */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Mostrando <span className="font-medium text-slate-900 dark:text-white">{startIndex + 1}</span> a{" "}
                    <span className="font-medium text-slate-900 dark:text-white">{Math.min(endIndex, totalItems)}</span> de{" "}
                    <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> resultados
                  </div>

                  {/* Controles de paginação */}
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {getVisiblePages().map((page, index) => {
                        if (page === -1) {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        const isCurrentPage = page === currentPage;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={isCurrentPage}
                              className={isCurrentPage ? "bg-blue-600 text-white border-blue-600" : ""}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Meetings; 