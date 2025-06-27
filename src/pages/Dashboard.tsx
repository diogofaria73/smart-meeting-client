import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Mic,
  Users,
  Clock,
  Calendar,
  ArrowRight,
  Activity,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMeeting } from '@/contexts/MeetingContext';
import MeetingCard from '@/components/features/MeetingCard';
import StatsCards from '@/components/features/StatsCards';

const Dashboard: React.FC = () => {
  const {
    state: { meetings, dashboardStats, loading, error },
    loadMeetings,
    loadDashboardStats
  } = useMeeting();

  useEffect(() => {
    loadMeetings();
    loadDashboardStats();
  }, [loadMeetings, loadDashboardStats]);

  const recentMeetings = meetings.slice(0, 3);

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Carregando dados...</span>
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
              <h3 className="font-semibold text-destructive">Erro ao carregar dados</h3>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Bem-vindo de volta!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Gerencie suas reuniões e transforme conversas em insights valiosos
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date().toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Sistema online</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <Button asChild size="lg" className="gap-2">
                <Link to="/new-meeting">
                  <Plus className="h-4 w-4" />
                  Nova Reunião
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      {dashboardStats && <StatsCards stats={dashboardStats} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create New Meeting */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mx-auto">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl mb-2">
                Criar Nova Reunião
              </CardTitle>
              <CardDescription className="text-base">
                Inicie uma nova sessão de gravação e transcrição automática
              </CardDescription>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link to="/new-meeting">
                Começar Agora
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Reuniões Recentes
                </CardTitle>
                <CardDescription>
                  Suas últimas reuniões e transcrições
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/meetings">
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentMeetings.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma reunião ainda
                </h4>
                <p className="text-muted-foreground mb-6">
                  Comece criando sua primeira reunião
                </p>
                <Button asChild>
                  <Link to="/new-meeting">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Reunião
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <Link
                          to={`/meeting/${meeting.id}`}
                          className="font-medium text-foreground hover:text-primary line-clamp-1"
                        >
                          {meeting.title}
                        </Link>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(meeting.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meeting.participants.length} participantes
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={meeting.has_transcription && meeting.transcriptions.length > 0 ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {meeting.has_transcription && meeting.transcriptions.length > 0 ? 'Transcrita' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Gerenciar Reuniões</h3>
                <p className="text-sm text-muted-foreground">Ver todas as reuniões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Transcrições</h3>
                <p className="text-sm text-muted-foreground">Revisar transcrições</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Análises</h3>
                <p className="text-sm text-muted-foreground">Ver insights e relatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 