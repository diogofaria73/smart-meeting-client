import React, { useState, useRef } from 'react';
import {
  Upload,
  FileAudio,
  X,
  Loader2,
  Volume2,
  CloudUpload,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AudioUploadProps {
  onFileSelect?: (file: File | null) => void;
  onUpload?: (file: File) => Promise<void>;
  uploadProgress?: number;
  uploadStatusMessage?: string;
  isUploading?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
  acceptedFormats?: string[];
  maxSize?: number; // em MB
  showUploadButton?: boolean;
  compact?: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  onFileSelect,
  onUpload,
  uploadProgress = 0,
  uploadStatusMessage = "Enviando arquivo...",
  isUploading = false,
  disabled = false,
  title = "Upload de Áudio",
  description = "Adicione um arquivo de áudio para transcrição automática",
  acceptedFormats = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'ogg'],
  maxSize = 100, // 100MB
  showUploadButton = false,
  compact = false
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Verificar se é arquivo de áudio
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      return 'Por favor, selecione um arquivo de áudio válido.';
    }

    // Verificar tamanho
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return `O arquivo deve ter no máximo ${maxSize}MB. Tamanho atual: ${fileSizeInMB.toFixed(1)}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File | null) => {
    setError(null);

    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setAudioFile(file);
    onFileSelect?.(file);
  };

  const handleFileRemove = () => {
    setAudioFile(null);
    setError(null);
    setIsPlaying(false);
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file =>
      file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
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

  const handleUpload = async () => {
    if (!audioFile || !onUpload) return;

    try {
      setError(null);
      await onUpload(audioFile);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer upload do arquivo');
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const getFileIcon = () => {
    if (isUploading) return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    if (audioFile) return <FileAudio className="h-6 w-6 text-green-500" />;
    return <Volume2 className="h-6 w-6 text-slate-400" />;
  };

  if (compact && audioFile) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {audioFile.name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {formatFileSize(audioFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {audioFile && !isUploading && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAudioPlayback}
                    disabled={disabled}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <audio
                    ref={audioRef}
                    src={URL.createObjectURL(audioFile)}
                    onEnded={() => setIsPlaying(false)}
                    preload="metadata"
                  />
                </>
              )}
              {showUploadButton && onUpload && !isUploading && (
                <Button
                  onClick={handleUpload}
                  disabled={disabled || !audioFile}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFileRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {uploadStatusMessage} {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(compact ? "border-slate-200" : "")}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "pt-0" : ""}>
        {!audioFile ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                <CloudUpload className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  Clique para selecionar ou arraste um arquivo
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Formatos aceitos: {acceptedFormats.join(', ')} • Máximo {maxSize}MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon()}
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        {audioFile.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {formatFileSize(audioFile.size)}
                        </p>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {audioFile.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileRemove}
                    disabled={disabled || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {audioFile && !isUploading && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudioPlayback}
                      disabled={disabled}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlaying ? 'Pausar' : 'Reproduzir'}
                    </Button>
                    <audio
                      ref={audioRef}
                      src={URL.createObjectURL(audioFile)}
                      onEnded={() => setIsPlaying(false)}
                      preload="metadata"
                    />
                  </div>
                )}

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {uploadStatusMessage}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {showUploadButton && onUpload && !isUploading && (
              <Button
                onClick={handleUpload}
                disabled={disabled || !audioFile}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload para Transcrição
              </Button>
            )}
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mt-4">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioUpload; 