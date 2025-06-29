import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyStats } from '@/types';

interface StatsChartProps {
  data: DailyStats[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  // Filtrar apenas os últimos 15 dias com dados ou os dias mais relevantes
  const filteredData = data.filter(stat =>
    stat.meetings_count > 0 || stat.transcriptions_count > 0
  );

  // Se não há dados com atividade, mostrar os últimos 7 dias
  const chartData = (filteredData.length > 0 ? filteredData : data.slice(-7)).map(stat => ({
    date: new Date(stat.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }),
    fullDate: stat.date,
    reunioes: stat.meetings_count,
    transcricoes: stat.transcriptions_count
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {filteredData.length > 0 ? `${filteredData.length} dias com atividade` : 'Últimos 7 dias'}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Reuniões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Transcrições</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickLine={{ stroke: '#d1d5db' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, #ffffff)',
                border: '1px solid var(--tooltip-border, #e5e7eb)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--tooltip-text, #374151)'
              }}
              labelStyle={{ color: 'var(--tooltip-text, #374151)', fontWeight: 'bold' }}
              formatter={(value, name) => [
                value,
                name === 'reunioes' ? 'Reuniões' : 'Transcrições'
              ]}
              labelFormatter={(label) => `Data: ${label}`}
              wrapperStyle={{
                '--tooltip-bg': 'rgb(255, 255, 255)',
                '--tooltip-border': 'rgb(229, 231, 235)',
                '--tooltip-text': 'rgb(55, 65, 81)'
              } as React.CSSProperties}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            <Line
              type="monotone"
              dataKey="reunioes"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Reuniões"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
            />
            <Line
              type="monotone"
              dataKey="transcricoes"
              stroke="#10B981"
              strokeWidth={3}
              name="Transcrições"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo rápido com estatísticas do período */}
      <div className="mt-4 flex justify-center space-x-8 text-sm text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {chartData.reduce((sum, item) => sum + item.reunioes, 0)}
            </span> reuniões no período
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {chartData.reduce((sum, item) => sum + item.transcricoes, 0)}
            </span> transcrições no período
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsChart; 