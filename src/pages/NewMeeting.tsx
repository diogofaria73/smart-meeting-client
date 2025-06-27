import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeeting } from '@/contexts/MeetingContext';
import {
  Upload,
  FileAudio,
  Check,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
  Users,
  Type,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Volume2,
  CloudUpload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const NewMeeting: React.FC = () => {
  const navigate = useNavigate();
  const { createMeeting, uploadAudioToMeeting } = useMeeting();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: ''
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  const handleFileRemove = () => {
    setAudioFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    if (audioFile) {
      handleFileSelect(audioFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleCreateMeeting = async () => {
    if (!formData.title) return;

    setIsCreatingMeeting(true);
    try {
      const participantsList = formData.participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const createdMeeting = await createMeeting({
        title: formData.title,
        description: formData.description,
        participants: participantsList,
      });

      setCreatedMeetingId(createdMeeting.id.toString());
      setCurrentStep(2); // Avançar para o próximo step
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const handleUploadAudio = async () => {
    if (!createdMeetingId || !audioFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadAudioToMeeting(createdMeetingId, audioFile, (progress) => {
        setUploadProgress(progress);
      });

      navigate('/meetings');
    } catch (error) {
      console.error('Erro ao fazer upload do áudio:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.title.trim().length > 0;
    }
    return true; // Step 2 sempre pode prosseguir (upload é opcional)
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const steps = [
    { id: 1, name: 'Informações', description: 'Dados básicos da reunião', icon: Type },
    { id: 2, name: 'Upload de Áudio', description: 'Arquivo para transcrição', icon: Volume2 }
  ];

  const getParticipantsCount = () => {
    return formData.participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0).length;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/meetings')} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para reuniões
          </Button>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Nova Reunião
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Configure sua reunião e faça upload do áudio para transcrição automática
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : isActive
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-4 hidden sm:block">
                      <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {step.name}
                      </p>
                      <p className={`text-xs ${isActive || isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-8 h-0.5 flex-1 transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Meeting Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Type className="w-5 h-5" />
                Informações da Reunião
              </CardTitle>
              <CardDescription>
                Preencha os dados básicos da sua reunião para começar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Título da reunião *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Reunião de planejamento semanal"
                  required
                  className="h-12 text-base bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                />
                {formData.title && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Título válido
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva brevemente o objetivo da reunião, principais tópicos a serem discutidos..."
                  rows={4}
                  className="text-base bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="participants" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participantes (opcional)
                </Label>
                <Input
                  id="participants"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  placeholder="João Silva, Maria Santos, Pedro Costa..."
                  className="h-12 text-base bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                />
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Separe os nomes dos participantes com vírgulas</span>
                  {getParticipantsCount() > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                      {getParticipantsCount()} participante{getParticipantsCount() !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Summary */}
          {formData.title && (
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:border-emerald-700/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    Resumo da Reunião
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-emerald-800 dark:text-emerald-200">Título:</span>
                    <span className="text-emerald-700 dark:text-emerald-300">{formData.title}</span>
                  </div>
                  {formData.description && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-emerald-800 dark:text-emerald-200 mt-0.5">Descrição:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 leading-relaxed">{formData.description}</span>
                    </div>
                  )}
                  {getParticipantsCount() > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-800 dark:text-emerald-200">Participantes:</span>
                      <span className="text-emerald-700 dark:text-emerald-300">{getParticipantsCount()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Audio Upload */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Upload do Arquivo de Áudio
              </CardTitle>
              <CardDescription>
                {createdMeetingId
                  ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Reunião "{formData.title}" criada com sucesso! Agora faça upload do arquivo de áudio para transcrição automática.</span>
                    </div>
                  )
                  : 'Faça upload do arquivo de áudio para transcrição automática'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!audioFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                      : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    <CloudUpload className={`h-10 w-10 ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`} />
                  </div>
                  <div className="mt-6 space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo de áudio'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      ou clique para selecionar um arquivo
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400">
                      <Sparkles className="w-3 h-3" />
                      MP3, WAV, M4A, OGG • máx. 100MB
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-6 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                        <FileAudio className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{audioFile.name}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span>{formatFileSize(audioFile.size)}</span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {audioFile.type.split('/')[1]?.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Pronto para upload
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleFileRemove} className="text-slate-600 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Dicas para melhor qualidade</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Use gravações com boa qualidade de áudio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Evite muito ruído de fundo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Fale claramente e em ritmo normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Arquivos menores processam mais rápido</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && !createdMeetingId && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
              {createdMeetingId && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Reunião criada com sucesso! ID: #{createdMeetingId}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 1 ? (
                <Button
                  onClick={handleCreateMeeting}
                  disabled={!canProceed() || isCreatingMeeting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                >
                  {isCreatingMeeting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Reunião...
                    </>
                  ) : (
                    <>
                      Criar Reunião
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : currentStep === 2 && !audioFile ? (
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Faça upload do áudio ou pule esta etapa
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/meetings')}>
                      Pular Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleUploadAudio}
                  disabled={!audioFile || isUploading}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Áudio
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar para upload */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Fazendo upload do arquivo...</span>
                <span className="font-medium text-slate-900 dark:text-white">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMeeting; 