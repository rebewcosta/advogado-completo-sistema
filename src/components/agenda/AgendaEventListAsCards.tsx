// src/components/agenda/AgendaEventListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, CalendarDays, Clock, MapPin, User, FileText, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EventoAgenda } from '@/pages/AgendaPage';

interface AgendaEventListAsCardsProps {
  events: EventoAgenda[];
  onEdit: (event: EventoAgenda) => void;
  onView: (event: EventoAgenda) => void;
  onDelete: (eventId: string) => void;
  isLoading: boolean;
  selectedDate?: Date;
}

const AgendaEventListAsCards: React.FC<AgendaEventListAsCardsProps> = ({
  events,
  onEdit,
  onView,
  onDelete,
  isLoading,
  selectedDate
}) => {

  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return <span className="text-xs text-gray-500">-</span>;
    try {
        return format(parseISO(isoString), 'HH:mm');
    } catch (e) {
        return <span className="text-xs text-red-500">Inválida</span>; 
    }
  };

  const getPriorityBadgeClass = (priority?: string | null) => {
    switch (priority) {
        case 'alta': return 'bg-red-100 text-red-700 border-red-200';
        case 'média': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'baixa': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  const getStatusBadgeClass = (status?: string | null) => {
    switch (status) {
        case 'Agendado': return { textColor: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', label: 'Agendado' };
        case 'Concluído': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Concluído' };
        case 'Cancelado': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Cancelado' };
        default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };


  if (isLoading && events.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando eventos...</p>
      </div>
    );
  }

  const columnConfig = [
    { id: 'hora', label: "Hora", headerClass: "w-[80px] flex-shrink-0 px-4 text-left", itemClass: "w-full md:w-[80px] flex-shrink-0 px-4 text-left" },
    { id: 'titulo', label: "Título / Tipo", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'associado', label: "Associado a", headerClass: "w-3/12 min-w-0 px-4 text-left hidden lg:flex items-center", itemClass: "w-full md:w-3/12 min-w-0 px-4 text-left hidden lg:block" },
    { id: 'prioridade', label: "Prioridade", headerClass: "w-[120px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[120px] flex-shrink-0 px-4 text-left hidden md:block" },
    { id: 'status', label: "Status", headerClass: "w-[140px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[140px] flex-shrink-0 px-4 text-left hidden md:block" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];

  return (
    <div className="mt-2">
      {events.length > 0 && (
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

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => {
            const statusStyle = getStatusBadgeClass(event.status_evento);
            return (
              <Card key={event.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border border-gray-200/80 overflow-hidden">
                <div className={cn("p-3 md:py-2 md:flex md:flex-row md:items-start")}>
                  
                  <div className={cn(columnConfig[0].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-gray-800">{formatTime(event.data_hora_inicio)}</div>
                  </div>

                  <div className={cn(columnConfig[1].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <div className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer break-words" onClick={() => onView(event)}>
                        {event.titulo}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 break-words">{event.tipo_evento || '-'}</div>
                  </div>

                  <div className={cn(columnConfig[2].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <div className="text-xs text-gray-700 break-words">
                        {event.clientes?.nome ? <span className="flex items-center"><User size={12} className="mr-1 text-gray-400"/> {event.clientes.nome}</span> : 
                         event.processos?.numero_processo ? <span className="flex items-center"><FileText size={12} className="mr-1 text-gray-400"/> {event.processos.numero_processo}</span> : '-'}
                    </div>
                  </div>
                  
                  <div className={cn(columnConfig[3].itemClass, "mb-2 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", getPriorityBadgeClass(event.prioridade))}>
                      {event.prioridade || 'N/D'}
                    </Badge>
                  </div>
                  
                  <div className={cn(columnConfig[4].itemClass, "mb-2 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[4].label}</div>
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}>
                        <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                        {statusStyle.label}
                    </Badge>
                  </div>

                  <div className={cn(columnConfig[5].itemClass, "mt-3 md:mt-0 md:py-1")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuItem onClick={() => onView(event)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(event)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(event.id)}
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
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium mb-1">
            {isLoading ? "Carregando..." : "Nenhum evento para esta data."}
          </p>
          {!isLoading && <p className="text-sm">Selecione outra data ou adicione um novo evento.</p>}
        </div>
      )}
    </div>
  );
};

export default AgendaEventListAsCards;