
import React from 'react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { PrazosPageContent } from '@/components/prazos/PrazosPageContent';
import { AlertTriangle } from 'lucide-react';

const PrazosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <SharedPageHeader 
          title="Monitor de Prazos" 
          description="Acompanhe e gerencie todos os seus prazos críticos"
          pageIcon={<AlertTriangle />}
        />
        <PrazosPageContent />
      </div>
    </div>
  );
};

export default PrazosPage;
