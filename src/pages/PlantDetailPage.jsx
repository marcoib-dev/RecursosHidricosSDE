import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PlantMap from '@/components/plants/PlantMap';
import FileUpload from '@/components/plants/FileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MapPin, User, Calendar, FileText, Edit, Trash2 } from 'lucide-react';

const PlantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plant, setPlant] = useState(null);

  useEffect(() => {
    const plants = JSON.parse(localStorage.getItem('hydroPlants') || '[]');
    const foundPlant = plants.find(p => p.id === id);
    if (foundPlant) {
      setPlant(foundPlant);
    } else {
      navigate('/plants');
    }
  }, [id, navigate]);

  const handleDelete = () => {
    const plants = JSON.parse(localStorage.getItem('hydroPlants') || '[]');
    const updatedPlants = plants.filter(p => p.id !== id);
    localStorage.setItem('hydroPlants', JSON.stringify(updatedPlants));
    toast({
      title: 'Planta eliminada',
      description: 'La planta ha sido eliminada correctamente',
    });
    navigate('/plants');
  };

  const handleFileUpload = (files) => {
    const plants = JSON.parse(localStorage.getItem('hydroPlants') || '[]');
    const updatedPlants = plants.map(p => {
      if (p.id === id) {
        return {
          ...p,
          files: [...(p.files || []), ...files]
        };
      }
      return p;
    });
    localStorage.setItem('hydroPlants', JSON.stringify(updatedPlants));
    setPlant(updatedPlants.find(p => p.id === id));
    toast({
      title: 'Archivos agregados',
      description: `Se han agregado ${files.length} archivo(s)`,
    });
  };

  if (!plant) {
    return null;
  }

  const statusColors = {
    activo: 'bg-green-100 text-green-800 border-green-200',
    mantenimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    inactivo: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <>
      <Helmet>
        <title>{plant.name} - HydroManager</title>
        <meta name="description" content={`Detalles de la planta hídrica ${plant.name}`} />
      </Helmet>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/plants')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Plantas
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/plants`)}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{plant.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{plant.location}</span>
                </div>
              </div>
              <Badge className={statusColors[plant.status]}>
                {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Responsable</p>
                    <p className="font-medium text-gray-900">{plant.responsible}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Última Inspección</p>
                    <p className="font-medium text-gray-900">
                      {new Date(plant.lastInspection).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Coordenadas</p>
                    <p className="font-medium text-gray-900">
                      {plant.coordinates.lat.toFixed(6)}, {plant.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {plant.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600">{plant.description}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PlantMap coordinates={plant.coordinates} name={plant.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FileUpload 
              plantId={plant.id} 
              files={plant.files || []} 
              onUpload={handleFileUpload}
            />
          </motion.div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PlantDetailPage;