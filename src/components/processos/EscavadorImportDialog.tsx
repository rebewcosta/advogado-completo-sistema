import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useEscavadorImport } from '@/hooks/useEscavadorImport';
import { useToast } from '@/hooks/use-toast';

interface EscavadorImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

const EscavadorImportDialog: React.FC<EscavadorImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const {
    isLoading,
    processosEncontrados,
    resultadoConsulta,
    consultarProcessosEscavador,
    importarProcessosSelecionados,
    limparResultados,
    checkImportLimit
  } = useEscavadorImport();

  const [processosSelecionados, setProcessosSelecionados] = useState<Set<string>>(new Set());
  const [etapa, setEtapa] = useState<'inicial' | 'resultados' | 'importando'>('inicial');
  const [oabDigitada, setOabDigitada] = useState('');
  const { toast } = useToast();

  const handleConsultar = async () => {
    if (!oabDigitada.trim()) {
      return;
    }

    // Verificar limite antes de tentar buscar
    const canImport = await checkImportLimit();
    if (!canImport) {
      toast({
        title: "Limite mensal atingido",
        description: "Você já utilizou a importação automática este mês. A importação do Escavador é limitada a 1 vez por mês. Para adicionar mais processos, use o botão \"Novo Processo\" que permite cadastro manual ilimitado.",
        variant: "destructive"
      });
      return;
    }
    
    setEtapa('inicial');
    setProcessosSelecionados(new Set());
    
    try {
      const resultado = await consultarProcessosEscavador(oabDigitada.trim());
      if (resultado && resultado.success) {
        setEtapa('resultados');
        // Selecionar todos os processos novos por padrão
        const todosNovos = new Set(processosEncontrados.map(p => p.numero_processo));
        setProcessosSelecionados(todosNovos);
      }
    } catch (error: any) {
      toast({
        title: "Erro na consulta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSelecionarProcesso = (numeroProcesso: string, selecionado: boolean) => {
    const novaSelecao = new Set(processosSelecionados);
    if (selecionado) {
      novaSelecao.add(numeroProcesso);
    } else {
      novaSelecao.delete(numeroProcesso);
    }
    setProcessosSelecionados(novaSelecao);
  };

  const handleSelecionarTodos = (selecionarTodos: boolean) => {
    if (selecionarTodos) {
      const todos = new Set(processosEncontrados.map(p => p.numero_processo));
      setProcessosSelecionados(todos);
    } else {
      setProcessosSelecionados(new Set());
    }
  };

  const handleImportar = async () => {
    const processosParaImportar = processosEncontrados.filter(p => 
      processosSelecionados.has(p.numero_processo)
    );

    if (processosParaImportar.length === 0) {
      return;
    }

    setEtapa('importando');
    const sucesso = await importarProcessosSelecionados(processosParaImportar);
    
    if (sucesso) {
      onImportComplete?.();
      handleFecharDialog();
    } else {
      setEtapa('resultados');
    }
  };

  const handleFecharDialog = () => {
    limparResultados();
    setProcessosSelecionados(new Set());
    setEtapa('inicial');
    setOabDigitada('');
    onOpenChange(false);
  };

  const renderEtapaInicial = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Importar Processos da OAB</h3>
        <p className="text-muted-foreground mb-4">
          Conecte-se ao Escavador para buscar automaticamente todos os processos associados ao seu número da OAB.
        </p>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="oab-input">Número da OAB</Label>
            <Input
              id="oab-input"
              type="text"
              placeholder="Ex: 123456/SP"
              value={oabDigitada}
              onChange={(e) => setOabDigitada(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Digite seu número da OAB no formato: número/estado (ex: 123456/SP).
              <br />
              <strong>Importante:</strong> A importação automática é limitada a 1 vez por mês. Para processos adicionais, use "Novo Processo".
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleConsultar}
        disabled={isLoading || !oabDigitada.trim()}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Consultando Escavador...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Buscar Processos
          </>
        )}
      </Button>
    </div>
  );

  const renderResultados = () => {
    if (!resultadoConsulta) return null;

    const todosSelecionados = processosEncontrados.length > 0 && 
      processosEncontrados.every(p => processosSelecionados.has(p.numero_processo));

    return (
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Consulta realizada com sucesso</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700">OAB:</span>
              <Badge variant="outline" className="ml-2">{resultadoConsulta.oab}</Badge>
            </div>
            <div>
              <span className="text-green-700">Total encontrados:</span>
              <Badge variant="secondary" className="ml-2">{resultadoConsulta.totalEncontrados}</Badge>
            </div>
            <div>
              <span className="text-green-700">Novos:</span>
              <Badge variant="default" className="ml-2">{resultadoConsulta.processosNovos}</Badge>
            </div>
            <div>
              <span className="text-green-700">Já existentes:</span>
              <Badge variant="outline" className="ml-2">{resultadoConsulta.processosExistentes}</Badge>
            </div>
          </div>
        </div>

        {processosEncontrados.length > 0 ? (
          <>
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Processos para importar:</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={todosSelecionados}
                    onCheckedChange={handleSelecionarTodos}
                  />
                  <label htmlFor="select-all" className="text-sm">
                    Selecionar todos
                  </label>
                </div>
              </div>

              <ScrollArea className="h-64 border rounded-lg p-3">
                <div className="space-y-2">
                  {processosEncontrados.map((processo) => (
                    <div key={processo.numero_processo} 
                         className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Checkbox
                        checked={processosSelecionados.has(processo.numero_processo)}
                        onCheckedChange={(checked) => 
                          handleSelecionarProcesso(processo.numero_processo, !!checked)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {processo.numero_processo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{processo.tipo_processo}</p>
                        {processo.vara_tribunal && (
                          <p className="text-xs text-gray-500">{processo.vara_tribunal}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={handleConsultar}
                disabled={isLoading || !oabDigitada.trim()}
                className="flex-1"
              >
                <Search className="w-4 h-4 mr-2" />
                Consultar Novamente
              </Button>
              <Button
                onClick={handleImportar}
                disabled={isLoading || processosSelecionados.size === 0}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Importar Selecionados ({processosSelecionados.size})
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Nenhum processo novo encontrado para importar.</p>
            <Button variant="outline" onClick={handleConsultar} disabled={isLoading || !oabDigitada.trim()}>
              Consultar Novamente
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderImportando = () => (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Importando Processos</h3>
        <p className="text-muted-foreground">
          Aguarde enquanto os processos selecionados são importados para sua conta...
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleFecharDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Importação Escavador</span>
          </DialogTitle>
          <DialogDescription>
            Importe automaticamente processos usando sua OAB através da plataforma Escavador.
          </DialogDescription>
        </DialogHeader>

        {etapa === 'inicial' && renderEtapaInicial()}
        {etapa === 'resultados' && renderResultados()}
        {etapa === 'importando' && renderImportando()}
      </DialogContent>
    </Dialog>
  );
};

export default EscavadorImportDialog;