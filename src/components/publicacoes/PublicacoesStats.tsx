
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Bell, Star, Settings } from 'lucide-react';

interface Publicacao {
  id: string;
  lida: boolean;
  importante: boolean;
}

interface ConfiguracaoMonitoramento {
  monitoramento_ativo: boolean;
}

interface PublicacoesStatsProps {
  publicacoes: Publicacao[];
  configuracao: ConfiguracaoMonitoramento | null;
}

const PublicacoesStats: React.FC<PublicacoesStatsProps> = ({ publicacoes, configuracao }) => {
  const totalNaoLidas = publicacoes.filter(p => !p.lida).length;
  const totalImportantes = publicacoes.filter(p => p.importante).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Publicações</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publicacoes.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
          <Bell className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{totalNaoLidas}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Importantes</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalImportantes}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monitoramento</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {configuracao?.monitoramento_ativo ? (
              <Badge variant="default" className="bg-green-100 text-green-700">Ativo</Badge>
            ) : (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicacoesStats;
