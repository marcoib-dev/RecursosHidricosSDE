import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, ChevronLeft, ChevronRight, Filter, X, Activity, User, Clock, Globe } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { auditoriaAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ENTIDAD_LABELS = {
  obra: 'Obra',
  archivo: 'Archivo',
  usuario: 'Usuario',
};

const ACCION_COLORS = {
  CREAR_OBRA: 'bg-green-100 text-green-700',
  EDITAR_OBRA: 'bg-blue-100 text-blue-700',
  ELIMINAR_OBRA: 'bg-red-100 text-red-700',
  SUBIR_ARCHIVO: 'bg-indigo-100 text-indigo-700',
  ELIMINAR_ARCHIVO: 'bg-red-100 text-red-700',
  CREAR_USUARIO: 'bg-emerald-100 text-emerald-700',
  CAMBIAR_ROL: 'bg-purple-100 text-purple-700',
  TOGGLE_ACTIVO: 'bg-yellow-100 text-yellow-700',
  RESETEAR_CONTRASENA: 'bg-orange-100 text-orange-700',
  CAMBIAR_CONTRASENA: 'bg-amber-100 text-amber-700',
  LOGIN: 'bg-cyan-100 text-cyan-700',
};

const ROL_COLORS = {
  administrador: 'text-red-600',
  presidente: 'text-purple-600',
  inspector: 'text-blue-600',
  dpto_construccion: 'text-orange-600',
  dpto_estudios: 'text-cyan-600',
  dpto_conservacion: 'text-green-600',
};

export default function AuditPage() {
  const { permisos } = useAuth();
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [filterEntidad, setFilterEntidad] = useState('all');

  // Redirect si no tiene permiso
  useEffect(() => {
    if (permisos && !permisos.verAuditoria) {
      navigate('/dashboard');
    }
  }, [permisos, navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchDebounced, filterEntidad]);

  // Cargar datos
  useEffect(() => {
    loadAuditoria();
  }, [page, searchDebounced, filterEntidad]);

  const loadAuditoria = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (searchDebounced) params.search = searchDebounced;
      if (filterEntidad !== 'all') params.entidad = filterEntidad;

      const data = await auditoriaAPI.list(params);
      setRegistros(data.registros);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error cargando auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseContexto = (contexto) => {
    try {
      return typeof contexto === 'string' ? JSON.parse(contexto) : contexto;
    } catch {
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" /> Registro de Auditoría
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} registro{total !== 1 ? 's' : ''} de actividad del sistema
            </p>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por acción o usuario..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={filterEntidad}
            onChange={(e) => setFilterEntidad(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">Todas las entidades</option>
            <option value="obra">Obras</option>
            <option value="archivo">Archivos</option>
            <option value="usuario">Usuarios</option>
          </select>
          {(search || filterEntidad !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterEntidad('all'); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No se encontraron registros</p>
              <p className="text-sm mt-1">Probá con otros filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Fecha</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Usuario</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Acción</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Entidad</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Detalles</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registros.map((reg, i) => {
                    const ctx = parseContexto(reg.contexto);
                    return (
                      <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {formatFecha(reg.fecha)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              {reg.usuario_nombre?.[0]}{reg.usuario_apellido?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {reg.usuario_nombre} {reg.usuario_apellido}
                              </p>
                              <p className={`text-xs ${ROL_COLORS[reg.usuario_rol] || 'text-gray-500'}`}>
                                {reg.usuario_rol?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${ACCION_COLORS[reg.titulo] || 'bg-gray-100 text-gray-600'}`}>
                            {reg.titulo?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ENTIDAD_LABELS[reg.entidad] || reg.entidad}
                          {reg.entidad_id && <span className="text-gray-400 ml-1">#{reg.entidad_id}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                          {ctx?.nombre || ctx?.correo || ctx?.filename || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {reg.ip_address || '—'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages} ({total} registros)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
