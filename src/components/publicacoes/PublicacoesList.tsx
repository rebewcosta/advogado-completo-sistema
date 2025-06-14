
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle>Publicações Encontradas ({publicacoes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {publicacoes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma publicação encontrada</p>
            <p className="text-sm mt-2">Configure o monitoramento para começar a receber publicações</p>
          </div>
        ) : (
          <div className="space-y-4">
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
