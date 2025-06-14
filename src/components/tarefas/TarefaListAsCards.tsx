
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Edit, Trash2, User, FileText, Clock, CheckCircle, AlertTriangle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TarefaComRelacoes, StatusTarefa, PrioridadeTarefa } from '@/types/tarefas';
import { cn } from '@/lib/utils';

interface TarefaListAsCardsProps {
  tarefas: TarefaComRelacoes[];
  onEdit: (tarefa: TarefaComRelacoes) => void;
  onDelete: (tarefaId: string) => void;
  onToggleStatus: (tarefa: TarefaComRelacoes) => void;
  isLoading: boolean;
}

interface TarefaCardProps {
  tarefa: TarefaComRelacoes;
  onEdit: (tarefa: TarefaComRelacoes) => void;
  onDelete: (tarefaId: string) => void;
  onToggleStatus: (tarefa: TarefaComRelacoes) => void;
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

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, onEdit, onDelete, onToggleStatus }) => {
  // Verificar se tarefa e suas propriedades existem antes de usar
  if (!tarefa) {
    return null;
  }

  const statusInfo = statusMap[tarefa.status] || { label: 'N/A', color: 'bg-gray-100 text-gray-700', icon: Circle };
  const prioridadeInfo = prioridadeMap[tarefa.prioridade] || { label: 'N/A', color: 'bg-gray-100 text-gray-700' };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sem data';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">{tarefa.titulo || 'Sem título'}</CardTitle>
          <div className="flex space-x-2">
            <Button size="icon" variant="ghost" onClick={() => onEdit(tarefa)} className="hover:bg-indigo-100 rounded-lg transition-all duration-200">
              <Edit className="h-4 w-4 text-indigo-600" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(tarefa.id)} className="hover:bg-red-100 rounded-lg transition-all duration-200">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            {statusInfo.icon && <statusInfo.icon className="mr-2 h-4 w-4" />}
            <Badge 
              className={cn("font-medium cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg", statusInfo.color, `border-transparent`)}
              onClick={() => onToggleStatus(tarefa)}
            >
              {statusInfo.label}
            </Badge>
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-2 text-gray-600">Prioridade:</span>
             <Badge className={cn("font-medium shadow-lg", prioridadeInfo.color, `border-transparent`)}>
              {prioridadeInfo.label}
            </Badge>
          </div>
          {tarefa.data_vencimento && (
            <div className="flex items-center text-sm text-gray-600">
              <CalendarDays className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Vencimento: {formatDate(tarefa.data_vencimento)}</span>
            </div>
          )}
          {tarefa.clientes && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Cliente: {tarefa.clientes.nome}</span>
            </div>
          )}
          {tarefa.processos && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Processo: {tarefa.processos.numero_processo}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TarefaListAsCards: React.FC<TarefaListAsCardsProps> = ({
  tarefas,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tarefas || tarefas.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center">
        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="font-medium mb-1">Nenhuma tarefa encontrada.</p>
        <p className="text-sm text-gray-500">Clique em "Nova Tarefa" para adicionar.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {tarefas.map((tarefa, index) => (
        <div 
          key={tarefa.id}
          className="animate-slide-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <TarefaCard
            tarefa={tarefa}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </div>
      ))}
    </div>
  );
};

export default TarefaListAsCards;
