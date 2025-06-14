
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import PublicacaoCard from './PublicacaoCard';
import { Publicacao } from '@/types/publicacoes';

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
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="text-lg text-gray-800 font-semibold">
          Publicações Encontradas ({publicacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {publicacoes.length === 0 ? (
          <div className="text-center py-16 flex flex-col justify-center items-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full mb-4">
              <FileText className="h-16 w-16 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">Nenhuma publicação encontrada</p>
            <p className="text-sm text-gray-500">Configure o monitoramento para começar a receber publicações</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {publicacoes.map((publicacao, index) => (
              <div 
                key={publicacao.id}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PublicacaoCard
                  publicacao={publicacao}
                  onToggleLida={onToggleLida}
                  onToggleImportante={onToggleImportante}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicacoesList;
