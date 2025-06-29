import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import { useWebSocketNotifications } from '@/services/websocket';
import { TranscriptionService } from '@/services/transcriptions';
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Mic,
  MessageSquare,
  Share2,
  BookOpen,
  Hash,
  Copy,
  User,
  Timer,
  Activity,
  Upload,
  Plus,
  TrendingUp,
  Brain,
  Target,
  BarChart3,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioUpload from '@/components/features/AudioUpload';
import type { MeetingWithTranscriptions, DetailedTranscription, SentimentAnalysis, TopicInfo } from '@/types';

// Mapeamento dos steps do backend para mensagens user-friendly
const PROGRESS_MESSAGES: Record<string, string> = {
  'upload_validation': 'Validando arquivo...',
  'audio_preprocessing': 'Processando áudio...',
  'model_loading': 'Carregando modelo de IA...',
  'transcription': 'Transcrevendo áudio...',
  'speaker_diarization': 'Identificando falantes...',
  'post_processing': 'Finalizando transcrição...',
  'database_save': 'Salvando dados...',
  'completed': 'Concluído!',
  'error': 'Erro no processamento'
};

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, loadMeetings, uploadAudioToExistingMeeting, generateSummaryAsync } = useMeeting();
  const [meeting, setMeeting] = useState<MeetingWithTranscriptions | null>(null);
  const [detailedTranscription, setDetailedTranscription] = useState<DetailedTranscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTranscription, setSelectedTranscription] = useState<number>(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMessage, setUploadStatusMessage] = useState('Preparando upload...');

  // 🚀 NOVO: Estado para análise assíncrona
  const [isAnalyzingAsync, setIsAnalyzingAsync] = useState(false);

  // WebSocket para receber atualizações de progresso
  const { notifications, isConnected } = useWebSocketNotifications(
    meeting?.id ? Number(meeting.id) : undefined
  );

  // 📊 Carregar dados completos da transcrição
  const loadDetailedTranscription = async (meetingId: string) => {
    try {
      const detailed = await TranscriptionService.getDetailedTranscription(meetingId);
      setDetailedTranscription(detailed);
    } catch (error) {
      console.error('Erro ao carregar transcrição detalhada:', error);
      setDetailedTranscription(null);
    }
  };

  // Função para formatar tempo de áudio
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Função para obter ícone de sentimento
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positivo':
        return { icon: Smile, color: 'text-green-500' };
      case 'negativo':
        return { icon: Frown, color: 'text-red-500' };
      default:
        return { icon: Meh, color: 'text-yellow-500' };
    }
  };

  // Processa notificações do WebSocket
  useEffect(() => {
    const latestNotification = notifications[notifications.length - 1];
    if (!latestNotification || !isUploading) return;

    // Atualiza progresso baseado nas notificações WebSocket
    if (latestNotification.progress) {
      const { progress_percentage, step, message } = latestNotification.progress;

      setUploadProgress(Math.round(progress_percentage));

      // Mapeia o step para uma mensagem user-friendly
      const friendlyMessage = PROGRESS_MESSAGES[step] || message || 'Processando...';
      setUploadStatusMessage(friendlyMessage);

      // Se completou ou deu erro, finaliza o upload
      if (step === 'completed' || step === 'error') {
        setTimeout(() => {
          setIsUploading(false);
          setShowUploadForm(false);
          setUploadProgress(0);
          setUploadStatusMessage('Preparando upload...');

          // Recarrega os dados da reunião
          loadMeetings();
        }, 2000); // Aguarda 2 segundos para mostrar conclusão
      }
    }
  }, [notifications, isUploading, loadMeetings]);

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // Primeiro, tenta encontrar nos dados já carregados
      if (state.meetings.length > 0) {
        const foundMeeting = state.meetings.find(
          (m: MeetingWithTranscriptions) => m.id.toString() === id
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
          (m: MeetingWithTranscriptions) => m.id.toString() === id
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

  // 📊 Carregar dados detalhados quando reunião tem transcrição
  useEffect(() => {
    if (meeting && meeting.has_transcription && meeting.transcriptions.length > 0) {
      loadDetailedTranscription(meeting.id.toString());
    }
  }, [meeting?.has_transcription, meeting?.transcriptions.length]);

  // Check for upload hash in URL
  useEffect(() => {
    if (window.location.hash === '#upload' && meeting && !meeting.has_transcription) {
      setShowUploadForm(true);
      // Remove the hash from URL without reloading
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [meeting]);

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

  const handleAudioUpload = async (audioFile: File) => {
    if (!meeting) return;

    setIsUploading(true);
    setUploadProgress(5);
    setUploadStatusMessage('Enviando arquivo...');

    try {
      await uploadAudioToExistingMeeting(
        meeting.id.toString(),
        audioFile,
        (progress) => {
          // O progresso HTTP do upload inicial
          if (progress < 100) {
            setUploadProgress(Math.max(5, Math.min(progress, 15))); // Limita upload a 15%
            setUploadStatusMessage('Enviando arquivo...');
          }
        }
      );

      // Após o upload HTTP, o WebSocket assumirá o controle do progresso
      setUploadProgress(15);
      setUploadStatusMessage('Aguardando processamento...');

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusMessage('Erro no upload');
    }
    // Note: não resetamos isUploading aqui, o WebSocket fará isso quando completar
  };

  // 🚀 Função para teste da análise assíncrona otimizada
  const handleTestAsyncAnalysis = async () => {
    if (!meeting || isAnalyzingAsync) return;

    setIsAnalyzingAsync(true);

    try {
      const response = await generateSummaryAsync(meeting.id.toString());
      console.log('✅ Análise assíncrona iniciada:', response);

      setTimeout(() => {
        setIsAnalyzingAsync(false);
        alert('Análise assíncrona iniciada! Verifique o console para detalhes.');
      }, 2000);

    } catch (error) {
      console.error('Erro ao iniciar análise assíncrona:', error);
      setIsAnalyzingAsync(false);
      alert('Erro ao iniciar análise assíncrona');
    }
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
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Audio Section */}
          {(!meeting.has_transcription || meeting.transcriptions.length === 0) && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <Upload className="w-5 h-5" />
                  Adicionar Áudio para Transcrição
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  Esta reunião ainda não possui áudio transcrito. Faça upload de um arquivo de áudio para gerar a transcrição automática.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showUploadForm ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 dark:bg-amber-900/50">
                      <Mic className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
                      Pronto para adicionar áudio?
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-6">
                      Carregue um arquivo de áudio e nossa IA fará a transcrição automática com análise inteligente.
                    </p>
                    <Button
                      onClick={() => setShowUploadForm(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Áudio
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AudioUpload
                      onUpload={handleAudioUpload}
                      uploadProgress={uploadProgress}
                      uploadStatusMessage={uploadStatusMessage}
                      isUploading={isUploading}
                      showUploadButton={true}
                      title="Selecione o Arquivo de Áudio"
                      description="Formatos suportados: MP3, WAV, M4A, MP4, WebM, OGG"
                    />
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadForm(false)}
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* 📊 NOVA SEÇÃO: Análise Detalhada */}
          {detailedTranscription && detailedTranscription.is_analyzed && (
            <div className="space-y-6">
              {/* Estatísticas Gerais */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-700/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <BarChart3 className="w-5 h-5" />
                    Estatísticas da Reunião
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Speakers Count */}
                    <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {detailedTranscription.speakers_count}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Participantes</div>
                    </div>

                    {/* Total Duration */}
                    {detailedTranscription.processing_details && (
                      <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatDuration(detailedTranscription.processing_details.audio_duration)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Duração</div>
                      </div>
                    )}

                    {/* Confidence Score */}
                    {detailedTranscription.analysis?.confidence_score && (
                      <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.round(detailedTranscription.analysis.confidence_score * 100)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Confiança</div>
                      </div>
                    )}

                    {/* Topics Count */}
                    <div className="text-center p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {detailedTranscription.analysis?.main_topics?.length || detailedTranscription.topics.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Tópicos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Análise de Sentimento */}
              {detailedTranscription.analysis?.sentiment_analysis && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-green-900 dark:text-green-100">
                      <Brain className="w-5 h-5" />
                      Análise de Sentimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sentimento Geral */}
                      <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const sentimentInfo = getSentimentIcon(detailedTranscription.analysis.sentiment_analysis.overall);
                            const SentimentIcon = sentimentInfo.icon;
                            return (
                              <>
                                <SentimentIcon className={`w-6 h-6 ${sentimentInfo.color}`} />
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    Sentimento Geral
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                    {detailedTranscription.analysis.sentiment_analysis.overall}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {Math.round(detailedTranscription.analysis.sentiment_analysis.confidence * 100)}% confiança
                        </div>
                      </div>

                      {/* Sentimento por Tópico */}
                      {Object.keys(detailedTranscription.analysis.sentiment_analysis.topics).length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Por Tópico:</h5>
                          <div className="space-y-2">
                            {Object.entries(detailedTranscription.analysis.sentiment_analysis.topics).map(([topic, sentiment]) => {
                              const sentimentInfo = getSentimentIcon(sentiment);
                              const SentimentIcon = sentimentInfo.icon;
                              return (
                                <div key={topic} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{topic}</span>
                                  <div className="flex items-center gap-2">
                                    <SentimentIcon className={`w-4 h-4 ${sentimentInfo.color}`} />
                                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{sentiment}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tópicos Principais */}
              {detailedTranscription.analysis?.main_topics && detailedTranscription.analysis.main_topics.length > 0 && (
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-amber-900 dark:text-amber-100">
                      <Target className="w-5 h-5" />
                      Tópicos Principais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {detailedTranscription.analysis.main_topics.map((topic, index) => (
                        <div key={index} className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-slate-900 dark:text-slate-100">{topic.title}</h5>
                            <div className="flex items-center gap-2">
                              <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded">
                                {Math.round(topic.importance * 100)}% relevância
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{topic.summary}</p>
                          <div className="flex flex-wrap gap-1">
                            {topic.keywords.map((keyword, keyIndex) => (
                              <Badge key={keyIndex} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Itens de Ação */}
              {detailedTranscription.analysis?.action_items && detailedTranscription.analysis.action_items.length > 0 && (
                <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 dark:from-rose-900/20 dark:to-pink-900/20 dark:border-rose-700/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 text-rose-900 dark:text-rose-100">
                      <TrendingUp className="w-5 h-5" />
                      Itens de Ação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {detailedTranscription.analysis.action_items.map((action, index) => (
                        <div key={index} className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-lg border-l-4 border-rose-400">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-slate-900 dark:text-slate-100">{action.task}</h5>
                            <Badge
                              variant="outline"
                              className={`text-xs ${action.priority === 'alta' ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300' :
                                action.priority === 'média' ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300' :
                                  'border-green-300 text-green-700 dark:border-green-700 dark:text-green-300'
                                }`}
                            >
                              {action.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            {action.assignee && (
                              <span>👤 {action.assignee}</span>
                            )}
                            {action.due_date && (
                              <span>📅 {action.due_date}</span>
                            )}
                            <span>🎯 {Math.round(action.confidence * 100)}% confiança</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail; 