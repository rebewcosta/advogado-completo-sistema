
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowStorageWarningProps {
  espacoDisponivel: number;
}

const LowStorageWarning: React.FC<LowStorageWarningProps> = ({ espacoDisponivel }) => {
  if (espacoDisponivel >= 1024) return null;
  
  return (
    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center text-amber-800">
      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
      <p className="text-sm">
        Você não tem espaço suficiente para enviar novos documentos. Exclua alguns documentos antigos para liberar espaço.
      </p>
    </div>
  );
};

export default LowStorageWarning;
