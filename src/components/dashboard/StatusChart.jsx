import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatusChart = ({ plants }) => {
  const data = [
    { name: 'Activo', value: plants.filter(p => p.status === 'activo').length, color: '#10b981' },
    { name: 'Mantenimiento', value: plants.filter(p => p.status === 'mantenimiento').length, color: '#f59e0b' },
    { name: 'Inactivo', value: plants.filter(p => p.status === 'inactivo').length, color: '#ef4444' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Plantas</h3>
      {plants.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No hay datos para mostrar
        </div>
      )}
    </div>
  );
};

export default StatusChart;