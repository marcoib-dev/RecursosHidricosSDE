import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRolLabel } from "@/lib/permissions";
import { notificacionesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Droplet, Menu, X, LogOut, Users, ShieldCheck, MapPin, User, Shield, Bell, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../icons/logo.svg";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permisos, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalAlertas, setTotalAlertas] = useState(0);

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const data = await notificacionesAPI.get();
        setTotalAlertas(data.totalAlertas || 0);
      } catch (e) {
        // silencioso
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 60000); // cada 60s
    return () => clearInterval(interval);
  }, []);

  // Menú dinámico según permisos
  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
      visible: true,
    },
    {
      icon: <Droplet className="w-5 h-5" />,
      label: "Obras",
      path: "/plantas",
      visible: true,
      badge: totalAlertas > 0 ? totalAlertas : null,
      badgeColor: 'bg-red-500',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Mapa",
      path: "/mapa",
      visible: true,
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Mi Perfil",
      path: "/perfil",
      visible: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Usuarios",
      path: "/usuarios",
      visible: permisos?.gestionarUsuarios,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Auditoría",
      path: "/auditoria",
      visible: permisos?.verAuditoria,
    },
  ].filter(item => item.visible);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <div className="flex items-center space-x-2 ml-2 lg:ml-0">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <img src={Logo} alt="Logo" width={32} height={32} />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Recursos Hidricos de SDE
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification bell */}
              {totalAlertas > 0 && (
                <button
                  onClick={() => navigate('/plantas')}
                  className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title={`${totalAlertas} alerta(s)`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {totalAlertas}
                  </span>
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white">
                        {getInitials(user?.nombre_completo || user?.nombre || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
                      <p className="text-xs text-gray-500">{user?.correo}</p>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-cyan-600" />
                        <p className="text-xs text-cyan-600 font-semibold">
                          {getRolLabel(user?.rol)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`${item.badgeColor || 'bg-red-500'} text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              permisos?.gestionarUsuarios ? 'bg-gradient-to-br from-purple-600 to-indigo-600' :
              permisos?.eliminarObra ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
              'bg-gradient-to-br from-cyan-600 to-teal-600'
            }`}>
              {getInitials(user?.nombre_completo || user?.nombre || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.nombre} {user?.apellido}</p>
              <p className={`text-xs font-semibold ${
                permisos?.gestionarUsuarios ? 'text-purple-600' :
                permisos?.eliminarObra ? 'text-amber-600' :
                'text-cyan-600'
              }`}>
                {getRolLabel(user?.rol)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
