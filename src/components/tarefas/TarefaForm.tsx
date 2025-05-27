// src/components/tarefas/TarefaForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import { StatusTarefa, PrioridadeTarefa } from '@/pages/TarefasPage';

type TarefaRow = Database['public']['Tables']['tarefas']['Row'];
export interface TarefaFormData extends Omit<TarefaRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'clientes' | 'processos'> {}

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

interface TarefaFormProps {
  onSave: (data: TarefaFormData) => void;
  onCancel: () => void;
  tarefaParaEditar?: TarefaRow | null;
  isEdit: boolean;
  clientesDoUsuario: ClienteParaSelect[];
  processosDoUsuario: ProcessoParaSelect[];
  isLoadingDropdownData?: boolean;
}

const TarefaForm: React.FC<TarefaFormProps> = ({
  onSave,
  onCancel,
  tarefaParaEditar,
  isEdit,
  clientesDoUsuario = [],
  processosDoUsuario = [],
  isLoadingDropdownData = false
}) => {
  const [dataVencimentoPicker, setDataVencimentoPicker] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<TarefaFormData>>({
    titulo: '',
    descricao_detalhada: '',
    status: 'Pendente',
    prioridade: 'Média',
    data_vencimento: null,
    cliente_id: null,
    processo_id: null,
    data_conclusao: null,
  });

  useEffect(() => {
    if (isEdit && tarefaParaEditar) {
      const vencimentoDate = tarefaParaEditar.data_vencimento 
        ? parseISO(tarefaParaEditar.data_vencimento)
        : undefined;
      
      setFormData({
        titulo: tarefaParaEditar.titulo || '',
        descricao_detalhada: tarefaParaEditar.descricao_detalhada || '',
        status: (tarefaParaEditar.status as StatusTarefa) || 'Pendente',
        prioridade: (tarefaParaEditar.prioridade as PrioridadeTarefa) || 'Média',
        data_vencimento: tarefaParaEditar.data_vencimento,
        cliente_id: tarefaParaEditar.cliente_id || null,
        processo_id: tarefaParaEditar.processo_id || null,
        data_conclusao: tarefaParaEditar.data_conclusao,
      });
      setDataVencimentoPicker(vencimentoDate);
    } else {
      setFormData({
        titulo: '',
        descricao_detalhada: '',
        status: 'Pendente',
        prioridade: 'Média',
        data_vencimento: null,
        cliente_id: null,
        processo_id: null,
        data_conclusao: null,
      });
      setDataVencimentoPicker(undefined);
    }
  }, [tarefaParaEditar, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof TarefaFormData, value: string | null) => {
    // Se o valor for a string "null_placeholder_value", converta para null real.
    // Isso é para o caso de você *precisar* de um item "Nenhum" selecionável com valor não vazio.
    // Mas com a remoção do <SelectItem value="">, o Radix deve lidar com o value sendo `undefined` ou `null`
    // quando o placeholder é mostrado.
    const finalValue = value === "null_placeholder_value" ? null : value;
    setFormData(prev => ({ ...prev, [name]: finalValue as any }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setDataVencimentoPicker(date); 
    setFormData(prev => ({ ...prev, data_vencimento: date ? format(date, 'yyyy-MM-dd') : null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.status || !formData.prioridade) {
      alert("Por favor, preencha os campos obrigatórios: Título, Status e Prioridade.");
      return;
    }
    onSave(formData as TarefaFormData); 
  };

  return (
    <Card className="w-full border-0 shadow-none rounded-none md:rounded-lg md:shadow-md">
      <CardHeader className="px-4 py-4 md:px-6 md:py-5 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 md:h-8 md:w-8 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
         <CardDescription className="text-xs md:text-sm pt-1">
            {isEdit ? 'Atualize os detalhes da tarefa.' : 'Preencha os campos para criar uma nova tarefa.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 md:p-6 max-h-[calc(90vh-220px)] overflow-y-auto space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo_tarefa_form">Título <span className="text-red-500">*</span></Label>
            <Input id="titulo_tarefa_form" name="titulo" value={formData.titulo || ''} onChange={handleChange} required className="mt-1" placeholder="Ex: Elaborar petição inicial"/>
          </div>

          {/* Status e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="status_tarefa_form">Status <span className="text-red-500">*</span></Label>
              <Select value={formData.status || 'Pendente'} onValueChange={(value) => handleSelectChange('status', value as StatusTarefa)}>
                <SelectTrigger id="status_tarefa_form" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                  <SelectItem value="Aguardando Terceiros">Aguardando Terceiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prioridade_tarefa_form">Prioridade <span className="text-red-500">*</span></Label>
              <Select value={formData.prioridade || 'Média'} onValueChange={(value) => handleSelectChange('prioridade', value as PrioridadeTarefa)}>
                <SelectTrigger id="prioridade_tarefa_form" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Data de Vencimento */}
          <div className="space-y-1.5">
            <Label htmlFor="data_vencimento_tarefa_form_picker">Data de Vencimento</Label>
            <DatePicker
                // @ts-ignore 
                date={dataVencimentoPicker} 
                setDate={handleDateChange}
                className="mt-1 w-full"
            />
          </div>

          {/* Descrição Detalhada */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao_detalhada_tarefa_form">Descrição Detalhada</Label>
            <Textarea 
              id="descricao_detalhada_tarefa_form" 
              name="descricao_detalhada" 
              value={formData.descricao_detalhada || ''} 
              onChange={handleChange} 
              rows={3} 
              className="mt-1"
              placeholder="Detalhes adicionais sobre a tarefa, links, etc."
            />
          </div>

          {/* Cliente e Processo Associado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cliente_id_tarefa_form">Associar Cliente</Label>
              <Select 
                value={formData.cliente_id || undefined} // Use undefined para mostrar o placeholder corretamente
                onValueChange={(value) => handleSelectChange('cliente_id', value === "undefined_placeholder" ? null : value)} 
                disabled={isLoadingDropdownData}
              >
                <SelectTrigger id="cliente_id_tarefa_form" className="mt-1">
                  <SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Selecione um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="undefined_placeholder" disabled>Nenhum</SelectItem>  Removido para usar placeholder */}
                  {isLoadingDropdownData && <SelectItem value="loading_cli" disabled>Carregando clientes...</SelectItem>}
                  {!isLoadingDropdownData && clientesDoUsuario.length === 0 && <SelectItem value="no_cli" disabled>Nenhum cliente cadastrado</SelectItem>}
                  {clientesDoUsuario.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="processo_id_tarefa_form">Associar Processo</Label>
              <Select 
                value={formData.processo_id || undefined} // Use undefined para mostrar o placeholder corretamente
                onValueChange={(value) => handleSelectChange('processo_id', value === "undefined_placeholder" ? null : value)} 
                disabled={isLoadingDropdownData}
              >
                <SelectTrigger id="processo_id_tarefa_form" className="mt-1">
                  <SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Selecione um processo"} />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="undefined_placeholder" disabled>Nenhum</SelectItem> Removido para usar placeholder */}
                  {isLoadingDropdownData && <SelectItem value="loading_proc" disabled>Carregando processos...</SelectItem>}
                  {!isLoadingDropdownData && processosDoUsuario.length === 0 && <SelectItem value="no_proc" disabled>Nenhum processo cadastrado</SelectItem>}
                  {processosDoUsuario.map(p => <SelectItem key={p.id} value={p.id}>{p.numero_processo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 px-4 py-3 md:px-6 md:py-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
            {isEdit ? 'Salvar Tarefa' : 'Criar Tarefa'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TarefaForm;