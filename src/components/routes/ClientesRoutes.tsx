
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Clientes from "@/pages/ClientesPage";

const ClientesRoutes = () => {
  return (
    <>
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/novo"
        element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes/editar/:id"
        element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default ClientesRoutes;
