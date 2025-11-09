import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react';

const PlantCard = ({ plant, onEdit, onDelete, onClick }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800 border-green-200',
    mantenimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactivo: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-cyan-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <MapPin className="w-16 h-16 text-white opacity-50" />
        </div>
        <Badge className={`absolute top-4 right-4 ${statusColors[plant.status]}`}>
          {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
        </Badge>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{plant.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{plant.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{plant.responsible}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{new Date(plant.lastInspection).toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(plant);
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plant.id);
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PlantCard;