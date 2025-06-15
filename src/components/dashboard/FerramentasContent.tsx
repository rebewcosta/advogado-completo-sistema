
import React from 'react';
import { PrazosCalculadora } from '@/components/prazos/PrazosCalculadora';

const FerramentasContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ferramentas</h2>
        <p className="text-gray-600">Acesse todas as ferramentas disponíveis para otimizar seu trabalho.</p>
      </div>
      
      <PrazosCalculadora />
    </div>
  );
};

export default FerramentasContent;
