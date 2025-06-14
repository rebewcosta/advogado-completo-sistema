
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import ConfiguracoesTabs from '@/components/configuracoes/ConfiguracoesTabs';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const ConfiguracoesPage = () => {
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Mock save logic
    setTimeout(() => setSaving(false), 1000);
  };

  const handleSignOut = () => {
    setLoggingOut(true);
    // Mock sign out logic
    setTimeout(() => setLoggingOut(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Configurações"
          description="Personalize as configurações do sistema conforme suas necessidades."
          pageIcon={<Settings />}
        />

        <ConfiguracoesHeader 
          saving={saving}
          loggingOut={loggingOut}
          onSave={handleSave}
          onSignOut={handleSignOut}
        />
        <ConfiguracoesTabs />
      </div>
      <Toaster />
    </div>
  );
};

export default ConfiguracoesPage;
