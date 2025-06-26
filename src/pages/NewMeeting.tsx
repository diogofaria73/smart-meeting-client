import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  Upload,
  FileAudio,
  ArrowLeft,
  X,
  CheckCircle,
  Calendar,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import type { MeetingResponse } from '@/types';

interface CreateMeetingData {
  title: string;
  description: string;
  date: string;
  participants: string[];
}

const NewMeeting: React.FC = () => {
  const navigate = useNavigate();
  const { state, loadAllMeetings } = useMeeting();
  const [currentStep, setCurrentStep] = useState<'create' | 'upload'>('create');
  const [createdMeeting, setCreatedMeeting] = useState<MeetingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'completed' | 'error'>('idle');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(false);

  // Form data para criar reunião
  const [formData, setFormData] = useState<CreateMeetingData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    participants: ['']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = value;
    setFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, '']
    }));
  };

  const removeParticipant = (index: number) => {
    if (formData.participants.length > 1) {
      const newParticipants = formData.participants.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        participants: newParticipants
      }));
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      // Filtrar participantes vazios
      const participants = formData.participants.filter(p => p.trim() !== '');

      // Criar reunião via API
      const response = await fetch('http://localhost:8000/api/meetings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || '',
          date: new Date(formData.date).toISOString(),
          participants: participants
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar reunião');
      }

      const meeting: MeetingResponse = await response.json();
      setCreatedMeeting(meeting);
      setCurrentStep('upload');
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      alert('Erro ao criar reunião. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
      } else {
        alert('Por favor, selecione um arquivo de áudio válido.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      alert('Por favor, selecione um arquivo de áudio válido.');
    }
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setShowCompletionDialog(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleUploadAudio = async () => {
    if (!audioFile || !createdMeeting) return;

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', audioFile); // O endpoint espera 'file', não 'audio_file'

      // Fase 1: Upload do arquivo
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 40) {
            clearInterval(uploadInterval);
            return 40;
          }
          return prev + 8;
        });
      }, 200);

      const response = await fetch(`http://localhost:8000/api/transcriptions/transcribe?meeting_id=${createdMeeting.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao fazer upload do áudio');
      }

      // Fase 2: Processamento da transcrição
      setUploadStatus('transcribing');
      setUploadProgress(50);

      const transcriptionInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(transcriptionInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      const result = await response.json();

      // Finalizar processamento
      clearInterval(transcriptionInterval);
      setUploadProgress(100);
      setUploadStatus('completed');

      // Mostrar dialog de confirmação após 1 segundo
      setTimeout(() => {
        setShowCompletionDialog(true);
      }, 1000);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setUploadStatus('error');
      alert(`Erro ao fazer upload do áudio: ${errorMessage}`);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipAudio = () => {
    if (createdMeeting) {
      // Redirecionar para a reunião criada
      navigate(`/meeting/${createdMeeting.id}`);
    }
  };

  const handleViewTranscription = async () => {
    if (createdMeeting) {
      try {
        setIsLoadingMeeting(true);

        // Recarregar as reuniões para incluir a nova reunião com transcrição
        await loadAllMeetings();

        // Fechar o dialog após carregar
        setShowCompletionDialog(false);

        // Navegar para a reunião
        navigate(`/meeting/${createdMeeting.id}`);
      } catch (error) {
        console.error('Erro ao recarregar reuniões:', error);
        setShowCompletionDialog(false);
        // Mesmo com erro, tenta navegar
        navigate(`/meeting/${createdMeeting.id}`);
      } finally {
        setIsLoadingMeeting(false);
      }
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const getUploadStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Enviando arquivo de áudio...';
      case 'transcribing':
        return 'Processando transcrição...';
      case 'completed':
        return 'Transcrição concluída com sucesso!';
      case 'error':
        return 'Erro no processamento';
      default:
        return '';
    }
  };

  const canCreateMeeting = formData.title.trim() !== '';

  // Etapa 1: Criar reunião
  if (currentStep === 'create') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div>
            <h1 className="text-title">Nova Reunião</h1>
            <p className="text-body">Etapa 1 de 2: Informações da reunião</p>
          </div>
        </div>

        <form onSubmit={handleCreateMeeting} className="space-y-6">
          {/* Informações básicas */}
          <div className="card-clean p-6 space-y-4">
            <h2 className="text-subtitle">Informações da Reunião</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-clean"
                placeholder="Nome da reunião"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-clean"
                rows={3}
                placeholder="Descrição opcional da reunião"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-clean"
              />
            </div>

            {/* Participantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Participantes
              </label>
              <div className="space-y-2">
                {formData.participants.map((participant, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={participant}
                      onChange={(e) => handleParticipantChange(index, e.target.value)}
                      className="input-clean flex-1"
                      placeholder={`Participante ${index + 1}`}
                    />
                    {formData.participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="btn-secondary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addParticipant}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar participante
                </button>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canCreateMeeting || isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Criando...' : 'Criar Reunião'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Etapa 2: Upload de áudio
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentStep('create')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div>
          <h1 className="text-title">Nova Reunião</h1>
          <p className="text-body">Etapa 2 de 2: Upload de áudio para transcrição</p>
        </div>
      </div>

      {/* Reunião criada */}
      {createdMeeting && (
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <h2 className="text-subtitle">Reunião criada com sucesso!</h2>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {createdMeeting.title}
            </h3>
            {createdMeeting.description && (
              <p className="text-body mb-2">{createdMeeting.description}</p>
            )}
            <div className="flex items-center gap-4 text-caption">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(createdMeeting.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{createdMeeting.participants.length} participantes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload de áudio */}
      <div className="card-clean p-6 space-y-4">
        <h2 className="text-subtitle">Upload de Áudio</h2>
        <p className="text-body">
          Faça upload do arquivo de áudio da reunião para gerar a transcrição automática.
        </p>

        {!audioFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Arraste o arquivo de áudio aqui
            </h3>
            <p className="text-body mb-4">
              Ou clique para selecionar um arquivo
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="btn-primary cursor-pointer">
              Selecionar arquivo
            </label>
            <p className="text-caption mt-2">
              Formatos suportados: MP3, WAV, M4A, AAC
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <FileAudio className="w-8 h-8 text-blue-500" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {audioFile.name}
                </h4>
                <p className="text-caption">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
              <button
                onClick={removeAudioFile}
                className="btn-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadProgress > 0 && uploadStatus !== 'idle' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{getUploadStatusMessage()}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${uploadStatus === 'error'
                      ? 'bg-red-600'
                      : uploadStatus === 'completed'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                      }`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>

                {uploadStatus === 'transcribing' && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Aguarde, processando a transcrição...</span>
                  </div>
                )}

                {uploadStatus === 'completed' && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Processamento concluído!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-between">
        <button
          onClick={handleSkipAudio}
          disabled={isSubmitting || uploadStatus === 'uploading' || uploadStatus === 'transcribing'}
          className="btn-secondary"
        >
          Pular por agora
        </button>
        <div className="flex gap-3">
          {audioFile && uploadStatus !== 'completed' && (
            <button
              onClick={handleUploadAudio}
              disabled={isSubmitting || uploadStatus === 'uploading' || uploadStatus === 'transcribing'}
              className="btn-primary"
            >
              {uploadStatus === 'uploading' ? 'Enviando...' :
                uploadStatus === 'transcribing' ? 'Processando...' :
                  'Enviar Áudio'}
            </button>
          )}
        </div>
      </div>

      {/* Dialog de confirmação após transcrição */}
      {showCompletionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Transcrição Concluída!
              </h3>
              <p className="text-body mb-6">
                A transcrição foi processada com sucesso. Deseja visualizar o resultado agora?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleGoToDashboard}
                  disabled={isLoadingMeeting}
                  className="btn-secondary"
                >
                  Não, voltar ao início
                </button>
                <button
                  onClick={handleViewTranscription}
                  disabled={isLoadingMeeting}
                  className="btn-primary"
                >
                  {isLoadingMeeting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Carregando...
                    </div>
                  ) : (
                    'Sim, visualizar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMeeting; 