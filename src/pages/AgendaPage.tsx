
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Pencil, Trash2, UserRound } from 'lucide-react';

// Event types
export type EventPriority = 'baixa' | 'média' | 'alta';

// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: string;
  status: string;
  cliente: string;
  createdAt: Date;
}

// Interface for the AgendaEvent used in AgendaEventDetail and AgendaEventForm
export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  duration: number;
  location?: string;
  clientName?: string;
  processNumber?: string;
  priority: EventPriority;
}

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'Audiência - João Silva',
    description: 'Preparar documentos e testemunhas para audiência.',
    date: new Date('2024-07-15'),
    time: '10:00',
    location: 'Fórum Central',
    type: 'Audiência',
    status: 'Agendado',
    cliente: 'João Silva',
    createdAt: new Date('2023-06-10'),
  },
  {
    id: '2',
    title: 'Reunião com cliente',
    description: 'Discutir andamento do processo e próximos passos.',
    date: new Date('2024-07-20'),
    time: '14:30',
    location: 'Escritório',
    type: 'Reunião',
    status: 'Agendado',
    cliente: 'Maria Oliveira',
    createdAt: new Date('2023-06-12'),
  },
  {
    id: '3',
    title: 'Prazo final - Recurso',
    description: 'Elaborar e protocolar recurso.',
    date: new Date('2024-07-25'),
    time: '18:00',
    location: 'Tribunal de Justiça',
    type: 'Prazo',
    status: 'Pendente',
    cliente: 'Empresa ABC Ltda',
    createdAt: new Date('2023-06-15'),
  },
  {
    id: '4',
    title: 'Análise de contrato',
    description: 'Revisar e emitir parecer sobre contrato.',
    date: new Date('2024-08-01'),
    time: '09:00',
    location: 'Escritório',
    type: 'Tarefa',
    status: 'Em andamento',
    cliente: 'Pedro Santos',
    createdAt: new Date('2023-06-18'),
  },
  {
    id: '5',
    title: 'Depoimento testemunha',
    description: 'Preparar e acompanhar depoimento.',
    date: new Date('2024-08-05'),
    time: '15:00',
    location: 'Fórum Criminal',
    type: 'Audiência',
    status: 'Agendado',
    cliente: 'Roberto Costa',
    createdAt: new Date('2023-06-20'),
  },
  {
    id: '6',
    title: 'Elaboração de petição inicial',
    description: 'Redigir e revisar petição inicial.',
    date: new Date('2024-08-10'),
    time: '11:00',
    location: 'Escritório',
    type: 'Tarefa',
    status: 'Pendente',
    cliente: 'Carla Souza',
    createdAt: new Date('2023-06-22'),
  },
  {
    id: '7',
    title: 'Reunião de alinhamento',
    description: 'Alinhar estratégias com a equipe.',
    date: new Date('2024-08-15'),
    time: '16:00',
    location: 'Sala de Reuniões',
    type: 'Reunião',
    status: 'Agendado',
    cliente: 'Equipe Interna',
    createdAt: new Date('2023-06-25'),
  },
  {
    id: '8',
    title: 'Contestação - Caso XYZ',
    description: 'Preparar e protocolar contestação.',
    date: new Date('2024-08-20'),
    time: '17:00',
    location: 'Tribunal Regional do Trabalho',
    type: 'Prazo',
    status: 'Pendente',
    cliente: 'Empresa XYZ S.A.',
    createdAt: new Date('2023-06-28'),
  },
  {
    id: '9',
    title: 'Consulta jurídica',
    description: 'Atender e orientar novo cliente.',
    date: new Date('2024-08-25'),
    time: '14:00',
    location: 'Escritório',
    type: 'Reunião',
    status: 'Agendado',
    cliente: 'Novo Cliente',
    createdAt: new Date('2023-07-01'),
  },
  {
    id: '10',
    title: 'Audiência de conciliação',
    description: 'Participar de audiência de conciliação.',
    date: new Date('2024-08-30'),
    time: '09:30',
    location: 'Centro de Conciliação',
    type: 'Audiência',
    status: 'Agendado',
    cliente: 'Antônio Pereira',
    createdAt: new Date('2023-07-05'),
  },
];

const AgendaPage = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    date: new Date(),
    time: '09:00',
    location: '',
    type: 'Reunião',
    status: 'Agendado',
    cliente: '',
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  // Filter events by selected date
  const filteredEvents = events.filter(event => {
    if (!selectedDate) return true;
    return event.date.toDateString() === selectedDate.toDateString();
  });

  // Function to handle event creation
  const handleCreateEvent = () => {
    const newEventWithId: Event = {
      id: String(Date.now()),
      ...newEvent,
      createdAt: new Date(),
    };
    setEvents([...events, newEventWithId]);
    setNewEvent({
      title: '',
      description: '',
      date: new Date(),
      time: '09:00',
      location: '',
      type: 'Reunião',
      status: 'Agendado',
      cliente: '',
    });
    setIsNewEventDialogOpen(false);
    toast({
      title: "Evento criado",
      description: "Novo evento adicionado à agenda.",
    });
  };

  // Function to handle event update
  const handleUpdateEvent = () => {
    if (!selectedEvent) return;

    const updatedEvents = events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...selectedEvent,
          date: selectedEvent.date,
        };
      }
      return event;
    });

    setEvents(updatedEvents);
    setSelectedEvent(null);
    setIsEditEventDialogOpen(false);
    toast({
      title: "Evento atualizado",
      description: "Evento atualizado com sucesso.",
    });
  };

  // Function to handle event deletion
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Evento excluído",
      description: "Evento removido da agenda.",
    });
  };

  // Function to format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <Button onClick={() => setIsNewEventDialogOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full md:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map(event => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.cliente}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{event.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedEvent(event);
                          setIsEditEventDialogOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nenhum evento para este dia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* New Event Dialog */}
        <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
              <DialogDescription>
                Adicione um novo evento à sua agenda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="col-span-3 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newEvent.date, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => setNewEvent({ ...newEvent, date: date || new Date() })}
                      initialFocus
                      locale={ptBR}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="cliente"
                  value={newEvent.cliente}
                  onChange={(e) => setNewEvent({ ...newEvent, cliente: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Input
                  id="type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  id="status"
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={handleCreateEvent}>Criar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Edite os detalhes do evento selecionado.
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Data
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className="col-span-3 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedEvent.date, "PPP", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedEvent.date}
                        onSelect={(date) => setSelectedEvent({ ...selectedEvent, date: date || new Date() })}
                        initialFocus
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Hora
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedEvent.time}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cliente" className="text-right">
                    Cliente
                  </Label>
                  <Input
                    id="cliente"
                    value={selectedEvent.cliente}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, cliente: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Input
                    id="type"
                    value={selectedEvent.type}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, type: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Input
                    id="status"
                    value={selectedEvent.status}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, status: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={selectedEvent.description}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Localização
                  </Label>
                  <Input
                    id="location"
                    value={selectedEvent.location}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" onClick={handleUpdateEvent}>Atualizar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;
