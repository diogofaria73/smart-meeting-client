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
  MoreHorizontal
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

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

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

  const stats = {
    total: meetings.length,
    transcribed: meetings.filter(m => m.has_transcription && m.transcriptions.length > 0).length,
    processing: meetings.filter(m => m.has_transcription && m.transcriptions.length === 0).length,
    pending: meetings.filter(m => !m.has_transcription).length
  };

  const getStatusBadge = (meeting: MeetingWithTranscriptions) => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Transcrita</Badge>;
    } else if (meeting.has_transcription) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Processando</Badge>;
    } else {
      return <Badge variant="outline">Pendente</Badge>;
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

  const handleViewDetails = (meeting: MeetingWithTranscriptions) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Carregando reuniões...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
              <FileText className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive">Erro ao carregar reuniões</h3>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Suas Reuniões</CardTitle>
              <CardDescription>
                {meetings.length} reuniões registradas
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/new-meeting">
                <Plus className="mr-2 h-4 w-4" />
                Nova Reunião
              </Link>
            </Button>
          </div>
        </CardHeader>

        {/* Stats */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.transcribed}
              </div>
              <div className="text-sm text-green-700">Transcritas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.processing}
              </div>
              <div className="text-sm text-orange-700">Processando</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-700">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar reuniões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="title">Título</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reuniões</CardTitle>
          <CardDescription>
            {sortedMeetings.length} reuniões encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedMeetings.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhuma reunião encontrada' : 'Nenhuma reunião ainda'}
              </CardTitle>
              <CardDescription className="mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira reunião'}
              </CardDescription>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link to="/new-meeting">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Reunião
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transcrições</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMeetings.map((meeting) => (
                    <TableRow key={meeting.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {meeting.title}
                          </p>
                          {meeting.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(meeting.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {meeting.participants.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(meeting)}
                      </TableCell>
                      <TableCell>
                        {meeting.transcriptions.length > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Mic className="h-3 w-3" />
                            {meeting.transcriptions.length}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(meeting)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/meeting/${meeting.id}`} className="cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir Reunião
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <MeetingDetailsModal
        meeting={selectedMeeting}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Meetings; 