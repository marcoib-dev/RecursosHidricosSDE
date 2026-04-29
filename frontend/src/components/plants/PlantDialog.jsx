import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultForm = {
  tipo: 'pozo',
  nombre: '',
  ubicacion: '',
  empresa: '',
  responsable: '',
  estado: 'en_construccion',
  anio: new Date().getFullYear(),
  latitud: -27.7833,
  longitud: -64.2667,
  descripcion: '',
  porcentaje_avance: 0,
  localidad: '',
  // Campos específicos de pozo
  profundidad: '',
  caudal: '',
  tipo_bomba: '',
  contaminantes: '',
  // Campos específicos de planta
  tratamiento: '',
  capacidad: '',
  fuente: '',
};

const PlantDialog = ({ open, onOpenChange, plant, onSave }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plant) {
      setFormData({
        ...defaultForm,
        ...plant,
        latitud: plant.latitud || defaultForm.latitud,
        longitud: plant.longitud || defaultForm.longitud,
        // Datos específicos que vienen del sub-objeto
        profundidad: plant.pozo?.profundidad || plant.profundidad || '',
        caudal: plant.pozo?.caudal || plant.caudal || '',
        tipo_bomba: plant.pozo?.tipo_bomba || plant.tipo_bomba || '',
        contaminantes: plant.pozo?.contaminantes || plant.contaminantes || '',
        tratamiento: plant.planta?.tratamiento || plant.tratamiento || '',
        capacidad: plant.planta?.capacidad || plant.capacidad || '',
        fuente: plant.planta?.fuente || plant.fuente || '',
      });
    } else {
      setFormData(defaultForm);
    }
  }, [plant, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plant ? 'Editar Obra' : 'Nueva Obra Hídrica'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Obra *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pozo">Pozo</SelectItem>
                  <SelectItem value="planta">Planta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input
                id="localidad"
                value={formData.localidad}
                onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_construccion">En Construcción</SelectItem>
                  <SelectItem value="en_funcionamiento">En Funcionamiento</SelectItem>
                  <SelectItem value="en_reparacion">En Reparación</SelectItem>
                  <SelectItem value="fuera_de_servicio">Fuera de Servicio</SelectItem>
                  <SelectItem value="en_estudio">En Estudio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentaje_avance">% Avance</Label>
              <Input
                id="porcentaje_avance"
                type="number"
                min="0"
                max="100"
                value={formData.porcentaje_avance}
                onChange={(e) => setFormData({ ...formData, porcentaje_avance: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitud">Latitud</Label>
              <Input
                id="latitud"
                type="number"
                step="any"
                value={formData.latitud}
                onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud</Label>
              <Input
                id="longitud"
                type="number"
                step="any"
                value={formData.longitud}
                onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Campos específicos de Pozo */}
          {formData.tipo === 'pozo' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Datos del Pozo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profundidad">Profundidad (m)</Label>
                  <Input
                    id="profundidad"
                    type="number"
                    step="any"
                    value={formData.profundidad}
                    onChange={(e) => setFormData({ ...formData, profundidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caudal">Caudal (m³/h)</Label>
                  <Input
                    id="caudal"
                    type="number"
                    step="any"
                    value={formData.caudal}
                    onChange={(e) => setFormData({ ...formData, caudal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_bomba">Tipo de Bomba</Label>
                  <Input
                    id="tipo_bomba"
                    value={formData.tipo_bomba}
                    onChange={(e) => setFormData({ ...formData, tipo_bomba: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contaminantes">Contaminantes</Label>
                  <Input
                    id="contaminantes"
                    value={formData.contaminantes}
                    onChange={(e) => setFormData({ ...formData, contaminantes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos de Planta */}
          {formData.tipo === 'planta' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Datos de la Planta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tratamiento">Tratamiento</Label>
                  <Input
                    id="tratamiento"
                    value={formData.tratamiento}
                    onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad (m³/día)</Label>
                  <Input
                    id="capacidad"
                    type="number"
                    step="any"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuente">Fuente de Agua</Label>
                  <Input
                    id="fuente"
                    value={formData.fuente}
                    onChange={(e) => setFormData({ ...formData, fuente: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
              placeholder="Descripción detallada de la obra..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
            >
              {saving ? 'Guardando...' : plant ? 'Guardar Cambios' : 'Crear Obra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlantDialog;