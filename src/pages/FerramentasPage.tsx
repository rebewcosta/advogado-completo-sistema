
import React from 'react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { PrazosCalculadora } from '@/components/prazos/PrazosCalculadora';
import { ConsultaCep } from '@/components/correios/ConsultaCep';
import { Wrench } from 'lucide-react';

const FerramentasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <SharedPageHeader 
          title="Ferramentas" 
          description="Acesse todas as ferramentas disponíveis para otimizar seu trabalho"
          pageIcon={<Wrench />}
        />
        
        <div className="space-y-6">
          <PrazosCalculadora />
          <ConsultaCep />
        </div>
      </div>
    </div>
  );
};

export default FerramentasPage;
