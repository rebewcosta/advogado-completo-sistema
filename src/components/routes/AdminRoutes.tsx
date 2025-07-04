
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminRoute } from "@/components/AdminRoute";
import AdminPanelComplete from "@/components/admin/AdminPanelComplete";

const AdminRoutes = () => {
  return (
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminPanelComplete />
        </AdminRoute>
      }
    />
  );
};

export default AdminRoutes;
