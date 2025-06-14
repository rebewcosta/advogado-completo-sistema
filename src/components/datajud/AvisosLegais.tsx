
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, Clock, FileX } from 'lucide-react';

const AvisosLegais: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados Públicos:</strong> As informações são de natureza pública, obtidas via API DataJud do CNJ.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Não Substitui Intimações:</strong> Esta consulta NÃO SUBSTITUI as publicações e intimações oficiais.
        </AlertDescription>
      </Alert>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Possível Atraso:</strong> Pode haver atraso entre a atualização no tribunal e a exibição aqui.
        </AlertDescription>
      </Alert>

      <Alert>
        <FileX className="h-4 w-4" />
        <AlertDescription>
          <strong>Sem Acesso ao Teor:</strong> A ferramenta não exibe o conteúdo das decisões ou documentos.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AvisosLegais;
