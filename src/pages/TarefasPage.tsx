// src/pages/TarefasPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Certifique-se que esta importação está correta
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ListChecks, Plus, Search, Edit, Trash2, MoreVertical, RefreshCw, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import TarefaForm, { TarefaFormData } from '@/components/tarefas/TarefaForm';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type Tarefa = Database['public']['Tables']['tarefas']['Row'] & {
    clientes?: { id: string; nome: string } | null;
    processos?: { id: string; numero_processo: string } | null;
};

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

export type StatusTarefa = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada' | 'Aguardando Terceiros';
export type PrioridadeTarefa = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

const TarefasPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [clientesDoUsuario, setClientesDoUsuario] = useState<ClienteParaSelect[]>([]);
  const [processosDoUsuario, setProcessosDoUsuario] = useState<ProcessoParaSelect[]>([]);
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false);

  const fetchTarefas = useCallback(async (showLoadingSpinner = true) => {
    if (!user) {
      setTarefas([]);
      if (showLoadingSpinner) setIsLoading(false);
      return;
    }
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`*, clientes (id, nome), processos (id, numero_processo)`)
        .eq('user_id', user.id)
        .order('status', { ascending: true }) 
        .order('prioridade', { ascending: false }) 
        .order('data_vencimento', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTarefas(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar tarefas", description: error.message, variant: "destructive" });
      setTarefas([]);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  }, [user, toast]);
  
  const fetchDropdownData = useCallback(async () => {
    if (!user) return;
    setIsLoadingDropdownData(true);
    try {
      const [clientesRes, processosRes] = await Promise.all([
        supabase.from('clientes').select('id, nome').eq('user_id', user.id).order('nome'),
        supabase.from('processos').select('id, numero_processo').eq('user_id', user.id).order('numero_processo')
      ]);
      if (clientesRes.error) throw clientesRes.error;
      setClientesDoUsuario(clientesRes.data || []);
      if (processosRes.error) throw processosRes.error;
      setProcessosDoUsuario(processosRes.data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados para formulário", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingDropdownData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchTarefas();
      fetchDropdownData();
    } else {
      setIsLoading(false);
      setTarefas([]);
      setClientesDoUsuario([]);
      setProcessosDoUsuario([]);
    }
  }, [user, fetchTarefas, fetchDropdownData]);

  const handleOpenForm = (tarefa?: Tarefa) => {
    setTarefaSelecionada(tarefa || null);
    setIsEditing(!!tarefa);
    setIsFormOpen(true);
  };

  const handleSaveTarefa = async (formData: TarefaFormData) => {
    if (!user) {
        toast({ title: "Usuário não autenticado.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    const dataVencimentoFinal = formData.data_vencimento instanceof Date
        ? format(formData.data_vencimento, 'yyyy-MM-dd')
        // @ts-ignore
        : formData.data_vencimento; 
    const dadosParaSalvar = {
      titulo: formData.titulo,
      descricao_detalhada: formData.descricao_detalhada || null,
      status: formData.status || 'Pendente',
      prioridade: formData.prioridade || 'Média',
      data_vencimento: dataVencimentoFinal,
      cliente_id: formData.cliente_id || null,
      processo_id: formData.processo_id || null,
      data_conclusao: formData.status === 'Concluída' ? new Date().toISOString() : null,
      user_id: user.id,
    };
    try {
      let operacao;
      let mensagemSucesso;
      if (isEditing && tarefaSelecionada) {
        operacao = supabase.from('tarefas').update(dadosParaSalvar).eq('id', tarefaSelecionada.id).select().single();
        mensagemSucesso = `Tarefa "${formData.titulo}" foi atualizada.`;
      } else {
        // @ts-ignore
        operacao = supabase.from('tarefas').insert(dadosParaSalvar).select().single();
        mensagemSucesso = `Tarefa "${formData.titulo}" foi adicionada.`;
      }
      const { data, error } = await operacao;
      if (error) throw error;
      toast({ title: isEditing ? "Tarefa atualizada!" : "Tarefa criada!", description: mensagemSucesso });
      fetchTarefas(false);
      setIsFormOpen(false);
      setTarefaSelecionada(null);
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTarefa = async (tarefaId: string) => {
    if (!user) return;
    const tarefaParaDeletar = tarefas.find(t => t.id === tarefaId);
    if (tarefaParaDeletar && window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefaParaDeletar.titulo}"?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from('tarefas').delete().eq('id', tarefaId).eq('user_id', user.id);
        if (error) throw error;
        toast({ title: "Tarefa excluída!" });
        fetchTarefas(false);
      } catch (error: any) {
        toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleStatus = async (tarefa: Tarefa) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    const novoStatus: StatusTarefa = tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';
    const dataConclusao = novoStatus === 'Concluída' ? new Date().toISOString() : null;
    try {
        const { data, error } = await supabase
            .from('tarefas')
            .update({ status: novoStatus, data_conclusao: dataConclusao })
            .eq('id', tarefa.id).eq('user_id', user.id).select().single();
        if (error) throw error;
        toast({ title: "Status da tarefa atualizado!" });
        fetchTarefas(false);
    } catch (error: any) {
        toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredTarefas = tarefas.filter(tarefa =>
    tarefa.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarefa.descricao_detalhada && tarefa.descricao_detalhada.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tarefa.clientes?.nome && tarefa.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tarefa.processos?.numero_processo && tarefa.processos.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusBadgeClassName = (status?: StatusTarefa | string | null): string => {
    switch (status) {
      case 'Concluída': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'Pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
      case 'Aguardando Terceiros': return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
    }
  };

  const getPriorityBadgeClassName = (priority?: PrioridadeTarefa | string | null): string => {
    switch (priority) {
        case 'Urgente': return 'bg-red-500 text-white hover:bg-red-600';
        case 'Alta': return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
        case 'Média': return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
        case 'Baixa': return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
    }
  };

  const formatDateString = (dateString: string | null | undefined, withRelative = false) => {
    if (!dateString) return '-';
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd/MM/yyyy", { locale: ptBR });
        if (withRelative) {
            if (isToday(date)) return `${formatted} (Hoje)`;
            if (isTomorrow(date)) return `${formatted} (Amanhã)`;
            if (isPast(date) && !isToday(date)) return `${formatted} (Atrasada)`;
        }
        return formatted;
    } catch (e) {
        return dateString; 
    }
  };

  // A linha do erro era a 254, que é o <AdminLayout>.
  // O erro "Expected jsx identifier" geralmente significa que o parser JSX
  // esperava um nome de componente válido (começando com maiúscula, ou uma tag HTML minúscula)
  // mas encontrou algo diferente.
  // A única coisa que poderia dar problema aqui seria a importação do AdminLayout.
  // Vamos garantir que o código JSX retornado seja válido.
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
              <ListChecks className="mr-3 h-7 w-7 text-lawyer-primary" />
              Minhas Tarefas
            </h1>
            <p className="text-gray-600 text-left mt-1">
              Organize suas pendências, defina prioridades e acompanhe o progresso.
            </p>
          </div>
           <Button onClick={() => handleOpenForm()} className="mt-4 md:mt-0 w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
        </div>

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="border-b px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-grow sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por título, cliente, processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm h-9 w-full" 
                />
              </div>
              <Button onClick={() => fetchTarefas(true)} variant="outline" size="sm" disabled={isLoading || isSubmitting} className="w-full sm:w-auto text-xs">
                <RefreshCw className={`h-3 w-3 mr-1.5 ${(isLoading || isSubmitting) ? 'animate-spin' : ''}`} />
                {(isLoading || isSubmitting) ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && !tarefas.length ? (
              <div className="text-center py-16 flex flex-col justify-center items-center">
                <Spinner size="lg" /> 
                <p className="ml-2 text-gray-500 mt-3">Carregando tarefas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">Título</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridade</TableHead>
                      <TableHead className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimento</TableHead>
                      <TableHead className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Associado a</TableHead>
                      <TableHead className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTarefas.length > 0 ? (
                      filteredTarefas.map((tarefa) => (
                        <TableRow key={tarefa.id} className="hover:bg-gray-50/50 transition-colors border-b last:border-b-0">
                          <TableCell className="px-4 py-3 align-top">
                            <p className="font-medium text-sm text-gray-800">{tarefa.titulo}</p>
                            {tarefa.descricao_detalhada && (
                                <p className="text-xs text-gray-500 mt-0.5" title={tarefa.descricao_detalhada}>
                                    {tarefa.descricao_detalhada.substring(0, 70)}{tarefa.descricao_detalhada.length > 70 ? '...' : ''}
                                </p>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <Badge 
                              variant="outline" 
                              className={`text-xs py-0.5 px-2 cursor-pointer ${getStatusBadgeClassName(tarefa.status as StatusTarefa)}`} 
                              onClick={() => handleToggleStatus(tarefa)} 
                              title="Clique para alterar status"
                            >
                              {tarefa.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell px-4 py-3 align-top">
                             <Badge variant="outline" className={`text-xs py-0.5 px-2 ${getPriorityBadgeClassName(tarefa.prioridade as PrioridadeTarefa)}`}>
                                {tarefa.prioridade}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(
                            "hidden lg:table-cell px-4 py-3 text-sm text-gray-600 align-top",
                            tarefa.data_vencimento && isPast(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && !isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && tarefa.status !== 'Cancelada' && "text-red-600 font-semibold",
                            tarefa.data_vencimento && isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && tarefa.status !== 'Cancelada' && "text-orange-600 font-semibold"
                          )}>
                            {formatDateString(tarefa.data_vencimento, true)}
                          </TableCell>
                           <TableCell className="hidden lg:table-cell px-4 py-3 text-gray-500 text-xs align-top">
                            {tarefa.clientes?.nome || (tarefa.processos?.numero_processo ? `Proc: ${tarefa.processos.numero_processo}` : '-')}
                          </TableCell>
                          <TableCell className="text-right px-4 py-3 align-top">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-lawyer-primary hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleOpenForm(tarefa)} className="cursor-pointer text-sm">
                                  <Edit className="mr-2 h-3.5 w-3.5" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteTarefa(tarefa.id)} className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-700 cursor-pointer text-sm">
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          <ListChecks className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                          Nenhuma tarefa encontrada.
                          {searchTerm ? " Tente limpar a busca." : " Clique em \"Nova Tarefa\" para adicionar."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if(!open) {
                setTarefaSelecionada(null);
                setIsEditing(false);
            }
            setIsFormOpen(open);
        }}>
          <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden">
             <TarefaForm
                onSave={handleSaveTarefa}
                onCancel={() => {
                    setIsFormOpen(false);
                    setTarefaSelecionada(null);
                    setIsEditing(false);
                }}
                tarefaParaEditar={tarefaSelecionada}
                isEdit={isEditing}
                clientesDoUsuario={clientesDoUsuario}
                processosDoUsuario={processosDoUsuario}
                isLoadingDropdownData={isLoadingDropdownData}
              />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TarefasPage;