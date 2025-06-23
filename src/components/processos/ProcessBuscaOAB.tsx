
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProcessoBuscado {
  numero: string;
  tipo: string;
  vara: string;
  status: string;
  cliente?: string;
  dataDistribuicao?: string;
}

interface ProcessBuscaOABProps {
  onProcessSelect: (processo: ProcessoBuscado) => void;
  onClose: () => void;
}

const ProcessBuscaOAB: React.FC<ProcessBuscaOABProps> = ({ 
  onProcessSelect, 
  onClose 
}) => {
  const { toast } = useToast();
  const [numeroOAB, setNumeroOAB] = useState('');
  const [ufOAB, setUfOAB] = useState('');
  const [processos, setProcessos] = useState<ProcessoBuscado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const buscarProcessosPorOAB = async () => {
    if (!numeroOAB.trim() || !ufOAB.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe o número da OAB e a UF.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo_consulta: 'oab',
          oab_numero: numeroOAB.trim(),
          oab_uf: ufOAB.trim().toUpperCase()
        }
      });

      if (error) throw error;

      if (data?.processos && Array.isArray(data.processos)) {
        const processosFormatados: ProcessoBuscado[] = data.processos.map((p: any) => ({
          numero: p.numeroProcesso || p.numero || 'N/A',
          tipo: p.classeProcessual || p.tipo || 'Não informado',
          vara: p.orgaoJulgador || p.vara || 'Não informado',
          status: p.situacao || p.status || 'Em andamento',
          cliente: p.partes?.find((parte: any) => parte.tipo === 'REQUERENTE')?.nome || 'Não informado',
          dataDistribuicao: p.dataAjuizamento || p.dataDistribuicao
        }));

        setProcessos(processosFormatados);
        setBuscaRealizada(true);

        toast({
          title: "Busca concluída",
          description: `${processosFormatados.length} processo(s) encontrado(s) para OAB ${numeroOAB}/${ufOAB}.`
        });
      } else {
        setProcessos([]);
        setBuscaRealizada(true);
        toast({
          title: "Nenhum processo encontrado",
          description: `Não foram encontrados processos para OAB ${numeroOAB}/${ufOAB}.`
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar processos:', error);
      toast({
        title: "Erro na consulta",
        description: error.message || "Não foi possível consultar os processos via OAB.",
        variant: "destructive"
      });
      setProcessos([]);
      setBuscaRealizada(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarProcessosPorOAB();
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Processos por OAB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numeroOAB">Número da OAB *</Label>
              <Input
                id="numeroOAB"
                type="text"
                value={numeroOAB}
                onChange={(e) => setNumeroOAB(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: 123456"
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="ufOAB">UF *</Label>
              <Input
                id="ufOAB"
                type="text"
                value={ufOAB}
                onChange={(e) => setUfOAB(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Ex: SP"
                maxLength={2}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={buscarProcessosPorOAB}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {buscaRealizada && (
        <Card>
          <CardHeader>
            <CardTitle>
              Processos Encontrados ({processos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum processo encontrado para esta OAB.</p>
                <p className="text-sm mt-2">Tente uma nova busca ou cadastre manualmente.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {processos.map((processo, index) => (
                  <div 
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{processo.numero}</h4>
                        <p className="text-gray-600">{processo.cliente}</p>
                      </div>
                      <Badge 
                        variant={processo.status === 'Em andamento' ? 'default' : 'secondary'}
                      >
                        {processo.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <p><strong>Tipo:</strong> {processo.tipo}</p>
                      <p><strong>Vara:</strong> {processo.vara}</p>
                      {processo.dataDistribuicao && (
                        <p><strong>Data:</strong> {new Date(processo.dataDistribuicao).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onProcessSelect(processo)}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Cadastrar este Processo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Aqui poderia abrir um modal com mais detalhes
                          toast({
                            title: "Detalhes do processo",
                            description: `${processo.numero} - ${processo.tipo}`
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão para fechar */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar Busca por OAB
        </Button>
      </div>
    </div>
  );
};

export default ProcessBuscaOAB;
