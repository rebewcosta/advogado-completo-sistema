// src/components/tarefas/TarefaListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash2, Circle, ListChecks, User, Briefcase, CalendarDays } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Tarefa, StatusTarefa, PrioridadeTarefa } from '@/pages/TarefasPage'; // Importando tipos da TarefasPage

interface TarefaListAsCardsProps {
  tarefas: Tarefa[];
  onEdit: (tarefa: Tarefa) => void;
  // onView?: (tarefa: Tarefa) => void; // Se houver uma view de detalhes
  onDelete: (tarefaId: string) => void;
  onToggleStatus: (tarefa: Tarefa) => void;
  isLoading: boolean;
  searchTerm: string;
}

const TarefaListAsCards: React.FC<TarefaListAsCardsProps> = ({
  tarefas,
  onEdit,
  // onView,
  onDelete,
  onToggleStatus,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined, withRelative = false) => {
    if (!dateString) return <span className="text-xs text-gray-500">-</span>;
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'; // Garante que é ISO com timezone Z se não tiver T
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd/MM/yy", { locale: ptBR });

        if (withRelative) {
            if (isToday(date)) return <><span className="font-medium text-orange-500">{formatted}</span> <span className="text-xs">(Hoje)</span></>;
            if (isPast(date) && !isToday(date)) return <><span className="font-medium text-red-500">{formatted}</span> <span className="text-xs">(Atrasada)</span></>;
        }
        return <span className="text-gray-700">{formatted}</span>;
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
  
  const columnConfig = [
    { id: 'titulo', label: "Título / Descrição", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'status', label: "Status", headerClass: "w-[150px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[150px] flex-shrink-0 px-4 text-left" },
    { id: 'prioridade', label: "Prioridade", headerClass: "w-[110px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[110px] flex-shrink-0 px-4 text-left hidden md:block" },
    { id: 'vencimento', label: "Vencimento", headerClass: "w-[130px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[130px] flex-shrink-0 px-4 text-left hidden sm:block" },
    { id: 'associado', label: "Associado a", headerClass: "w-2/12 min-w-0 px-4 text-left hidden lg:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden lg:block" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];

  return (
    <div className="mt-2">
      {tarefas.length > 0 && (
        <div className={cn(
            "hidden md:flex bg-lawyer-dark text-white py-3 rounded-t-lg mb-1 shadow-md sticky top-0 z-10 items-center"
        )}>
          {columnConfig.map(col => (
            <div key={col.id} className={cn(col.headerClass, "text-xs font-bold uppercase tracking-wider")}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {tarefas.length > 0 ? (
        <div className="space-y-3">
          {tarefas.map((tarefa) => {
            const statusInfo = getStatusBadgeInfo(tarefa.status as StatusTarefa);
            const priorityInfo = getPriorityBadgeInfo(tarefa.prioridade as PrioridadeTarefa);
            return (
              <Card key={tarefa.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border border-gray-200/80 overflow-hidden">
                <div className={cn("p-3 md:py-2 md:flex md:flex-row md:items-start")}>
                  
                  {/* Título / Descrição */}
                  <div className={cn(columnConfig[0].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer break-words" onClick={() => onEdit(tarefa)}> {/* Clicar no título abre edição */}
                        {tarefa.titulo}
                    </div>
                    {tarefa.descricao_detalhada && (
                        <div className="text-xs text-gray-500 mt-0.5 break-words truncate" title={tarefa.descricao_detalhada}>
                            {tarefa.descricao_detalhada.substring(0, 70)}{tarefa.descricao_detalhada.length > 70 ? '...' : ''}
                        </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className={cn(columnConfig[1].itemClass, "mb-2 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2 font-medium rounded-full cursor-pointer w-max", statusInfo.bgColor, statusInfo.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(tarefa)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusInfo.dotColor, `text-[${statusInfo.dotColor}]`)} />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* Prioridade */}
                  <div className={cn(columnConfig[2].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", priorityInfo.className)}>
                        {priorityInfo.label}
                    </Badge>
                  </div>
                  
                  {/* Vencimento */}
                  <div className={cn(columnConfig[3].itemClass, "text-sm md:py-2 mb-2 md:mb-0", 
                      tarefa.data_vencimento && isPast(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && !isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && "font-bold",
                      tarefa.data_vencimento && isToday(parseISO(tarefa.data_vencimento + 'T00:00:00Z')) && tarefa.status !== 'Concluída' && "font-bold"
                    )}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    {formatDateString(tarefa.data_vencimento, true)}
                  </div>

                  {/* Associado a */}
                  <div className={cn(columnConfig[4].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[4].label}</div>
                    <div className="text-xs text-gray-700 break-words">
                        {tarefa.clientes?.nome ? <span className="flex items-center"><User size={12} className="mr-1 text-gray-400"/> {tarefa.clientes.nome}</span> : 
                         tarefa.processos?.numero_processo ? <span className="flex items-center"><Briefcase size={12} className="mr-1 text-gray-400"/> {tarefa.processos.numero_processo}</span> : '-'}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className={cn(columnConfig[5].itemClass, "mt-3 md:mt-0 md:py-1")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => onEdit(tarefa)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(tarefa.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-16 text-center text-gray-500">
          <ListChecks className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium mb-1">Nenhuma tarefa encontrada.</p>
          <p className="text-sm">
            {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Tarefa\" para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default TarefaListAsCards;