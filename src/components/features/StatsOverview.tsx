import React from 'react';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import type { DashboardStats } from '@/types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  // Calcular estatísticas derivadas
  const totalDaysWithActivity = stats.daily_stats.filter(
    day => day.meetings_count > 0 || day.transcriptions_count > 0
  ).length;

  const averageMeetingsPerDay = totalDaysWithActivity > 0
    ? (stats.total_meetings / totalDaysWithActivity).toFixed(1)
    : '0';

  const transcriptionRate = stats.total_meetings > 0
    ? ((stats.total_transcriptions / stats.total_meetings) * 100).toFixed(0)
    : '0';

  // Encontrar o dia com mais atividade
  const mostActiveDay = stats.daily_stats.reduce((max, day) =>
    (day.meetings_count + day.transcriptions_count) > (max.meetings_count + max.transcriptions_count)
      ? day
      : max
    , stats.daily_stats[0]);

  const mostActiveDayTotal = mostActiveDay
    ? mostActiveDay.meetings_count + mostActiveDay.transcriptions_count
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Taxa de Transcrição */}
      <div className="card-clean p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Taxa de Transcrição
            </p>
            <p className="text-2xl font-bold text-green-600">
              {transcriptionRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total_transcriptions} de {stats.total_meetings} reuniões
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Dias Ativos */}
      <div className="card-clean p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Dias com Atividade
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {totalDaysWithActivity}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Média: {averageMeetingsPerDay} reuniões/dia
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Dia Mais Ativo */}
      <div className="card-clean p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Dia Mais Ativo
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {mostActiveDayTotal}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {mostActiveDay ? new Date(mostActiveDay.date).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview; 