
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
  const [processoId, setProcessoId] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || '');
      setDescricao(initialData.descricao || '');
      setStatus(initialData.status || 'Pendente');
      setPrioridade(initialData.prioridade || 'Média');
      setDataVencimento(initialData.data_conclusao ? new Date(initialData.data_conclusao) : undefined);
      setProcessoId(initialData.processo_id || '');
      setClienteId(initialData.cliente_id || '');
    } else {
      setTitulo('');
      setDescricao('');
      setStatus('Pendente');
      setPrioridade('Média');
      setDataVencimento(undefined);
      setProcessoId('');
      setClienteId('');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const data: TarefaFormData = {
      titulo,
      descricao: descricao || null,
      status,
      prioridade,
      data_conclusao: dataVencimento ? format(dataVencimento, 'yyyy-MM-dd', { locale: ptBR }) : null,
      processo_id: processoId || null,
      cliente_id: clienteId || null,
    };
    await onSave(data);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input 
          id="titulo" 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea 
          id="descricao" 
          value={descricao} 
          onChange={(e) => setDescricao(e.target.value)} 
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={status} 
          onValueChange={(value) => setStatus(value as StatusTarefa)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="status">
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
      
      <div className="grid gap-2">
        <Label htmlFor="prioridade">Prioridade</Label>
        <Select 
          value={prioridade} 
          onValueChange={(value) => setPrioridade(value as PrioridadeTarefa)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="prioridade">
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

      <div className="grid gap-2">
        <Label htmlFor="processo">Processo Associado (Opcional)</Label>
        <Select 
          value={processoId} 
          onValueChange={setProcessoId}
          disabled={isSubmitting || isLoadingDropdownData}
        >
          <SelectTrigger id="processo">
            <SelectValue placeholder="Selecione um processo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum processo</SelectItem>
            {processos.map((processo) => (
              <SelectItem key={processo.id} value={processo.id}>
                {processo.numero_processo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cliente">Cliente Associado (Opcional)</Label>
        <Select 
          value={clienteId} 
          onValueChange={setClienteId}
          disabled={isSubmitting || isLoadingDropdownData}
        >
          <SelectTrigger id="cliente">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum cliente</SelectItem>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label>Data de Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
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

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !titulo}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default TarefaForm;
