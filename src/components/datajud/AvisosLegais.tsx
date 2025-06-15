
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, Info } from 'lucide-react';

const AvisosLegais: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>API Oficial CNJ:</strong> Sistema conectado à API pública oficial do DataJud CNJ. Todos os dados exibidos são reais e oficiais.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Não Substitui Intimações:</strong> Esta consulta NÃO SUBSTITUI as publicações e intimações oficiais dos tribunais.
        </AlertDescription>
      </Alert>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados em Tempo Real:</strong> As informações são obtidas diretamente da base oficial do CNJ, podendo haver pequeno atraso na atualização.
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados Públicos:</strong> As informações são de natureza pública, obtidas via API DataJud do CNJ conforme Lei de Acesso à Informação.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AvisosLegais;
