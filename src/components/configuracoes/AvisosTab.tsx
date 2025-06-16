
import React from 'react';
import PainelAdministrativo from '@/components/avisos/PainelAdministrativo';

const AvisosTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciar Avisos do Sistema
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Envie avisos e notificações para todos os usuários do sistema. 
          Os usuários verão os avisos em tempo real e podem marcá-los como lidos.
        </p>
      </div>
      
      <PainelAdministrativo />
    </div>
  );
};

export default AvisosTab;
