
// src/components/tarefas/TarefaTable.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, User, FileText, Calendar, ListChecks, MoreVertical, Briefcase, Circle } from 'lucide-react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { TarefaComRelacoes, StatusTarefa, PrioridadeTarefa } from '@/types/tarefas';

interface TarefaTableProps {
  tarefas: TarefaComRelacoes[];
  onEdit: (tarefa: TarefaComRelacoes) => void;
  onDelete: (tarefaId: string) => void;
  onToggleStatus: (tarefa: TarefaComRelacoes) => void;
  isLoading: boolean;
  searchTerm: string;
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined, withRelative = false) => {
    if (!dateString) return <span className="text-gray-400">-</span>;
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd/MM/yy", { locale: ptBR });

        if (withRelative) {
            if (isToday(date)) return <><span className="font-semibold text-orange-600">{formatted}</span> (Hoje)</>;
            if (isPast(date) && !isToday(date)) return <><span className="font-semibold text-red-600">{formatted}</span> (Atrasada)</>;
        }
        return formatted;
    } catch (e) {
        return <span className="text-xs text-red-500">Data Inválida</span>;
    }
  };

  const getStatusBadgeInfo = (status?: StatusTarefa | string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
    switch (status) {
      case 'Concluída': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Concluída' };
      case 'Pendente': return { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500', label: 'Pendente' };
      case 'Em Andamento': return { textColor: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', label: 'Em Andamento' };
      case 'Cancelada': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Cancelada' };
      case 'Aguardando Terceiros': return { textColor: 'text-orange-700', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500', label: 'Aguard. 3ºs' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  const getPriorityBadgeInfo = (priority?: PrioridadeTarefa | string | null): {className: string, label: string} => {
    switch (priority) {
        case 'Urgente': return { className: 'bg-red-500 text-white hover:bg-red-600', label: 'Urgente'};
        case 'Alta': return { className: 'bg-red-100 text-red-700 border-red-200', label: 'Alta'};
        case 'Média': return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Média'};
        case 'Baixa': return { className: 'bg-green-100 text-green-700 border-green-200', label: 'Baixa'};
        default: return { className: 'bg-gray-100 text-gray-700 border-gray-200', label: priority || 'N/D'};
    }
  };

  if (isLoading && tarefas.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm animate-fade-in">
      <Table className="min-w-full">
        <TableHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <TableRow className="hover:bg-gradient-to-r hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300">
            <TableHead className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Título</TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider hidden md:table-cell">Prioridade</TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider hidden lg:table-cell">Vencimento</TableHead>
            <TableHead className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider hidden lg:table-cell">Associado a</TableHead>
            <TableHead className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100/50 backdrop-blur-sm">
          {tarefas.length > 0 ? (
            tarefas.map((tarefa) => {
              const statusInfo = getStatusBadgeInfo(tarefa.status as StatusTarefa);
              const priorityInfo = getPriorityBadgeInfo(tarefa.prioridade as PrioridadeTarefa);
              return (
                <TableRow key={tarefa.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 text-left backdrop-blur-sm">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors duration-200"
                      onClick={() => onEdit(tarefa)}
                      title={tarefa.descricao_detalhada || tarefa.titulo}
                    >
                      {tarefa.titulo}
                    </div>
                    {tarefa.descricao_detalhada && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs" title={tarefa.descricao_detalhada}>
                            {tarefa.descricao_detalhada}
                        </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-3 font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105", statusInfo.bgColor, statusInfo.textColor, `border-transparent shadow-lg`)}
                      onClick={() => onToggleStatus(tarefa)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusInfo.dotColor, `text-[${statusInfo.dotColor}]`)} />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                     <Badge variant="outline" className={cn("text-xs py-1 px-3 font-medium rounded-full capitalize shadow-lg", priorityInfo.className)}>
                        {priorityInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell 
                    className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell",
                        tarefa.data_vencimento && isPast(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && !isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && "text-red-600 font-semibold",
                        tarefa.data_vencimento && isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && "text-orange-600 font-semibold"
                    )}>
                    {formatDateString(tarefa.data_vencimento, true)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 hidden lg:table-cell">
                    {tarefa.clientes?.nome ? <span className="flex items-center"><User size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {tarefa.clientes.nome}</span> : 
                     tarefa.processos?.numero_processo ? <span className="flex items-center"><Briefcase size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {tarefa.processos.numero_processo}</span> : '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-xl bg-white/90 backdrop-blur-sm border-0">
                        <DropdownMenuItem onClick={() => onEdit(tarefa)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-indigo-50 text-left rounded-lg transition-all duration-200">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-indigo-600" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(tarefa.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-16 text-center text-gray-500">
                 <ListChecks className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium mb-1">Nenhuma tarefa encontrada.</p>
                <p className="text-sm">
                  {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Tarefa\" para adicionar."}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TarefaTable;
