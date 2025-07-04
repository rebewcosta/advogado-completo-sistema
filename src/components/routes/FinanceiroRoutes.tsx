
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Financeiro from "@/pages/FinanceiroPage";

const FinanceiroRoutes = () => {
  return (
    <>
      <Route
        path="/financeiro"
        element={
          <ProtectedRoute>
            <Financeiro />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/novo"
        element={
          <ProtectedRoute>
            <Financeiro />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro/editar/:id"
        element={
          <ProtectedRoute>
            <Financeiro />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default FinanceiroRoutes;
