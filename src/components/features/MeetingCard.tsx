import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Users,
  Mic,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MeetingWithTranscriptions } from '@/types';

interface MeetingCardProps {
  meeting: MeetingWithTranscriptions;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
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
        label: 'Criada',
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      };
    }
  };

  const status = getStatus();

  return (
    <Link to={`/meeting/${meeting.id}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 group-hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <Badge
              variant={status.variant}
              className={status.className}
            >
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <CardTitle className="line-clamp-2 text-base leading-tight">
              {meeting.title}
            </CardTitle>
            {meeting.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {meeting.description}
              </CardDescription>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(meeting.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{meeting.participants.length} participantes</span>
            </div>
            {meeting.transcriptions.length > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <Mic className="h-4 w-4" />
                <span>{meeting.transcriptions.length} transcrição{meeting.transcriptions.length > 1 ? 'ões' : ''}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MeetingCard; 