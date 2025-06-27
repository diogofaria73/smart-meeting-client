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
  Mic,
  MessageSquare,
  Share2,
  BookOpen,
  Hash,
  Copy,
  ExternalLink,
  Eye,
  User,
  Timer,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MeetingWithTranscriptions } from '@/types';

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, loadMeetings } = useMeeting();
  const [meeting, setMeeting] = useState<MeetingWithTranscriptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTranscription, setSelectedTranscription] = useState<number>(0);

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // Primeiro, tenta encontrar nos dados já carregados
      if (state.meetings.length > 0) {
        const foundMeeting = state.meetings.find(
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
        await loadMeetings();
        // Após recarregar, tenta encontrar novamente
        const foundMeeting = state.meetings.find(
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
  }, [id, state.meetings, loadMeetings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  const getStatusInfo = (meeting: MeetingWithTranscriptions) => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return {
        icon: CheckCircle,
        label: 'Concluída',
        color: 'emerald',
        description: 'Transcrição disponível'
      };
    } else if (meeting.has_transcription) {
      return {
        icon: Clock,
        label: 'Processando',
        color: 'amber',
        description: 'Transcrição em andamento'
      };
    } else {
      return {
        icon: AlertCircle,
        label: 'Criada',
        color: 'slate',
        description: 'Aguardando processamento'
      };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar um toast de sucesso
  };

  const handleBack = () => {
    navigate('/meetings');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4 dark:bg-red-900/50">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Reunião não encontrada</h3>
            <p className="text-red-700 dark:text-red-300">
              A reunião que você está procurando não foi encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(meeting);
  const StatusIcon = statusInfo.icon;
  const transcription = meeting.transcriptions?.[selectedTranscription];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              {meeting.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formatRelativeDate(meeting.created_at)}
                </span>
                <span className="text-xs text-slate-400">
                  ({formatDate(meeting.created_at)})
                </span>
              </div>
              <Badge
                className={`${statusInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' :
                      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Meeting Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Status</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{statusInfo.label}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{statusInfo.description}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <StatusIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Participantes</p>
                <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">{meeting.participants.length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">pessoas na reunião</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Transcrições</p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">{meeting.transcriptions.length}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {meeting.transcriptions.length > 0 ? 'disponíveis' : 'nenhuma ainda'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Meeting Details Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80 sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Reunião</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {meeting.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Descrição
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {meeting.description}
                  </p>
                </div>
              )}

              {meeting.participants && meeting.participants.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participantes ({meeting.participants.length})
                  </h4>
                  <div className="space-y-2">
                    {meeting.participants.map((participant: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {participant}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Informações Técnicas
                </h4>
                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>ID da Reunião:</span>
                    <span className="font-mono">#{meeting.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Criada em:</span>
                    <span>{new Date(meeting.created_at).toLocaleTimeString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última atualização:</span>
                    <span>{new Date(meeting.updated_at).toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcription Content */}
        <div className="lg:col-span-3">
          {meeting.transcriptions && meeting.transcriptions.length > 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Transcrições
                    </CardTitle>
                    <CardDescription>
                      {meeting.transcriptions.length} transcrição{meeting.transcriptions.length !== 1 ? 'ões' : ''} disponível
                      {meeting.transcriptions.length !== 1 ? 'is' : ''}
                    </CardDescription>
                  </div>
                  {transcription && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(transcription.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTranscription.toString()} onValueChange={(value) => setSelectedTranscription(parseInt(value))}>
                  {meeting.transcriptions.length > 1 && (
                    <TabsList className="mb-6">
                      {meeting.transcriptions.map((_, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          Transcrição {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}

                  {meeting.transcriptions.map((transcription, index) => (
                    <TabsContent key={transcription.id} value={index.toString()}>
                      <div className="space-y-6">
                        {/* Transcription Meta */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Criada em {formatDate(transcription.created_at)}
                              </span>
                            </div>
                            {transcription.is_analyzed && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Analisada
                              </Badge>
                            )}
                            {transcription.is_summarized && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Resumida
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Topics */}
                        {transcription.topics && transcription.topics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              Tópicos Identificados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {transcription.topics.map((topic, topicIndex) => (
                                <Badge
                                  key={topicIndex}
                                  variant="outline"
                                  className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {transcription.summary && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Resumo
                            </h4>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {transcription.summary}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Transcription Content */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Transcrição Completa
                          </h4>
                          <div className="prose max-w-none">
                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                              <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                                {transcription.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
              <CardContent className="p-12 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {meeting.has_transcription ? 'Transcrição em processamento' : 'Nenhuma transcrição disponível'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  {meeting.has_transcription
                    ? 'A transcrição desta reunião está sendo processada. Isso pode levar alguns minutos.'
                    : 'Ainda não há transcrições para esta reunião. Faça upload de um arquivo de áudio para começar.'
                  }
                </p>
                {meeting.has_transcription && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Processando...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail; 