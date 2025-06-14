
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StatusTarefa, PrioridadeTarefa } from '@/types/tarefas';
import type { TarefaFormData } from '@/hooks/useTarefas';

interface TarefaFormProps {
  initialData?: Partial<TarefaFormData> & { id?: string } | null;
  onSave: (data: TarefaFormData) => Promise<boolean>;
  onCancel: () => void;
  processos: Array<{ id: string; numero_processo: string }>;
  clientes: Array<{ id: string; nome: string }>;
  isLoadingDropdownData: boolean;
  isSubmitting: boolean;
}

const TarefaForm: React.FC<TarefaFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel, 
  processos, 
  clientes, 
  isLoadingDropdownData, 
  isSubmitting 
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState<string>('');
  const [status, setStatus] = useState<StatusTarefa>('Pendente');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('Média');
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>(undefined);
  const [processoId, setProcessoId] = useState<string>('none');
  const [clienteId, setClienteId] = useState<string>('none');

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || '');
      setDescricao(initialData.descricao || '');
      setStatus(initialData.status || 'Pendente');
      setPrioridade(initialData.prioridade || 'Média');
      setDataVencimento(initialData.data_conclusao ? new Date(initialData.data_conclusao) : undefined);
      setProcessoId(initialData.processo_id || 'none');
      setClienteId(initialData.cliente_id || 'none');
    } else {
      setTitulo('');
      setDescricao('');
      setStatus('Pendente');
      setPrioridade('Média');
      setDataVencimento(undefined);
      setProcessoId('none');
      setClienteId('none');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const data: TarefaFormData = {
      titulo,
      descricao: descricao || null,
      status,
      prioridade,
      data_conclusao: dataVencimento ? format(dataVencimento, 'yyyy-MM-dd', { locale: ptBR }) : null,
      processo_id: processoId === 'none' ? null : processoId,
      cliente_id: clienteId === 'none' ? null : clienteId,
    };
    await onSave(data);
  };

  return (
    <div className="space-y-6 bg-slate-900 text-white">
      {/* Informações Básicas da Tarefa */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          📋 Informações da Tarefa
        </Label>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="titulo" className="text-gray-100">
              Título <span className="text-red-400">*</span>
            </Label>
            <Input 
              id="titulo" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              disabled={isSubmitting}
              placeholder="Ex: Revisar contrato, Preparar petição"
              className="bg-white text-black"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="descricao" className="text-gray-100">Descrição</Label>
            <Textarea 
              id="descricao" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              disabled={isSubmitting}
              placeholder="Detalhes adicionais sobre a tarefa..."
              rows={3}
              className="bg-white text-black"
            />
          </div>
        </div>
      </div>

      {/* Status e Prioridade */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <Label className="text-sm font-semibold text-blue-100 mb-3 block">
          ⚡ Status e Prioridade
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="status" className="text-blue-100">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as StatusTarefa)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status" className="bg-white">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="prioridade" className="text-blue-100">Prioridade</Label>
            <Select 
              value={prioridade} 
              onValueChange={(value) => setPrioridade(value as PrioridadeTarefa)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="prioridade" className="bg-white">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Crítica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Prazo */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          📅 Prazo
        </Label>
        <div className="space-y-1">
          <Label className="text-gray-100">Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white text-black",
                  !dataVencimento && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataVencimento ? (
                  format(dataVencimento, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={dataVencimento}
                onSelect={setDataVencimento}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Associações */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <Label className="text-sm font-semibold text-blue-100 mb-3 block">
          🔗 Associações
        </Label>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="processo" className="text-blue-100">Processo Associado (Opcional)</Label>
            <Select 
              value={processoId} 
              onValueChange={setProcessoId}
              disabled={isSubmitting || isLoadingDropdownData}
            >
              <SelectTrigger id="processo" className="bg-white">
                <SelectValue placeholder="Selecione um processo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum processo</SelectItem>
                {processos.map((processo) => (
                  <SelectItem key={processo.id} value={processo.id}>
                    {processo.numero_processo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cliente" className="text-blue-100">Cliente Associado (Opcional)</Label>
            <Select 
              value={clienteId} 
              onValueChange={setClienteId}
              disabled={isSubmitting || isLoadingDropdownData}
            >
              <SelectTrigger id="cliente" className="bg-white">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum cliente</SelectItem>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-blue-600">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-100 hover:bg-blue-800 border-blue-600 bg-transparent"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !titulo}
          className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default TarefaForm;
