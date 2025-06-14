
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info, X } from 'lucide-react';

const estados = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

interface ConfiguracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nomesMonitoramento: string[];
  setNomesMonitoramento: (nomes: string[]) => void;
  estadosMonitoramento: string[];
  setEstadosMonitoramento: (estados: string[]) => void;
  palavrasChave: string[];
  setPalavrasChave: (palavras: string[]) => void;
  monitoramentoAtivo: boolean;
  setMonitoramentoAtivo: (ativo: boolean) => void;
  numerosOAB: string[];
  setNumerosOAB: (numeros: string[]) => void;
  nomesEscritorio: string[];
  setNomesEscritorio: (nomes: string[]) => void;
  onSave: () => void;
}

const ConfiguracaoDialog: React.FC<ConfiguracaoDialogProps> = ({
  open,
  onOpenChange,
  nomesMonitoramento,
  setNomesMonitoramento,
  estadosMonitoramento,
  setEstadosMonitoramento,
  palavrasChave,
  setPalavrasChave,
  monitoramentoAtivo,
  setMonitoramentoAtivo,
  numerosOAB,
  setNumerosOAB,
  nomesEscritorio,
  setNomesEscritorio,
  onSave
}) => {
  const handleRemoveNome = (index: number) => {
    if (nomesMonitoramento.length > 1) {
      const novosNomes = nomesMonitoramento.filter((_, i) => i !== index);
      setNomesMonitoramento(novosNomes);
    }
  };

  const handleRemoveOAB = (index: number) => {
    const novosNumeros = numerosOAB.filter((_, i) => i !== index);
    setNumerosOAB(novosNumeros);
  };

  const handleRemoveEscritorio = (index: number) => {
    const novosNomes = nomesEscritorio.filter((_, i) => i !== index);
    setNomesEscritorio(novosNomes);
  };

  const handleRemovePalavra = (index: number) => {
    if (palavrasChave.length > 1) {
      const novasPalavras = palavrasChave.filter((_, i) => i !== index);
      setPalavrasChave(novasPalavras);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
          <div className="h-full flex flex-col rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6">
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">Configurações de Monitoramento</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Configure filtros precisos para evitar capturar publicações de advogados 
                        com nomes similares. Use número da OAB para máxima precisão.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 -mr-2 -mt-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Campos do formulário */}
            <div className="bg-white mx-6 rounded-xl p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Status do Monitoramento */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="monitoramento-ativo"
                      checked={monitoramentoAtivo}
                      onCheckedChange={setMonitoramentoAtivo}
                    />
                    <Label htmlFor="monitoramento-ativo" className="font-medium text-gray-700">Monitoramento ativo</Label>
                  </div>
                </div>
                
                {/* Aviso sobre Filtros */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2">🎯 Filtros de Precisão</h3>
                  <p className="text-sm text-gray-600">
                    Para evitar capturar publicações de outros advogados com o mesmo nome, 
                    configure os filtros abaixo. O número da OAB é o mais eficaz.
                  </p>
                </div>

                {/* Nomes para Monitoramento */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">
                    📝 Nomes para monitoramento *
                  </Label>
                  <div className="space-y-2">
                    {nomesMonitoramento.map((nome, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={nome}
                          onChange={(e) => {
                            const novosNomes = [...nomesMonitoramento];
                            novosNomes[index] = e.target.value;
                            setNomesMonitoramento(novosNomes);
                          }}
                          placeholder="Nome completo do advogado"
                          className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveNome(index)}
                            disabled={nomesMonitoramento.length <= 1}
                            className="h-12 px-4"
                          >
                            Remover
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Pelo menos um nome é obrigatório para o monitoramento funcionar.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNomesMonitoramento([...nomesMonitoramento, ''])}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      Adicionar Nome
                    </Button>
                  </div>
                </div>

                {/* Números da OAB */}
                <div>
                  <Label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    ⚖️ Números da OAB (Recomendado) 
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Máxima Precisão</span>
                  </Label>
                  <p className="text-xs text-gray-600 mb-3">
                    Ex: "123.456/SP" ou "789.012/RJ" - Evita confusão com advogados de mesmo nome
                  </p>
                  <div className="space-y-2">
                    {numerosOAB.map((numero, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={numero}
                          onChange={(e) => {
                            const novosNumeros = [...numerosOAB];
                            novosNumeros[index] = e.target.value;
                            setNumerosOAB(novosNumeros);
                          }}
                          placeholder="Ex: 123.456/SP"
                          className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOAB(index)}
                          className="h-12 px-4"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumerosOAB([...numerosOAB, ''])}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      Adicionar Número OAB
                    </Button>
                  </div>
                </div>

                {/* Nomes de Escritórios */}
                <div>
                  <Label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    🏢 Nomes de Escritórios
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Filtro Adicional</span>
                  </Label>
                  <p className="text-xs text-gray-600 mb-3">
                    Ex: "Silva & Associados", "Costa Advocacia" - Ajuda a identificar o escritório
                  </p>
                  <div className="space-y-2">
                    {nomesEscritorio.map((nome, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={nome}
                          onChange={(e) => {
                            const novosNomes = [...nomesEscritorio];
                            novosNomes[index] = e.target.value;
                            setNomesEscritorio(novosNomes);
                          }}
                          placeholder="Nome do escritório ou sociedade"
                          className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEscritorio(index)}
                          className="h-12 px-4"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNomesEscritorio([...nomesEscritorio, ''])}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      Adicionar Escritório
                    </Button>
                  </div>
                </div>
                
                {/* Estados para Monitorar */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">
                    🗺️ Estados para monitorar (não marque nada para pesquisar em todos os estados)
                  </Label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {estados.map(estado => (
                      <div key={estado.uf} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={estado.uf}
                          checked={estadosMonitoramento.includes(estado.uf)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEstadosMonitoramento([...estadosMonitoramento, estado.uf]);
                            } else {
                              setEstadosMonitoramento(estadosMonitoramento.filter(uf => uf !== estado.uf));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={estado.uf} className="text-sm text-gray-700">{estado.uf}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Palavras-chave */}
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">
                    🔍 Palavras-chave adicionais
                  </Label>
                  <div className="space-y-2">
                    {palavrasChave.map((palavra, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={palavra}
                          onChange={(e) => {
                            const novasPalavras = [...palavrasChave];
                            novasPalavras[index] = e.target.value;
                            setPalavrasChave(novasPalavras);
                          }}
                          placeholder="Palavra-chave"
                          className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePalavra(index)}
                            disabled={palavrasChave.length <= 1}
                            className="h-12 px-4"
                          >
                            Remover
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Para remover uma palavra-chave, você precisa ter pelo menos duas palavras cadastradas.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPalavrasChave([...palavrasChave, ''])}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      Adicionar Palavra
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={onSave}
                  className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ConfiguracaoDialog;
