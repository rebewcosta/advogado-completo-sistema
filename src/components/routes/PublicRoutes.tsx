
import React from 'react';
import { Route } from 'react-router-dom';
import Index from "@/pages/Index";
import Login from "@/pages/LoginPage";
import Register from "@/pages/CadastroPage";
import PasswordReset from "@/pages/RecuperarSenhaPage";
import NotFound from "@/pages/NotFound";

const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};

export default PublicRoutes;
