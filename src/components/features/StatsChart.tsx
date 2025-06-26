import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/types';

interface StatsChartProps {
  data: DailyStats[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  // Formatar dados para o gráfico
  const chartData = data.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric'
    }),
    reunioes: stat.meetings_count,
    transcricoes: stat.transcriptions_count
  }));

  return (
    <div className="card-clean p-6">
      <h3 className="text-subtitle mb-4">Atividade dos Últimos 30 Dias</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)'
              }}
              labelStyle={{ color: 'var(--color-text)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="reunioes"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Reuniões"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="transcricoes"
              stroke="#10B981"
              strokeWidth={2}
              name="Transcrições"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart; 