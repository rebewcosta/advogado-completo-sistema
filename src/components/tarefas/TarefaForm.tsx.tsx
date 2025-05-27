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
import { format, parse, isValid, parseISO } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import { StatusTarefa, PrioridadeTarefa } from '@/pages/TarefasPage'; // Importando os tipos

type TarefaBase = Omit<Database['public']['Tables']['tarefas']['Row'], 'id' | 'user_id' | 'created_at' | 'updated_at' | 'clientes' | 'processos'>;

export interface TarefaFormData extends TarefaBase {
  // Se houver campos que precisam de formatação diferente no formulário
}

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

interface TarefaFormProps {
  onSave: (data: TarefaFormData) => void;
  onCancel: () => void;
  tarefaParaEditar?: Database['public']['Tables']['tarefas']['Row'] | null;
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
  const [formData, setFormData] = useState<Partial<TarefaFormData>>({
    titulo: '',
    descricao_detalhada: '',
    status: 'Pendente',
    prioridade: 'Média',
    data_vencimento: undefined, // Armazenar como Date ou undefined
    cliente_id: null,
    processo_id: null,
    data_conclusao: null,
  });

  useEffect(() => {
    if (isEdit && tarefaParaEditar) {
      setFormData({
        titulo: tarefaParaEditar.titulo || '',
        descricao_detalhada: tarefaParaEditar.descricao_detalhada || '',
        status: tarefaParaEditar.status as StatusTarefa || 'Pendente',
        prioridade: tarefaParaEditar.prioridade as PrioridadeTarefa || 'Média',
        data_vencimento: tarefaParaEditar.data_vencimento ? parseISO(tarefaParaEditar.data_vencimento + 'T00:00:00Z') : undefined,
        cliente_id: tarefaParaEditar.cliente_id || null,
        processo_id: tarefaParaEditar.processo_id || null,
        data_conclusao: tarefaParaEditar.data_conclusao ? new Date(tarefaParaEditar.data_conclusao) : null,
      });
    } else {
      // Reset para novo formulário
      setFormData({
        titulo: '',
        descricao_detalhada: '',
        status: 'Pendente',
        prioridade: 'Média',
        data_vencimento: undefined,
        cliente_id: null,
        processo_id: null,
        data_conclusao: null,
      });
    }
  }, [tarefaParaEditar, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof TarefaFormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, data_vencimento: date ? format(date, 'yyyy-MM-dd') : null }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.status || !formData.prioridade) {
      alert("Por favor, preencha os campos obrigatórios: Título, Status e Prioridade.");
      return;
    }
    // Converte data_vencimento para string ISO YYYY-MM-DD se for um Date, ou mantém null/undefined
    const dataVencimentoParaSalvar = formData.data_vencimento instanceof Date 
        ? format(formData.data_vencimento, 'yyyy-MM-dd') 
        : formData.data_vencimento; // Já deve ser string ou null

    onSave({
        ...formData,
        data_vencimento: dataVencimentoParaSalvar,
    } as TarefaFormData); // Afirmar o tipo aqui
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
          <div>
            <Label htmlFor="titulo_tarefa_form">Título <span className="text-red-500">*</span></Label>
            <Input id="titulo_tarefa_form" name="titulo" value={formData.titulo} onChange={handleChange} required className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            <div>
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
          
          <div>
            <Label htmlFor="data_vencimento_tarefa_form">Data de Vencimento</Label>
            <DatePicker
                date={formData.data_vencimento ? (typeof formData.data_vencimento === 'string' ? parseISO(formData.data_vencimento) : formData.data_vencimento) : undefined}
                setDate={handleDateChange}
                className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="descricao_detalhada_tarefa_form">Descrição Detalhada</Label>
            <Textarea id="descricao_detalhada_tarefa_form" name="descricao_detalhada" value={formData.descricao_detalhada || ''} onChange={handleChange} rows={4} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente_id_tarefa_form">Associar Cliente</Label>
              <Select value={formData.cliente_id || ""} onValueChange={(value) => handleSelectChange('cliente_id', value === "" ? null : value)} disabled={isLoadingDropdownData}>
                <SelectTrigger id="cliente_id_tarefa_form" className="mt-1"><SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Nenhum"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {isLoadingDropdownData && <SelectItem value="loading_cli" disabled>Carregando...</SelectItem>}
                  {!isLoadingDropdownData && clientesDoUsuario.length === 0 && <SelectItem value="no_cli" disabled>Nenhum cliente</SelectItem>}
                  {clientesDoUsuario.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="processo_id_tarefa_form">Associar Processo</Label>
              <Select value={formData.processo_id || ""} onValueChange={(value) => handleSelectChange('processo_id', value === "" ? null : value)} disabled={isLoadingDropdownData}>
                <SelectTrigger id="processo_id_tarefa_form" className="mt-1"><SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Nenhum"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {isLoadingDropdownData && <SelectItem value="loading_proc" disabled>Carregando...</SelectItem>}
                  {!isLoadingDropdownData && processosDoUsuario.length === 0 && <SelectItem value="no_proc" disabled>Nenhum processo</SelectItem>}
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