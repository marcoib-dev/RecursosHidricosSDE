import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, color, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;