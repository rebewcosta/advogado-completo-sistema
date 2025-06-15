
import React from 'react';

export const FeaturesInfo: React.FC = () => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">Funcionalidades Disponíveis:</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• Converter texto para PDF</li>
        <li>• Converter HTML para PDF</li>
        <li>• Unir múltiplos PDFs em um arquivo</li>
        <li>• Dividir PDF em páginas separadas</li>
        <li>• Download automático dos arquivos convertidos</li>
      </ul>
    </div>
  );
};
