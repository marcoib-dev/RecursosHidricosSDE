import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PlantCard from "@/components/plants/PlantCard";
import PlantDialog from "@/components/plants/PlantDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Droplets } from "lucide-react";

const PlantsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [plants, searchTerm, statusFilter]);

  const loadPlants = () => {
    const storedPlants = JSON.parse(
      localStorage.getItem("hydroPlants") || "[]"
    );
    setPlants(storedPlants);
  };

  const filterPlants = () => {
    let filtered = [...plants];

    if (searchTerm) {
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plant.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((plant) => plant.status === statusFilter);
    }

    setFilteredPlants(filtered);
  };

  const handleSavePlant = (plantData) => {
    let updatedPlants;

    if (editingPlant) {
      updatedPlants = plants.map((p) =>
        p.id === editingPlant.id ? { ...plantData, id: editingPlant.id } : p
      );
      toast({
        title: "¡Planta actualizada!",
        description: "Los cambios se han guardado correctamente",
      });
    } else {
      const newPlant = {
        ...plantData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      updatedPlants = [...plants, newPlant];
      toast({
        title: "¡Planta creada!",
        description: "La nueva planta se ha agregado correctamente",
      });
    }

    localStorage.setItem("hydroPlants", JSON.stringify(updatedPlants));
    setPlants(updatedPlants);
    setIsDialogOpen(false);
    setEditingPlant(null);
  };

  const handleDeletePlant = (plantId) => {
    const updatedPlants = plants.filter((p) => p.id !== plantId);
    localStorage.setItem("hydroPlants", JSON.stringify(updatedPlants));
    setPlants(updatedPlants);
    toast({
      title: "Planta eliminada",
      description: "La planta ha sido eliminada correctamente",
    });
  };

  const handleEditPlant = (plant) => {
    setEditingPlant(plant);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Plantas Hídricas - Recursos Hidricos de SDE</title>
        <meta
          name="description"
          content="Gestiona todas tus plantas hídricas"
        />
      </Helmet>

      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Plantas Hídricas
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona todas tus instalaciones
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingPlant(null);
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Planta
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPlants.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plants.length === 0
                  ? "No hay plantas registradas"
                  : "No se encontraron resultados"}
              </h3>
              <p className="text-gray-600 mb-6">
                {plants.length === 0
                  ? "Comienza agregando tu primera planta hídrica"
                  : "Intenta con otros términos de búsqueda"}
              </p>
              {plants.length === 0 && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Planta
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlants.map((plant, index) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PlantCard
                    plant={plant}
                    onEdit={handleEditPlant}
                    onDelete={handleDeletePlant}
                    onClick={() => navigate(`/plants/${plant.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <PlantDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          plant={editingPlant}
          onSave={handleSavePlant}
        />
      </DashboardLayout>
    </>
  );
};

export default PlantsPage;
