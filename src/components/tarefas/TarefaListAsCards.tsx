
// src/components/tarefas/TarefaListAsCards.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Edit, Trash2, User, FileText, Clock, CheckCircle, AlertTriangle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TarefaComRelacoes, StatusTarefa, PrioridadeTarefa } from '@/types/tarefas';
import { cn } from '@/lib/utils';

interface TarefaCardProps {
  tarefa: TarefaComRelacoes;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusMap = {
  'Pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'Em Andamento': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: FileText },
  'Concluída': { label: 'Concluída', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'Cancelada': { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

const prioridadeMap = {
  'Baixa': { label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  'Média': { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  'Alta': { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  'Crítica': { label: 'Crítica', color: 'bg-red-100 text-red-700' },
}

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, onEdit, onDelete }) => {
  const statusInfo = statusMap[tarefa.status];
  const prioridadeInfo = prioridadeMap[tarefa.prioridade];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sem data';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{tarefa.titulo}</CardTitle>
          <div className="flex space-x-2">
            <Button size="icon" variant="ghost" onClick={() => onEdit(tarefa.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(tarefa.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {statusInfo.icon && <statusInfo.icon className="mr-2 h-4 w-4" />}
            <Badge className={cn("font-medium", statusInfo.color, `border-transparent`)}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-2">Prioridade:</span>
             <Badge className={cn("font-medium", prioridadeInfo.color, `border-transparent`)}>
              {prioridadeInfo.label}
            </Badge>
          </div>
          {tarefa.data_vencimento && (
            <div className="flex items-center text-sm">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Vencimento: {formatDate(tarefa.data_vencimento)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TarefaCard;
