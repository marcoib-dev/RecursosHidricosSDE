import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Layers, X, ChevronDown, Building2, Droplets } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/layout/DashboardLayout';
import { obrasAPI } from '../services/api';

// Colores por estado para los markers
const ESTADO_COLORS = {
  en_funcionamiento: '#22c55e',
  operativa: '#22c55e',
  en_construccion: '#f59e0b',
  en_reparacion: '#f97316',
  fuera_de_servicio: '#ef4444',
  planificada: '#6366f1',
};

const ESTADO_LABELS = {
  en_construccion: 'En construcción',
  en_funcionamiento: 'En funcionamiento',
  en_reparacion: 'En reparación',
  fuera_de_servicio: 'Fuera de servicio',
};

const TIPO_LABELS = {
  pozo: 'Pozo',
  planta: 'Planta',
};

function normalizeTipo(tipo) {
  const normalized = String(tipo || '').toLowerCase();
  if (normalized === 'planta_potabilizadora') return 'planta';
  return normalized;
}

// Crear icono SVG custom por color y tipo
function createColoredIcon(color, tipo = 'otro') {
  const normalizedType = normalizeTipo(tipo);
  const isPozo = normalizedType.includes('pozo');
  const iconColor = isPozo ? '#38bdf8' : '#22c55e';
  const iconSvg = isPozo
    ? `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
        <path d="M12 2C8.5 6 6 9.2 6 12.5A6 6 0 0 0 18 12.5C18 9.2 15.5 6 12 2Z" fill="#fff" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8.5 13.5c.6 1.4 1.8 2.2 3.5 2.2s2.9-.8 3.5-2.2" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `
    : `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
        <rect x="5" y="9" width="14" height="8" rx="1.5" fill="#fff" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7 9V6h7l3 3" fill="#fff" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 12h8" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 15h8" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="44">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="6.6" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.65)" stroke-width="0.8"/>
      <g transform="translate(4 4)">${iconSvg}</g>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [30, 44],
    iconAnchor: [15, 44],
    popupAnchor: [0, -44],
  });
}

// Componente para ajustar la vista del mapa a los markers
function FitBounds({ obras }) {
  const map = useMap();
  useEffect(() => {
    if (obras.length > 0) {
      const bounds = obras
        .filter((o) => o.latitud && o.longitud)
        .map((o) => [parseFloat(o.latitud), parseFloat(o.longitud)]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [obras, map]);
  return null;
}

export default function MapPage() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadObras();
  }, []);

  const loadObras = async () => {
    try {
      setLoading(true);
      const data = await obrasAPI.list();
      setObras(data.obras || data);
    } catch (err) {
      console.error('Error cargando obras:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obras con coordenadas y filtros aplicados
  const obrasEnMapa = useMemo(() => {
    return obras.filter((o) => {
      if (!o.latitud || !o.longitud) return false;
      if (filterEstado !== 'all' && o.estado !== filterEstado) return false;
      if (filterTipo !== 'all' && normalizeTipo(o.tipo) !== filterTipo) return false;
      return true;
    });
  }, [obras, filterEstado, filterTipo]);

  const obrasSinCoords = obras.filter((o) => !o.latitud || !o.longitud).length;

  // Contar por estado
  const conteoEstados = useMemo(() => {
    const c = {};
    obras.filter((o) => o.latitud && o.longitud).forEach((o) => {
      c[o.estado] = (c[o.estado] || 0) + 1;
    });
    return c;
  }, [obras]);

  // Centro default: Santiago del Estero, Argentina
  const defaultCenter = [-27.7833, -64.2667];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-1 pb-4 flex-shrink-0"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" /> Mapa de Obras Hídricas
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {obrasEnMapa.length} obra{obrasEnMapa.length !== 1 ? 's' : ''} en el mapa
              {obrasSinCoords > 0 && <span className="text-amber-600 ml-2">• {obrasSinCoords} sin coordenadas</span>}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {(filterEstado !== 'all' || filterTipo !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>
        </motion.div>

        {/* Filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3 px-1 pb-4 flex-shrink-0"
          >
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} ({conteoEstados[k] || 0})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(TIPO_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {(filterEstado !== 'all' || filterTipo !== 'all') && (
              <button
                onClick={() => { setFilterEstado('all'); setFilterTipo('all'); }}
                className="self-end flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar
              </button>
            )}
          </motion.div>
        )}

        {/* Mapa */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds obras={obrasEnMapa} />

              {obrasEnMapa.map((obra) => (
                <Marker
                  key={obra.id}
                  position={[parseFloat(obra.latitud), parseFloat(obra.longitud)]}
                  icon={createColoredIcon(ESTADO_COLORS[obra.estado] || '#6b7280', obra.tipo)}
                >
                  <Popup maxWidth={280}>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-base text-gray-900 mb-1">{obra.nombre}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{TIPO_LABELS[obra.tipo] || obra.tipo}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{obra.localidad || obra.ubicacion || '—'}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ESTADO_COLORS[obra.estado] }}
                          />
                          <span className="font-medium" style={{ color: ESTADO_COLORS[obra.estado] }}>
                            {ESTADO_LABELS[obra.estado] || obra.estado}
                          </span>
                        </div>
                        {obra.porcentaje_avance != null && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                              <span>Avance</span>
                              <span>{obra.porcentaje_avance}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${obra.porcentaje_avance}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <a
                          href={`/plantas/${obra.id}`}
                          className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalle →
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Leyenda */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
            <div className="space-y-1">
              {[
                ['en_funcionamiento', 'En funcionamiento'],
                ['en_construccion', 'En construcción'],
                ['en_reparacion', 'En reparación'],
                ['fuera_de_servicio', 'Fuera de servicio'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
                  <span
                    className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: ESTADO_COLORS[key] }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
