
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from "@/components/ProtectedRoute";
import Fontes from "@/pages/PublicacoesPage";
import Documentos from "@/pages/DocumentosPage";
import Prazos from "@/pages/PrazosPage";
import Favoritos from "@/pages/DataJudPage";
import Publicacoes from "@/pages/PublicacoesPage";
import Consultas from "@/pages/DataJudPage";

const OtherRoutes = () => {
  return (
    <>
      <Route
        path="/fontes"
        element={
          <ProtectedRoute>
            <Fontes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fontes/novo"
        element={
          <ProtectedRoute>
            <Fontes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fontes/editar/:id"
        element={
          <ProtectedRoute>
            <Fontes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documentos"
        element={
          <ProtectedRoute>
            <Documentos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documentos/novo"
        element={
          <ProtectedRoute>
            <Documentos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prazos"
        element={
          <ProtectedRoute>
            <Prazos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prazos/novo"
        element={
          <ProtectedRoute>
            <Prazos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prazos/editar/:id"
        element={
          <ProtectedRoute>
            <Prazos />
          </ProtectedRoute>
        }
      />

      <Route
        path="/favoritos"
        element={
          <ProtectedRoute>
            <Favoritos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publicacoes"
        element={
          <ProtectedRoute>
            <Publicacoes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultas"
        element={
          <ProtectedRoute>
            <Consultas />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default OtherRoutes;
