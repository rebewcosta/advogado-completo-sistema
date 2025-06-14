
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Settings } from 'lucide-react';
import PublicacaoCard from './PublicacaoCard';

interface Publicacao {
  id: string;
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
  segredo_justica: boolean;
  lida: boolean;
  importante: boolean;
  observacoes?: string;
  created_at: string;
}

interface PublicacoesListProps {
  publicacoes: Publicacao[];
  onToggleLida: (id: string, currentStatus: boolean) => void;
  onToggleImportante: (id: string, currentStatus: boolean) => void;
}

const PublicacoesList: React.FC<PublicacoesListProps> = ({
  publicacoes,
  onToggleLida,
  onToggleImportante
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Publicações Encontradas ({publicacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {publicacoes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhuma publicação encontrada</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Para começar a receber publicações:</p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <Settings className="h-4 w-4" />
                <span>Configure o monitoramento e ative-o</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {publicacoes.map((publicacao) => (
              <PublicacaoCard
                key={publicacao.id}
                publicacao={publicacao}
                onToggleLida={onToggleLida}
                onToggleImportante={onToggleImportante}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicacoesList;
