import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusChart from "@/components/dashboard/StatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Droplets, AlertTriangle, CheckCircle, Wrench } from "lucide-react";

const Dashboard = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const storedPlants = JSON.parse(
      localStorage.getItem("hydroPlants") || "[]"
    );
    setPlants(storedPlants);
  }, []);

  const activeCount = plants.filter((p) => p.status === "activo").length;
  const maintenanceCount = plants.filter(
    (p) => p.status === "mantenimiento"
  ).length;
  const inactiveCount = plants.filter((p) => p.status === "inactivo").length;

  const stats = [
    {
      title: "Total de Plantas",
      value: plants.length,
      icon: <Droplets className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Plantas Activas",
      value: activeCount,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      title: "En Mantenimiento",
      value: maintenanceCount,
      icon: <Wrench className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Inactivas",
      value: inactiveCount,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Recursos Hidricos de SDE</title>
        <meta
          name="description"
          content="Panel de control para gestionar tus plantas hídricas"
        />
      </Helmet>

      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Vista general de tus plantas hídricas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StatusChart plants={plants} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <RecentActivity plants={plants} />
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
