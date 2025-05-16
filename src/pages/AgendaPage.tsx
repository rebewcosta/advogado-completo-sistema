import React, { useState, useEffect } from 'react';
import { format, parseISO, isToday, startOfToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, CalendarPlus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AgendaEventForm } from '@/components/AgendaEventForm';
import { AgendaEventDetail } from '@/components/AgendaEventDetail';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// Tipagem para eventos da agenda
export type EventPriority = 'baixa' | 'média' | 'alta';

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  dateTime: Date;
  duration: number; // minutes
  location?: string;
  clientName?: string;
  processNumber?: string;
  priority: EventPriority;
}

const AgendaPage = () => {
  const [date, setDate] = useState<Date>(startOfToday());
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    // Carregar eventos do localStorage, se disponíveis
    const savedEvents = localStorage.getItem('agendaEvents');
    return savedEvents ? JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      dateTime: parseISO(event.dateTime)
    })) : [];
  });
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [showEventDetail, setShowEventDetail] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  // Salvar eventos no localStorage sempre que forem atualizados
  useEffect(() => {
    localStorage.setItem('agendaEvents', JSON.stringify(
      events.map(event => ({
        ...event,
        dateTime: event.dateTime.toISOString()
      }))
    ));
  }, [events]);

  // Filtrar eventos por data e termo de busca
  const filteredEvents = events
    .filter(event => {
      const eventDate = new Date(event.dateTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    })
    .filter(event => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(search) ||
        (event.description || '').toLowerCase().includes(search) ||
        (event.clientName || '').toLowerCase().includes(search) ||
        (event.location || '').toLowerCase().includes(search) ||
        (event.processNumber || '').toLowerCase().includes(search)
      );
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  // Funções para manipulação de eventos
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSaveEvent = (eventData: Omit<AgendaEvent, 'id'>) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    
    setEvents([...events, newEvent]);
    setShowEventForm(false);
    
    toast({
      title: "Evento criado",
      description: `${newEvent.title} foi adicionado à sua agenda.`,
    });
  };

  const handleViewEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setShowEventDetail(false);
    
    toast({
      title: "Evento excluído",
      description: "O evento foi removido da sua agenda.",
      variant: "destructive",
    });
  };

  // Avançar/retroceder um dia
  const navigateDay = (amount: number) => {
    setDate(prev => addDays(prev, amount));
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Agenda</h1>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleAddEvent} className="bg-lawyer-primary hover:bg-lawyer-primary/90">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateDay(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        <span>
                          {format(date, "PPP", { locale: ptBR })}
                          {isToday(date) && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                              Hoje
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      className="rounded-md border"
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigateDay(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                locale={ptBR}
              />
            </CardContent>
          </Card>
          
          {/* Lista de Eventos */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-10 w-full"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="font-semibold flex items-center text-gray-500 text-sm uppercase tracking-wide">
                  <Clock className="h-4 w-4 mr-2" />
                  {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  {isToday(date) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Hoje</span>}
                </h2>
                
                {filteredEvents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleViewEvent(event)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer transition-colors",
                          event.priority === 'baixa' ? "bg-blue-50 hover:bg-blue-100" :
                          event.priority === 'média' ? "bg-amber-50 hover:bg-amber-100" :
                          "bg-red-50 hover:bg-red-100"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {format(new Date(event.dateTime), 'HH:mm')}
                                {event.duration && ` (${event.duration} min)`}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            {event.clientName && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {event.clientName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      {searchTerm ? 'Nenhum evento encontrado para essa busca.' : 'Nenhum evento agendado para este dia.'}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleAddEvent}
                      className="mt-2"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Formulário para adicionar/editar evento - usando Dialog para renderizar corretamente */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-lg p-0 overflow-auto max-h-[90vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {showEventForm && (
            <AgendaEventForm
              onSave={handleSaveEvent}
              onClose={() => setShowEventForm(false)}
              initialDate={date}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de detalhes do evento */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-lg p-0 overflow-auto max-h-[90vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {showEventDetail && selectedEvent && (
            <AgendaEventDetail
              event={selectedEvent}
              onClose={() => setShowEventDetail(false)}
              onDelete={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AgendaPage;
