import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, DollarSign, Users, Scale, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProcessoDetalhesProps {
  processo: any;
  isSimulated?: boolean;
  message?: string;
}

const ProcessoDetalhes: React.FC<ProcessoDetalhesProps> = ({ processo, isSimulated, message }) => {
  return (
    <div className="space-y-6">
      {/* Aviso de dados simulados */}
      {isSimulated && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>ATENÇÃO:</strong> {message || "Estes são dados simulados para demonstração. Os dados reais não foram encontrados na API do CNJ."}
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Classe</p>
            <p className="font-medium">{processo.classe}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Tribunal</p>
            <p className="font-medium">{processo.tribunal} - {processo.comarca}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Data Ajuizamento</p>
            <p className="font-medium">{new Date(processo.data_ajuizamento).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Valor da Causa</p>
            <p className="font-medium">
              {processo.valor_causa ? 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(processo.valor_causa) : 
                'Não informado'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Órgão Julgador</p>
            <p className="font-medium">{processo.orgao_julgador}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <Badge variant={processo.status === 'Em andamento' ? 'default' : 'secondary'}>
            {processo.status}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Partes do Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Partes do Processo
            {isSimulated && <span className="text-red-500 ml-2">(DADOS SIMULADOS)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processo.partes?.map((parte: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{parte.tipo}</Badge>
                </div>
                <p className="font-medium">{parte.nome}</p>
                <p className="text-sm text-gray-500">{parte.documento}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advogados */}
      {processo.advogados && processo.advogados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Advogados
              {isSimulated && <span className="text-red-500 ml-2">(DADOS SIMULADOS)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processo.advogados.map((advogado: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <p className="font-medium">{advogado.nome}</p>
                  <p className="text-sm text-gray-500">OAB: {advogado.oab}</p>
                  <p className="text-sm text-gray-500">Representa: {advogado.parte}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise Jurimétrica */}
      {processo.jurimetria && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise Jurimétrica
            </CardTitle>
            <CardDescription>Insights automáticos baseados nos dados do processo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{processo.jurimetria.tempo_total_dias}</p>
                <p className="text-sm text-gray-500">Dias tramitando</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{processo.jurimetria.total_movimentacoes}</p>
                <p className="text-sm text-gray-500">Movimentações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{processo.jurimetria.tempo_medio_entre_movimentacoes}</p>
                <p className="text-sm text-gray-500">Dias médios entre movimentações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{processo.jurimetria.tempo_na_fase_atual}</p>
                <p className="text-sm text-gray-500">Dias na fase atual</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Fase Atual:</strong> {processo.jurimetria.fase_atual}
              </p>
              <p className="text-sm">
                <strong>Previsão de Sentença:</strong> {new Date(processo.jurimetria.previsao_sentenca).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Linha do Tempo - Movimentações
            {isSimulated && <span className="text-red-500 ml-2">(DADOS SIMULADOS)</span>}
          </CardTitle>
          <CardDescription>Histórico completo das movimentações processuais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processo.movimentacoes?.map((mov: any, index: number) => (
              <div key={index} className="flex gap-4 border-l-2 border-blue-200 pl-4 pb-4">
                <div className="flex-shrink-0 w-20 text-sm text-gray-500">
                  {new Date(mov.data).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{mov.descricao}</p>
                  {mov.observacao && (
                    <p className="text-sm text-gray-600 mt-1">{mov.observacao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessoDetalhes;
