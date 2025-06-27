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
    <div className="card-clean p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-subtitle">Atividade Recente</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredData.length > 0 ? 'Dias com atividade' : 'Últimos 7 dias'}
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
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: '#374151'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              formatter={(value, name) => [
                value,
                name === 'reunioes' ? 'Reuniões' : 'Transcrições'
              ]}
              labelFormatter={(label) => `Data: ${label}`}
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

      {/* Resumo rápido */}
      <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Total: {chartData.reduce((sum, item) => sum + item.reunioes, 0)} reuniões</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Total: {chartData.reduce((sum, item) => sum + item.transcricoes, 0)} transcrições</span>
        </div>
      </div>
    </div>
  );
};

export default StatsChart; 