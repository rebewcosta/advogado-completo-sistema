
// src/components/AgendaEventDetail.tsx
import React from 'react';
import { format, parseISO } from 'date-fns'; // Adicionado parseISO
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, User, FileText, Activity, AlertTriangle, Info } from 'lucide-react'; // Ajustado icones
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Added the cn import
import type { Database } from '@/integrations/supabase/types';

type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

type AgendaEventDetailProps = {
  event: EventoAgenda;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: EventoAgenda) => void; // Modificado para passar o evento
};

export const AgendaEventDetail = ({ event, onClose, onDelete, onEdit }: AgendaEventDetailProps) => {
  const dataHoraInicio = parseISO(event.data_hora_inicio); // Converter string ISO para Date
  const formattedDate = format(dataHoraInicio, "PPP", { locale: ptBR });
  const formattedTime = format(dataHoraInicio, "HH:mm");
  const endTime = new Date(dataHoraInicio.getTime() + event.duracao_minutos * 60000);
  const formattedEndTime = format(endTime, "HH:mm");

  const getPriorityBadgeClass = (priority: string | null | undefined) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-300';
      case 'média': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'baixa': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };
  const getStatusBadgeClass = (status: string | null | undefined) => {
    switch (status) {
        case 'Agendado': return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'Concluído': return 'bg-green-100 text-green-700 border-green-300';
        case 'Cancelado': return 'bg-red-100 text-red-700 border-red-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{event.titulo}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClass(event.prioridade))}>
                Prioridade {event.prioridade}
            </Badge>
            {event.status_evento && (
                <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(event.status_evento))}>
                    {event.status_evento}
                </Badge>
            )}
             {event.tipo_evento && (
                <Badge variant="outline" className="text-xs border-purple-300 bg-purple-50 text-purple-700">
                    {event.tipo_evento}
                </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3 overflow-y-auto flex-grow pr-2">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div><p className="font-medium text-sm text-gray-600">Data</p><p className="text-gray-800">{formattedDate}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div><p className="font-medium text-sm text-gray-600">Horário</p><p className="text-gray-800">{formattedTime} - {formattedEndTime} ({event.duracao_minutos} min)</p></div>
          </div>
          {event.local_evento && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div><p className="font-medium text-sm text-gray-600">Local</p><p className="text-gray-800">{event.local_evento}</p></div>
            </div>
          )}
          {event.clientes?.nome && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div><p className="font-medium text-sm text-gray-600">Cliente</p><p className="text-gray-800">{event.clientes.nome}</p></div>
            </div>
          )}
          {event.processos?.numero_processo && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div><p className="font-medium text-sm text-gray-600">Processo</p><p className="text-gray-800">{event.processos.numero_processo}</p></div>
            </div>
          )}
          {event.descricao_evento && (
            <>
              <Separator className="my-2"/>
              <div>
                <p className="font-medium text-sm text-gray-600 mb-1">Descrição</p>
                <p className="text-gray-800 text-sm whitespace-pre-line">{event.descricao_evento}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 sticky bottom-0 bg-white pt-4 border-t gap-2">
            <Button variant="outline" onClick={() => onDelete(event.id)} className="text-red-600 hover:bg-red-50 border-red-300 hover:border-red-400">Excluir</Button>
            <div className="flex-grow"></div> {/* Espaçador */}
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            <Button onClick={() => onEdit(event)} className="btn-primary">Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
