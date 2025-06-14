
import React from 'react';
import { Settings } from 'lucide-react';
import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import ConfiguracoesTabs from '@/components/configuracoes/ConfiguracoesTabs';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const ConfiguracoesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Configurações"
          description="Personalize as configurações do sistema conforme suas necessidades."
          pageIcon={<Settings />}
        />

        <ConfiguracoesHeader />
        <ConfiguracoesTabs />
      </div>
      <Toaster />
    </div>
  );
};

export default ConfiguracoesPage;
