'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeightData } from '@/types';

interface WeightChartProps {
  data: WeightData[];
}

const PRIMARY_COLOR = '#3b82f6';

export default function WeightChart({ data }: WeightChartProps) {
  // Format data for percentage display
  const formattedData = data.map(item => ({
    ...item,
    percentage: (item.weight * 100).toFixed(1)
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 2</span>
        <h3 className="text-lg font-semibold text-[#111]">Adaptive Weighting</h3>
      </div>
      <p className="text-sm text-gray-500 mb-8 ml-[70px]">
        AI-calculated importance of each criteria based on the scholarship profile.
      </p>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="label" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Weight']}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
              }}
            />
            <Bar dataKey="weight" radius={[4, 4, 0, 0]} barSize={50}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PRIMARY_COLOR} fillOpacity={0.8 + (index * 0.02)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {formattedData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: PRIMARY_COLOR }}
            />
            <span className="text-xs text-gray-600">
              {item.label}: <strong className="text-gray-900">{item.percentage}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
