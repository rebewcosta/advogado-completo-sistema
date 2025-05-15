
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DocumentoWarning = () => {
  return (
    <Alert className="mb-6 border-yellow-300 bg-yellow-50">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-800 font-medium">Importante: Sobre o armazenamento de documentos</AlertTitle>
      <AlertDescription className="text-yellow-700">
        Esta área destina-se exclusivamente ao armazenamento de <strong>cópias</strong> digitais de documentos. 
        Por questões de segurança jurídica e boas práticas, os documentos originais físicos ou digitais devem sempre 
        ser mantidos pelo advogado em um repositório próprio e seguro, conforme exigido pela legislação vigente e 
        normas da OAB. O JusGestão funciona como um complemento ao seu sistema de arquivamento, não como substituto.
      </AlertDescription>
    </Alert>
  );
};

export default DocumentoWarning;
