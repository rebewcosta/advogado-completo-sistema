
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
      case 'Alta': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0';
      case 'Média': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0';
      case 'Baixa': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0';
      case 'Em Andamento': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0';
      case 'Pendente': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0';
      case 'Cancelada': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate text-white">{tarefa.titulo}</CardTitle>
            {tarefa.descricao_detalhada && (
              <p className="text-sm text-slate-200 mt-1 line-clamp-2">
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
      
      <CardContent className="space-y-3 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {tarefa.responsavel && (
            <div className="flex items-center text-gray-600">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <span className="truncate">
                Responsável: {tarefa.responsavel.nome}
              </span>
            </div>
          )}
          
          {tarefa.data_vencimento && (
            <div className="flex items-center text-gray-600">
              <div className="p-2 bg-orange-50 rounded-lg mr-3">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <span>
                Vencimento: {format(parseISO(tarefa.data_vencimento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
          
          {tarefa.tempo_estimado_horas && (
            <div className="flex items-center text-gray-600">
              <span className="text-xs bg-blue-50 px-2 py-1 rounded-lg">
                Estimado: {tarefa.tempo_estimado_horas}h
              </span>
            </div>
          )}
          
          {tarefa.tempo_gasto_horas && (
            <div className="flex items-center text-gray-600">
              <span className="text-xs bg-green-50 px-2 py-1 rounded-lg">
                Gasto: {tarefa.tempo_gasto_horas}h
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Criado em {format(parseISO(tarefa.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tarefa)}
              disabled={isSubmitting}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tarefa)}
              disabled={isSubmitting}
              className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
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
