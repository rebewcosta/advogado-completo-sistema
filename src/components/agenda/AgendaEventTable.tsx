// src/components/agenda/AgendaEventTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, MapPin, User, FileText, CalendarDays } from 'lucide-react'; // <<< CalendarDays ADICIONADO AQUI
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EventoAgenda } from '@/pages/AgendaPage';

interface AgendaEventTableProps {
  events: EventoAgenda[];
  onEdit: (event: EventoAgenda) => void;
  onView: (event: EventoAgenda) => void;
  onDelete: (eventId: string) => void;
  isLoading: boolean;
  selectedDate?: Date;
}

const AgendaEventTable: React.FC<AgendaEventTableProps> = ({
  events,
  onEdit,
  onView,
  onDelete,
  isLoading,
  selectedDate
}) => {

  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return '-';
    try {
        return format(parseISO(isoString), 'HH:mm');
    } catch (e) {
        return "Inválida"; 
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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200/80 shadow-md bg-white">
      <Table className="min-w-full">
        <TableHeader className="bg-lawyer-dark">
          <TableRow className="hover:bg-lawyer-dark/90">
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-[80px]">Hora</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Título</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Tipo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden lg:table-cell">Associado a</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Prioridade</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/70">
          {events.length > 0 ? (
            events.map((event) => {
              const statusStyle = getStatusBadgeClass(event.status_evento);
              return (
                <TableRow key={event.id} className="hover:bg-gray-50/60 transition-colors text-left">
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{formatTime(event.data_hora_inicio)}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer"
                      onClick={() => onView(event)}
                    >
                      {event.titulo}
                    </div>
                    {event.local_evento && <div className="text-xs text-gray-500 mt-0.5 flex items-center"><MapPin size={10} className="mr-1 flex-shrink-0" />{event.local_evento}</div>}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{event.tipo_evento || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 hidden lg:table-cell">
                    {event.clientes?.nome ? <span className="flex items-center"><User size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {event.clientes.nome}</span> : 
                     event.processos?.numero_processo ? <span className="flex items-center"><FileText size={12} className="mr-1 text-gray-400 flex-shrink-0"/> {event.processos.numero_processo}</span> : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                     <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max capitalize", getPriorityBadgeClass(event.prioridade))}>
                      {event.prioridade || 'N/D'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}>
                        <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                        {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-500">
                 <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" /> {/* Ícone correto */}
                <p className="font-medium mb-1">
                  {isLoading ? "Carregando..." : selectedDate ? `Nenhum evento para ${format(selectedDate, "PPP", { locale: ptBR })}.` : "Nenhum evento encontrado."}
                </p>
                {!isLoading && <p className="text-sm">Selecione outra data ou adicione um novo evento.</p>}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgendaEventTable;