
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ConfiguracoesContent from '@/components/configuracoes/ConfiguracoesContent';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState("perfil");

  return (
    <AdminLayout>
      <ConfiguracoesContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </AdminLayout>
  );
};

export default ConfiguracoesPage;
