
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

interface ModernCalendarViewProps {
  events: EventoAgenda[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onEventClick?: (event: EventoAgenda) => void;
}

const ModernCalendarView: React.FC<ModernCalendarViewProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate || new Date());

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

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Gerar dias do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendário Moderno */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <CalendarIcon className="mr-3 h-6 w-6 text-blue-600" />
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="h-8 w-8 p-0 border-gray-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="h-8 w-8 p-0 border-gray-300 hover:bg-blue-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const eventCount = getEventsForDate(day).length;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative h-12 w-full flex items-center justify-center cursor-pointer rounded-lg transition-all duration-200 hover:bg-blue-50",
                    isSelected && "bg-blue-600 text-white shadow-md",
                    isTodayDate && !isSelected && "bg-blue-100 text-blue-800 font-bold",
                    !isCurrentMonth && "text-gray-300",
                    isCurrentMonth && !isSelected && !isTodayDate && "text-gray-700 hover:text-blue-600"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <span className="text-sm font-medium">
                    {format(day, 'd')}
                  </span>
                  
                  {/* Círculo azul escuro com contador de eventos - SEMPRE VISÍVEL quando há eventos */}
                  {eventCount > 0 && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className="min-w-[18px] h-[18px] bg-blue-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border border-white">
                        {eventCount > 9 ? '9+' : eventCount}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="min-w-[18px] h-[18px] bg-blue-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border border-white">
                  3
                </div>
                <span>Eventos no dia</span>
              </div>
              <div className="text-xs text-gray-500">
                • Clique em uma data para ver detalhes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventos do Dia Selecionado */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <Clock className="mr-3 h-6 w-6 text-blue-600" />
            {selectedDate 
              ? `Eventos - ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`
              : 'Selecione uma data'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-4 border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 bg-white",
                      onEventClick && "hover:bg-blue-50"
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{event.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(parseISO(event.data_hora_inicio), 'HH:mm', { locale: ptBR })} 
                          {event.tipo_evento && ` • ${event.tipo_evento}`}
                        </p>
                        {event.local_evento && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            📍 {event.local_evento}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3">
                        <div className={cn("w-3 h-3 rounded-full", getPriorityColor(event.prioridade))}></div>
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {event.prioridade || 'N/D'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nenhum evento agendado para esta data.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                Clique em uma data no calendário para ver os eventos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernCalendarView;
