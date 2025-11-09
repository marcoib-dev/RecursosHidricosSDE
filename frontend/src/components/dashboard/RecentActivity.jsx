import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const RecentActivity = ({ plants }) => {
  const sortedPlants = [...plants]
    .sort((a, b) => new Date(b.lastInspection) - new Date(a.lastInspection))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspecciones Recientes</h3>
      {sortedPlants.length > 0 ? (
        <div className="space-y-4">
          {sortedPlants.map((plant) => (
            <div key={plant.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{plant.name}</p>
                <p className="text-sm text-gray-500 truncate">{plant.location}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(plant.lastInspection).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No hay actividad reciente
        </div>
      )}
    </div>
  );
};

export default RecentActivity;