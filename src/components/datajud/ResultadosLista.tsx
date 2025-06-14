
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin } from 'lucide-react';

interface ResultadosListaProps {
  resultados: any[];
}

const ResultadosLista: React.FC<ResultadosListaProps> = ({ resultados }) => {
  const handleVerDetalhes = (numeroProcesso: string) => {
    // Implementar navegação para consulta detalhada
    console.log('Ver detalhes do processo:', numeroProcesso);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Resultados da Busca
        </CardTitle>
        <CardDescription>
          {resultados.length} processo(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resultados.map((processo, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{processo.numero_processo}</h3>
                  <p className="text-gray-600">{processo.classe}</p>
                </div>
                <Badge variant={processo.status === 'Em andamento' ? 'default' : 'secondary'}>
                  {processo.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{processo.tribunal}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Ajuizado em {new Date(processo.data_ajuizamento).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVerDetalhes(processo.numero_processo)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultadosLista;
