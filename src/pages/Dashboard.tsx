import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Mic,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMeeting } from '@/contexts/MeetingContext';
import StatsChart from '@/components/features/StatsChart';

const Dashboard: React.FC = () => {
  const {
    state: { meetings, dashboardStats, loading, error },
    loadMeetings,
    loadDashboardStats
  } = useMeeting();

  useEffect(() => {
    loadMeetings();
    loadDashboardStats();
  }, []);

  const recentMeetings = meetings.slice(0, 3);

  const getStatusInfo = (meeting: any) => {
    if (meeting.has_transcription && meeting.transcriptions?.length > 0) {
      return {
        icon: CheckCircle,
        label: 'Concluída',
        variant: 'default' as const,
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
      };
    } else if (meeting.has_transcription) {
      return {
        icon: Clock,
        label: 'Processando',
        variant: 'secondary' as const,
        className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
      };
    } else {
      return {
        icon: AlertCircle,
        label: 'Pendente',
        variant: 'outline' as const,
        className: 'text-slate-600 dark:text-slate-400'
      };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Usar dashboardStats se disponível, senão calcular localmente
  const stats = dashboardStats ? {
    total: dashboardStats.total_meetings,
    completed: dashboardStats.completed_transcriptions,
    processing: dashboardStats.processing_transcriptions
  } : {
    total: meetings.length,
    completed: meetings.filter(m => m.has_transcription && m.transcriptions?.length > 0).length,
    processing: meetings.filter(m => m.has_transcription && (!m.transcriptions || m.transcriptions.length === 0)).length
  };

  // Dados para o gráfico de pizza com gradientes e cores modernas
  const chartData = [
    {
      name: 'Transcritas',
      value: stats.completed,
      color: '#10B981',
      gradient: 'url(#completedGradient)',
      lightColor: '#34D399',
      darkColor: '#059669',
      percentage: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0'
    },
    {
      name: 'Processando',
      value: stats.processing,
      color: '#F59E0B',
      gradient: 'url(#processingGradient)',
      lightColor: '#FBBF24',
      darkColor: '#D97706',
      percentage: stats.total > 0 ? ((stats.processing / stats.total) * 100).toFixed(1) : '0'
    },
    {
      name: 'Pendentes',
      value: stats.total - stats.completed - stats.processing,
      color: '#6B7280',
      gradient: 'url(#pendingGradient)',
      lightColor: '#9CA3AF',
      darkColor: '#4B5563',
      percentage: stats.total > 0 ? (((stats.total - stats.completed - stats.processing) / stats.total) * 100).toFixed(1) : '0'
    }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-slate-900 dark:text-white">{data.name}</p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-900 dark:text-white">{data.value}</span> reuniões
            <span className="ml-2 font-medium">({data.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostrar label para fatias muito pequenas

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-slate-600 dark:text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie suas reuniões e transcrições
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Link to="/new-meeting">
            <Plus className="h-4 w-4 mr-2" />
            Nova Reunião
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Concluídas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Processando</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.processing}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Temporal */}
      {dashboardStats && dashboardStats.daily_stats && dashboardStats.daily_stats.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Atividade Temporal
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Reuniões criadas e transcritas por dia
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StatsChart data={dashboardStats.daily_stats} />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Pizza Moderno - Status das Reuniões */}
        <Card className="bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border-slate-200/60 dark:from-slate-900/80 dark:to-slate-800/80 dark:border-slate-700/60 shadow-2xl hover:shadow-3xl transition-all duration-500 hover-lift animate-chart-appear">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-float">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gradient">
                  Status das Reuniões
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">Distribuição por progresso</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="text-center py-12">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mx-auto flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhuma reunião
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Crie sua primeira reunião para ver as estatísticas
                </p>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link to="/new-meeting">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Reunião
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Gráfico Principal */}
                <div className="relative group">
                  <div className="h-72 relative overflow-hidden rounded-2xl">
                    {/* Efeito de brilho de fundo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-emerald-50/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-emerald-900/20 rounded-2xl"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34D399" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="processingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FBBF24" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                          <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9CA3AF" />
                            <stop offset="100%" stopColor="#4B5563" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={renderCustomLabel}
                          animationBegin={0}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.gradient}
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth={2}
                              style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Centro do gráfico com estatística principal */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full p-6 shadow-lg border border-slate-200/30 dark:border-slate-700/30">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {stats.total}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Reuniões
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legenda Moderna */}
                <div className="space-y-3 bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-800/60 dark:to-slate-700/40 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detalhamento</h4>
                  </div>
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${item.lightColor}, ${item.darkColor})`
                          }}
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {item.value}
                        </span>
                        <span className="text-sm font-medium text-white px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: item.color
                          }}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-slate-200/80 dark:bg-slate-900/70 dark:border-slate-700/80">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-slate-900 dark:text-white">
                Reuniões Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/meetings">
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {recentMeetings.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Nenhuma reunião
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Crie sua primeira reunião para começar
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Link to="/new-meeting">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Reunião
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMeetings.map((meeting) => {
                  const statusInfo = getStatusInfo(meeting);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={meeting.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              to={`/meeting/${meeting.id}`}
                              className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate group-hover:text-blue-600 transition-colors"
                            >
                              {meeting.title}
                            </Link>
                            <Badge
                              variant={statusInfo.variant}
                              className={`flex items-center gap-1 text-xs ${statusInfo.className}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(meeting.created_at)}
                            </div>
                            {meeting.transcriptions?.length > 0 && (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <FileText className="h-3 w-3" />
                                {meeting.transcriptions.length} transcrição{meeting.transcriptions.length !== 1 ? 'ões' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" asChild className="ml-4">
                          <Link to={`/meeting/${meeting.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 