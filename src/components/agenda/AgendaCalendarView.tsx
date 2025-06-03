
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

interface AgendaCalendarViewProps {
  events: EventoAgenda[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onEventClick?: (event: EventoAgenda) => void;
}

const AgendaCalendarView: React.FC<AgendaCalendarViewProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'média': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.data_hora_inicio), date)
    );
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const getEventCountForDate = (date: Date) => {
    return getEventsForDate(date).length;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendário */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarIcon className="mr-2 h-5 w-5 text-lawyer-primary" />
            Calendário de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            locale={ptBR}
            className="rounded-md border p-3 pointer-events-auto"
            components={{
              DayContent: ({ date }) => {
                const eventCount = getEventCountForDate(date);
                const hasEvents = eventCount > 0;
                
                return (
                  <div className="relative w-full h-full flex items-center justify-center p-1">
                    <span className={cn("text-sm", hasEvents && "font-medium")}>
                      {format(date, 'd')}
                    </span>
                    {hasEvents && (
                      <div className="absolute -top-0.5 -right-0.5 z-10">
                        <div className="min-w-[18px] h-[18px] bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] leading-none rounded-full flex items-center justify-center font-bold shadow-md border border-white">
                          {eventCount > 9 ? '9+' : eventCount}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="min-w-[18px] h-[18px] bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] leading-none rounded-full flex items-center justify-center font-bold shadow-md border border-white">
                3
              </div>
              <span>Número de eventos no dia</span>
            </div>
            <div className="text-xs text-gray-500">
              Clique em uma data para ver os eventos do dia
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventos do Dia Selecionado */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5 text-lawyer-primary" />
            {selectedDate 
              ? `Eventos - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`
              : 'Selecione uma data'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                      onEventClick && "hover:shadow-md"
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.titulo}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {format(parseISO(event.data_hora_inicio), 'HH:mm', { locale: ptBR })} 
                          {event.tipo_evento && ` • ${event.tipo_evento}`}
                        </p>
                        {event.local_evento && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            📍 {event.local_evento}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <div className={cn("w-3 h-3 rounded-full", getPriorityColor(event.prioridade))}></div>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {event.prioridade || 'N/D'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum evento agendado para esta data.
              </p>
            )
          ) : (
            <p className="text-gray-500 text-center py-8">
              Clique em uma data no calendário para ver os eventos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaCalendarView;
