
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import ConfiguracoesContent from '@/components/configuracoes/ConfiguracoesContent';

const ConfiguracoesPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
