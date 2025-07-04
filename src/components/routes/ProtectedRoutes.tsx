
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/DashboardPage";
import Configuracoes from "@/pages/ConfiguracoesPage";

const ProtectedRoutes = () => {
  return (
    <>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default ProtectedRoutes;
