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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
    { id: 1, name: 'Informações', description: 'Dados básicos da reunião' },
    { id: 2, name: 'Upload de Áudio', description: 'Arquivo para transcrição' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/meetings')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Nova Reunião</CardTitle>
              <CardDescription>
                Passo {currentStep} de {steps.length} - {steps[currentStep - 1]?.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentStep >= step.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-background text-muted-foreground'
                      }`}>
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 flex-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Reunião</CardTitle>
            <CardDescription>
              Preencha os dados básicos da sua reunião
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título da reunião *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Reunião de planejamento semanal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva brevemente o objetivo da reunião..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Participantes (opcional)</Label>
              <Input
                id="participants"
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                placeholder="João Silva, Maria Santos, Pedro Costa..."
              />
              <p className="text-sm text-muted-foreground">
                Separe os nomes dos participantes com vírgulas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload do Arquivo de Áudio</CardTitle>
            <CardDescription>
              {createdMeetingId
                ? `Reunião "${formData.title}" criada com sucesso! Agora faça upload do arquivo de áudio para transcrição automática.`
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
                className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-foreground">
                    Solte seu arquivo aqui
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ou clique para selecionar um arquivo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos suportados: MP3, WAV, M4A, OGG (máx. 100MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileAudio className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{audioFile.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(audioFile.size)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {audioFile.type.split('/')[1]?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleFileRemove}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas para melhor qualidade:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use gravações com boa qualidade de áudio</li>
                <li>• Evite muito ruído de fundo</li>
                <li>• Fale claramente e em ritmo normal</li>
                <li>• Arquivos mais curtos processam mais rapidamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
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
                <p className="text-sm text-muted-foreground">
                  Reunião criada com sucesso! ID: #{createdMeetingId}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 1 ? (
                <Button
                  onClick={handleCreateMeeting}
                  disabled={!canProceed() || isCreatingMeeting}
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
                  <p className="text-sm text-muted-foreground mb-2">
                    Faça upload do áudio ou pule esta etapa
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/meetings')}>
                      Pular Upload
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleUploadAudio}
                  disabled={!audioFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando... {uploadProgress}%
                    </>
                  ) : (
                    'Enviar Áudio'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress bar para upload */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Fazendo upload do arquivo... {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMeeting; 