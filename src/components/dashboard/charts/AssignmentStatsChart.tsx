'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AssignmentStat } from '@/types/dashboard';

interface AssignmentStatsChartProps {
  data: AssignmentStat[];
}

const COLORS = {
  quiz: '#3b82f6',
  assignment: '#10b981',
  exam: '#f59e0b',
  lab: '#8b5cf6'
};

export default function AssignmentStatsChart({ data }: AssignmentStatsChartProps) {
  const chartData = data.map(stat => ({
    type: stat.type.charAt(0).toUpperCase() + stat.type.slice(1),
    count: stat.count,
    averageScore: stat.averageScore,
    completionRate: stat.completionRate
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="type" 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'averageScore') return [`${value}%`, 'Average Score'];
            if (name === 'completionRate') return [`${(value * 100).toFixed(1)}%`, 'Completion Rate'];
            return [value, name];
          }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.type.toLowerCase() as keyof typeof COLORS]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
