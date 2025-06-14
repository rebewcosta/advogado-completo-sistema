// src/components/agenda/AgendaEventListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, CalendarDays, Clock, User, FileText, Info, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AgendaEvent } from '@/types/agenda'; // Updated import

interface AgendaEventListAsCardsProps {
  events: AgendaEvent[]; // Updated type
  onEdit: (event: AgendaEvent) => void; // Updated type
  onView: (event: AgendaEvent) => void; // Updated type
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
  const getStatusBadgeClass = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
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
    { id: 'hora', label: "Hora", baseClass: "w-full md:w-[80px] flex-shrink-0", mdWidthClass: "md:w-[80px]" },
    { id: 'titulo', label: "Título / Tipo", baseClass: "flex-1 min-w-0", mdWidthClass: "md:flex-1" },
    { id: 'associado', label: "Associado a", baseClass: "w-full md:w-3/12 min-w-0", mdWidthClass: "md:w-3/12" },
    { id: 'prioridade', label: "Prioridade", baseClass: "w-full md:w-[120px] flex-shrink-0", mdWidthClass: "md:w-[120px]" },
    { id: 'status', label: "Status", baseClass: "w-full md:w-[140px] flex-shrink-0", mdWidthClass: "md:w-[140px]" },
    { id: 'acoes', label: "Ações", baseClass: "w-full md:w-[80px] flex-shrink-0 flex justify-end items-center", mdWidthClass: "md:w-[80px] md:justify-end" }
  ];

  return (
    <div className="mt-2">
      {events.length > 0 && (
        <div className={cn(
            "hidden md:flex bg-lawyer-dark text-white py-3 rounded-t-lg mb-1 shadow-md items-center px-3 md:px-4"
        )}>
          {columnConfig.map(col => (
            <div key={col.id} className={cn("text-xs font-bold uppercase tracking-wider text-left", col.baseClass, col.mdWidthClass)}>
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
                <div className={cn("p-3 md:p-0 md:flex md:flex-row md:items-start")}>
                  
                  <div className={cn(columnConfig[0].baseClass, columnConfig[0].mdWidthClass, "px-3 md:px-4 py-2 md:py-3 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-gray-800">{formatTime(event.data_hora_inicio)}</div>
                  </div>

                  <div className={cn(columnConfig[1].baseClass, columnConfig[1].mdWidthClass, "px-3 md:px-4 py-2 md:py-3 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <div className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer break-words" onClick={() => onView(event)}>
                        {event.titulo}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 break-words">{event.tipo_evento || '-'}</div>
                    {event.local_evento && <div className="text-xs text-gray-500 mt-0.5 break-words flex items-center"><MapPin size={10} className="mr-1 flex-shrink-0" />{event.local_evento}</div>}
                  </div>

                  <div className={cn(columnConfig[2].baseClass, columnConfig[2].mdWidthClass, "px-3 md:px-4 py-2 md:py-3 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <div className="text-xs text-gray-700 break-words">
                        {event.clientes?.nome ? <span className="flex items-center"><User size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {event.clientes.nome}</span> : 
                         event.processos?.numero_processo ? <span className="flex items-center"><FileText size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {event.processos.numero_processo}</span> : <span className="italic text-gray-400">Nenhum</span>}
                    </div>
                  </div>
                  
                  <div className={cn(columnConfig[3].baseClass, columnConfig[3].mdWidthClass, "px-3 md:px-4 py-2 md:py-3 text-left")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max capitalize", getPriorityBadgeClass(event.prioridade))}>
                      {event.prioridade || 'N/D'}
                    </Badge>
                  </div>
                  
                  <div className={cn(columnConfig[4].baseClass, columnConfig[4].mdWidthClass, "px-3 md:px-4 py-2 md:py-3 text-left")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[4].label}</div>
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}>
                        <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                        {statusStyle.label}
                    </Badge>
                  </div>

                  <div className={cn(columnConfig[5].baseClass, columnConfig[5].mdWidthClass, "px-3 md:px-4 py-2 md:py-3")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => onView(event)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(event)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(event.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left"
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
            {isLoading ? "Carregando..." : selectedDate ? `Nenhum evento para ${format(selectedDate, "PPP", { locale: ptBR })}.` : "Nenhum evento encontrado."}
          </p>
          {!isLoading && <p className="text-sm">Selecione outra data ou adicione um novo evento.</p>}
        </div>
      )}
    </div>
  );
};

export default AgendaEventListAsCards;
