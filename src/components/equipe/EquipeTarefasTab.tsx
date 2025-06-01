
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, User, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EquipeTarefaForm from './EquipeTarefaForm';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

interface EquipeTarefasTabProps {
  tarefas: EquipeTarefa[];
  membros: EquipeMembro[];
  searchTerm: string;
  isSubmitting: boolean;
  onRefresh: () => void;
  setIsSubmitting: (loading: boolean) => void;
}

const EquipeTarefasTab: React.FC<EquipeTarefasTabProps> = ({
  tarefas,
  membros,
  searchTerm,
  isSubmitting,
  onRefresh,
  setIsSubmitting
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<EquipeTarefa | null>(null);

  const filteredTarefas = tarefas.filter(tarefa =>
    tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarefa.descricao_detalhada && tarefa.descricao_detalhada.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (tarefa: EquipeTarefa) => {
    setTarefaEditando(tarefa);
    setIsFormOpen(true);
  };

  const handleDelete = async (tarefa: EquipeTarefa) => {
    if (!user || isSubmitting) return;
    
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('equipe_tarefas')
          .delete()
          .eq('id', tarefa.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Tarefa excluída!",
          description: `A tarefa "${tarefa.titulo}" foi removida.`
        });
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir tarefa",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTarefaEditando(null);
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tarefas da Equipe</h2>
          <p className="text-gray-600 text-sm">Delegue e acompanhe tarefas da equipe</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 bg-lawyer-primary hover:bg-lawyer-primary/90"
          disabled={membros.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {membros.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Adicione membros à equipe antes de criar tarefas.
            </p>
          </CardContent>
        </Card>
      )}

      {filteredTarefas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa delegada ainda'}
            </p>
            {!searchTerm && membros.length > 0 && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4 bg-lawyer-primary hover:bg-lawyer-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Tarefa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTarefas.map((tarefa) => (
            <Card key={tarefa.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{tarefa.titulo}</CardTitle>
                    {tarefa.descricao_detalhada && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {tarefa.descricao_detalhada}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge variant="outline" className={getPriorityColor(tarefa.prioridade)}>
                      {tarefa.prioridade}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(tarefa.status)}>
                      {tarefa.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {tarefa.responsavel && (
                    <div className="flex items-center text-gray-600">
                      <User className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        Responsável: {tarefa.responsavel.nome}
                      </span>
                    </div>
                  )}
                  
                  {tarefa.data_vencimento && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>
                        Vencimento: {format(parseISO(tarefa.data_vencimento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {tarefa.tempo_estimado_horas && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-xs">
                        Estimado: {tarefa.tempo_estimado_horas}h
                      </span>
                    </div>
                  )}
                  
                  {tarefa.tempo_gasto_horas && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-xs">
                        Gasto: {tarefa.tempo_gasto_horas}h
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Criado em {format(parseISO(tarefa.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tarefa)}
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tarefa)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <EquipeTarefaForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={onRefresh}
          tarefa={tarefaEditando}
          membros={membros}
        />
      )}
    </>
  );
};

export default EquipeTarefasTab;
