
// src/components/tarefas/TarefaForm.tsx
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
import { StatusTarefa, PrioridadeTarefa, Tarefa } from '@/types/tarefas';

interface TarefaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Tarefa) => void;
  initialData?: Tarefa;
}

const TarefaForm: React.FC<TarefaFormProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [titulo, setTitulo] = useState('');
  const [descricaoDetalhada, setDescricaoDetalhada] = useState<string | undefined>('');
  const [status, setStatus] = useState<StatusTarefa>('Pendente');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('Média');
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo);
      setDescricaoDetalhada(initialData.descricao_detalhada || '');
      setStatus(initialData.status);
      setPrioridade(initialData.prioridade);
      setDataVencimento(initialData.data_vencimento ? new Date(initialData.data_vencimento) : undefined);
    } else {
      // Reset form when creating a new task
      setTitulo('');
      setDescricaoDetalhada('');
      setStatus('Pendente');
      setPrioridade('Média');
      setDataVencimento(undefined);
    }
  }, [initialData]);

  const handleSubmit = () => {
    const data: Tarefa = {
      id: initialData?.id || '', // Provide a default value for id
      titulo,
      descricao_detalhada: descricaoDetalhada,
      status,
      prioridade,
      data_vencimento: dataVencimento ? format(dataVencimento, 'yyyy-MM-dd', { locale: ptBR }) : undefined,
      data_conclusao: initialData?.data_conclusao || undefined, // Keep the initial value
      cliente_id: initialData?.cliente_id || null, // Keep the initial value
      processo_id: initialData?.processo_id || null, // Keep the initial value
      user_id: initialData?.user_id || '', // Provide a default value for user_id
      created_at: initialData?.created_at || new Date().toISOString(), // Provide a default value for created_at
      updated_at: new Date().toISOString(),
    };
    onSubmit(data);
    onClose();
  };

  return (
    <div className={cn("fixed inset-0 z-50 overflow-y-auto", open ? "block" : "hidden")}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h3>
                <div className="mt-2">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="descricao">Descrição Detalhada</Label>
                      <Textarea id="descricao" value={descricaoDetalhada || ''} onChange={(e) => setDescricaoDetalhada(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={(value: StatusTarefa) => setStatus(value)}>
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
                      <Select value={prioridade} onValueChange={(value: PrioridadeTarefa) => setPrioridade(value)}>
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
                      <Label>Data de Vencimento</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !dataVencimento && "text-muted-foreground"
                            )}
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
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-lawyer-primary hover:bg-lawyer-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary-500"
              onClick={handleSubmit}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarefaForm;
