import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Users,
  Mic,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MeetingWithTranscriptions } from '@/types';

interface MeetingDetailsModalProps {
  meeting: MeetingWithTranscriptions | null;
  isOpen: boolean;
  onClose: () => void;
}

const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  meeting,
  isOpen,
  onClose
}) => {
  if (!meeting) return null;

  const getStatus = () => {
    if (meeting.has_transcription && meeting.transcriptions.length > 0) {
      return {
        label: 'Transcrita',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100'
      };
    } else if (meeting.has_transcription) {
      return {
        label: 'Processando',
        variant: 'secondary' as const,
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      };
    } else {
      return {
        label: 'Pendente',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      };
    }
  };

  const status = getStatus();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-xl leading-tight pr-4">
                {meeting.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={status.variant}
                  className={status.className}
                >
                  {status.label}
                </Badge>
                {meeting.transcriptions.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {meeting.transcriptions.length} transcrição{meeting.transcriptions.length > 1 ? 'ões' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {meeting.description && (
            <DialogDescription className="text-base leading-relaxed">
              {meeting.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Informações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Data</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(meeting.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Participantes</p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.participants.length || 'Não informado'}
                  </p>
                </div>
              </div>



              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {status.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participantes */}
          {meeting.participants.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Participantes</h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.participants.map((participant, index) => (
                    <Badge key={index} variant="secondary">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Transcrições */}
          {meeting.transcriptions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Transcrições</h3>
                <div className="space-y-2">
                  {meeting.transcriptions.map((transcription, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                          <Mic className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Transcrição {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transcription.created_at && formatDate(transcription.created_at)}
                          </p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Ações */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Criado em {formatDate(meeting.created_at)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button asChild>
                <Link to={`/meeting/${meeting.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver Detalhes Completos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingDetailsModal; 