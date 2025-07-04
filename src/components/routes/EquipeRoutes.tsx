
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Equipe from "@/pages/EquipePage";

const EquipeRoutes = () => {
  return (
    <>
      <Route
        path="/equipe"
        element={
          <ProtectedRoute>
            <Equipe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipe/novo"
        element={
          <ProtectedRoute>
            <Equipe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipe/editar/:id"
        element={
          <ProtectedRoute>
            <Equipe />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default EquipeRoutes;
