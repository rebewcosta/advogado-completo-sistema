import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Plus, Clock, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { AgendaEventForm } from '@/components/AgendaEventForm';
import { AgendaEventDetail } from '@/components/AgendaEventDetail';

// Tipos para os eventos da agenda
export type EventPriority = 'baixa' | 'média' | 'alta';

export type AgendaEvent = {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  duration: number; // em minutos
  location?: string;
  clientName?: string;
  processNumber?: string; 
  priority: EventPriority;
};

const AgendaPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<AgendaEvent[]>(MOCK_EVENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const { toast } = useToast();
  
  // Filtrar eventos para o dia selecionado
  const selectedDateEvents = events.filter(
    event => format(event.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  // Exibir notificações para eventos próximos quando a página carrega
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Encontrar eventos para hoje e amanhã que são de alta prioridade
    const urgentEvents = events.filter(event => {
      const eventDate = new Date(event.dateTime);
      const isToday = format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      const isTomorrow = format(eventDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
      return (isToday || isTomorrow) && event.priority === 'alta';
    });
    
    // Notificar sobre eventos urgentes
    if (urgentEvents.length > 0) {
      urgentEvents.forEach(event => {
        const timeUntil = event.dateTime.getTime() - today.getTime();
        const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
        
        if (hoursUntil < 24) {
          toast({
            title: "Compromisso importante em breve!",
            description: `${event.title} - ${format(event.dateTime, 'PPp', { locale: ptBR })}`,
            variant: "destructive",
          });
        }
      });
    }
    
    // Verificar prazos vencendo
    const deadlineEvents = events.filter(event => {
      const eventDate = new Date(event.dateTime);
      const isToday = format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      return isToday && event.title.toLowerCase().includes('prazo');
    });
    
    if (deadlineEvents.length > 0) {
      deadlineEvents.forEach(event => {
        toast({
          title: "Prazo vence hoje!",
          description: `${event.title} - ${format(event.dateTime, 'HH:mm', { locale: ptBR })}`,
          variant: "destructive",
        });
      });
    }
  }, [events, toast]);

  // Função para adicionar um novo evento
  const handleAddEvent = (event: Omit<AgendaEvent, 'id'>) => {
    const newEvent: AgendaEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    
    setEvents([...events, newEvent]);
    setIsFormOpen(false);
    toast({
      title: 'Evento adicionado',
      description: `${event.title} adicionado para ${format(event.dateTime, 'PPpp', { locale: ptBR })}`,
    });
  };

  // Função para visualizar detalhes de um evento
  const handleViewEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
  };

  // Função para deletar um evento
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setSelectedEvent(null);
    toast({
      title: 'Evento removido',
      description: 'O compromisso foi removido da agenda',
    });
  };

  // Função para fechar o formulário
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Função para fechar a visualização de detalhes
  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  // Formatação do mês atual para exibição
  const formattedMonth = format(date, 'MMMM yyyy', { locale: ptBR });
  
  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    const previousMonth = new Date(date);
    previousMonth.setMonth(date.getMonth() - 1);
    setDate(previousMonth);
  };
  
  // Navegar para o mês seguinte
  const goToNextMonth = () => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(date.getMonth() + 1);
    setDate(nextMonth);
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <Button onClick={() => setIsFormOpen(true)} className="bg-lawyer-primary hover:bg-lawyer-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Compromisso
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendário */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center capitalize">{formattedMonth}</CardTitle>
                <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border p-3 pointer-events-auto"
                showOutsideDays
              />
            </CardContent>
          </Card>
          
          {/* Lista de Compromissos */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Compromissos de {format(date, 'PPP', { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length > 0 
                  ? `${selectedDateEvents.length} compromisso(s) agendado(s) para hoje`
                  : 'Nenhum compromisso agendado para este dia'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Compromisso</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Prioridade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDateEvents.map((event) => (
                      <TableRow key={event.id} onClick={() => handleViewEvent(event)} className="cursor-pointer hover:bg-muted/60">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(event.dateTime, 'HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.clientName || '-'}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            event.priority === 'alta' ? 'bg-red-100 text-red-800' :
                            event.priority === 'média' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.priority}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p>Nenhum compromisso para este dia</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsFormOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar compromisso
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal para adicionar novo evento */}
      {isFormOpen && (
        <AgendaEventForm 
          onClose={handleCloseForm} 
          onSave={handleAddEvent} 
          initialDate={date}
        />
      )}
      
      {/* Modal para visualizar detalhes */}
      {selectedEvent && (
        <AgendaEventDetail
          event={selectedEvent}
          onClose={handleCloseDetail}
          onDelete={handleDeleteEvent}
        />
      )}
    </AdminLayout>
  );
};

// Dados de exemplo para a agenda
const MOCK_EVENTS: AgendaEvent[] = [
  {
    id: '1',
    title: 'Audiência - Caso Silva',
    description: 'Audiência de conciliação para o processo 12345-67.2023.8.26.0000',
    dateTime: new Date(new Date().setHours(10, 0, 0, 0)),
    duration: 90,
    location: 'Fórum Central - Sala 302',
    clientName: 'Maria Silva',
    processNumber: '12345-67.2023.8.26.0000',
    priority: 'alta',
  },
  {
    id: '2',
    title: 'Reunião com cliente',
    description: 'Reunião para discutir estratégia processual',
    dateTime: new Date(new Date().setHours(14, 30, 0, 0)),
    duration: 60,
    clientName: 'João Pereira',
    processNumber: '98765-43.2023.8.26.0000',
    priority: 'média',
  },
  {
    id: '3',
    title: 'Prazo final - Recurso',
    description: 'Entregar recurso de apelação',
    dateTime: new Date(new Date().setHours(16, 0, 0, 0)),
    duration: 30,
    clientName: 'Carlos Oliveira',
    processNumber: '54321-98.2023.8.26.0000',
    priority: 'alta',
  },
  {
    id: '4',
    title: 'Entrevista com testemunha',
    description: 'Coleta de depoimento preliminar',
    dateTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    duration: 120,
    clientName: 'Ana Santos',
    processNumber: '13579-24.2023.8.26.0000',
    priority: 'média',
  },
];

export default AgendaPage;
