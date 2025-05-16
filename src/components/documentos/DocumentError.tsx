
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface DocumentErrorProps {
  error: string | null;
}

const DocumentError: React.FC<DocumentErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro ao carregar documentos</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default DocumentError;
