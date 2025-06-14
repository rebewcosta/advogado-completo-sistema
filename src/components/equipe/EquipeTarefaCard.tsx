
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

interface EquipeTarefaCardProps {
  tarefa: EquipeTarefa;
  onEdit: (tarefa: EquipeTarefa) => void;
  onDelete: (tarefa: EquipeTarefa) => void;
  isSubmitting: boolean;
}

const EquipeTarefaCard: React.FC<EquipeTarefaCardProps> = ({
  tarefa,
  onEdit,
  onDelete,
  isSubmitting
}) => {
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
    <Card className="hover:shadow-md transition-shadow">
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
              onClick={() => onEdit(tarefa)}
              disabled={isSubmitting}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tarefa)}
              disabled={isSubmitting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipeTarefaCard;
