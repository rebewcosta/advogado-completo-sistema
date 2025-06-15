
import React from 'react';
import { SharedPageHeader } from '@/components/shared/SharedPageHeader';
import { PrazosPageContent } from '@/components/prazos/PrazosPageContent';

const PrazosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SharedPageHeader 
        title="Monitor de Prazos" 
        subtitle="Acompanhe e gerencie todos os seus prazos críticos"
      />
      <div className="p-6">
        <PrazosPageContent />
      </div>
    </div>
  );
};

export default PrazosPage;
