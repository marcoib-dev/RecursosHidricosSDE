import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PlantDialog = ({ open, onOpenChange, plant, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'activo',
    responsible: '',
    lastInspection: new Date().toISOString().split('T')[0],
    coordinates: { lat: -34.6037, lng: -58.3816 },
    description: ''
  });

  useEffect(() => {
    if (plant) {
      setFormData(plant);
    } else {
      setFormData({
        name: '',
        location: '',
        status: 'activo',
        responsible: '',
        lastInspection: new Date().toISOString().split('T')[0],
        coordinates: { lat: -34.6037, lng: -58.3816 },
        description: ''
      });
    }
  }, [plant, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plant ? 'Editar Planta' : 'Nueva Planta Hídrica'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Planta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsable *</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastInspection">Última Inspección *</Label>
              <Input
                id="lastInspection"
                type="date"
                value={formData.lastInspection}
                onChange={(e) => setFormData({ ...formData, lastInspection: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lat">Latitud *</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) }
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitud *</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) }
                })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descripción detallada de la planta..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
              {plant ? 'Guardar Cambios' : 'Crear Planta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlantDialog;