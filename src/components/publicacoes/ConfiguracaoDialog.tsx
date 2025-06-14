
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurações de Monitoramento</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="monitoramento-ativo"
              checked={monitoramentoAtivo}
              onCheckedChange={setMonitoramentoAtivo}
            />
            <Label htmlFor="monitoramento-ativo">Monitoramento ativo</Label>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Nomes para monitoramento</Label>
            <div className="space-y-2 mt-2">
              {nomesMonitoramento.map((nome, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={nome}
                    onChange={(e) => {
                      const novosNomes = [...nomesMonitoramento];
                      novosNomes[index] = e.target.value;
                      setNomesMonitoramento(novosNomes);
                    }}
                    placeholder="Nome do advogado"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (nomesMonitoramento.length > 1) {
                        setNomesMonitoramento(nomesMonitoramento.filter((_, i) => i !== index));
                      }
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNomesMonitoramento([...nomesMonitoramento, ''])}
              >
                Adicionar Nome
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Estados para monitorar (vazio = todos)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
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
                  />
                  <Label htmlFor={estado.uf} className="text-sm">{estado.uf}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Palavras-chave adicionais</Label>
            <div className="space-y-2 mt-2">
              {palavrasChave.map((palavra, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={palavra}
                    onChange={(e) => {
                      const novasPalavras = [...palavrasChave];
                      novasPalavras[index] = e.target.value;
                      setPalavrasChave(novasPalavras);
                    }}
                    placeholder="Palavra-chave"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (palavrasChave.length > 1) {
                        setPalavrasChave(palavrasChave.filter((_, i) => i !== index));
                      }
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPalavrasChave([...palavrasChave, ''])}
              >
                Adicionar Palavra
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSave}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracaoDialog;
