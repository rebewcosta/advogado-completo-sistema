
import React from 'react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { PrazosCalculadora } from '@/components/prazos/PrazosCalculadora';
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
          
          {/* Aqui você pode adicionar a API dos Correios futuramente */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">API dos Correios</h3>
            <p className="text-gray-600">Consulta de CEP será implementada em breve.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FerramentasPage;
