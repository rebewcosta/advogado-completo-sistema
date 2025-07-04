
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Processos from "@/pages/MeusProcessosPage";

const ProcessosRoutes = () => {
  return (
    <>
      <Route
        path="/processos"
        element={
          <ProtectedRoute>
            <Processos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processos/novo"
        element={
          <ProtectedRoute>
            <Processos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processos/editar/:id"
        element={
          <ProtectedRoute>
            <Processos />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default ProcessosRoutes;
