
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Agenda from "@/pages/AgendaPage";

const AgendaRoutes = () => {
  return (
    <>
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda/novo"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda/editar/:id"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default AgendaRoutes;
