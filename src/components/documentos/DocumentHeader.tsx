
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DocumentHeaderProps {
  onUploadClick: () => void;
  isLoading: boolean;
  espacoDisponivel: number;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ onUploadClick, isLoading, espacoDisponivel }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Documentos</h1>
        <div className="text-gray-600">
          <span className="block sm:inline">Gerencie todos os documentos</span>
          <span className="block sm:inline sm:ml-1">do seu escritório</span>
        </div>
      </div>
      <Button 
        onClick={onUploadClick} 
        className="bg-lawyer-primary hover:bg-lawyer-primary/90"
        disabled={isLoading || espacoDisponivel < 1024} // Desabilitar se menos de 1KB disponível
      >
        <Upload className="mr-2 h-4 w-4" />
        Enviar Documento
      </Button>
    </div>
  );
};

export default DocumentHeader;
