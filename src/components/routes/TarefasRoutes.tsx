
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Tarefas from "@/pages/TarefasPage";

const TarefasRoutes = () => {
  return (
    <>
      <Route
        path="/tarefas"
        element={
          <ProtectedRoute>
            <Tarefas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tarefas/nova"
        element={
          <ProtectedRoute>
            <Tarefas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tarefas/editar/:id"
        element={
          <ProtectedRoute>
            <Tarefas />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default TarefasRoutes;
