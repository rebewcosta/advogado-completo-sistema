
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar as CalendarIcon,
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  FileText,
  MapPin,
  CheckCircle,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Audiência - Processo nº 0001234-56.2023.8.26.0100",
    date: "2025-06-18",
    time: "14:00",
    location: "3ª Vara Cível - Fórum Central",
    client: "João Silva",
    description: "Audiência de conciliação",
    completed: false
  },
  {
    id: 2,
    title: "Reunião com cliente",
    date: "2025-06-18",
    time: "09:30",
    location: "Escritório",
    client: "Maria Oliveira",
    description: "Discussão sobre novo caso",
    completed: false
  },
  {
    id: 3,
    title: "Prazo final - Recurso",
    date: "2025-06-20",
    time: "18:00",
    location: "Online",
    client: "Empresa ABC Ltda",
    description: "Entregar recurso de apelação",
    completed: false
  },
  {
    id: 4,
    title: "Depoimento de testemunha",
    date: "2025-06-21",
    time: "10:00",
    location: "5ª Vara do Trabalho",
    client: "Roberto Costa",
    description: "Oitiva de testemunha da parte contrária",
    completed: false
  },
  {
    id: 5,
    title: "Almoço com Dr. Rodrigo",
    date: "2025-06-19",
    time: "12:30",
    location: "Restaurante Jangada",
    client: "",
    description: "Discussão sobre parceria",
    completed: false
  }
];

// Helper function to group events by date
const groupEventsByDate = (events: any[]) => {
  return events.reduce((acc: any, event: any) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});
};

const AgendaPage = () => {
  const [events, setEvents] = useState(mockEvents);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const { toast } = useToast();
  
  // Function to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate the first and last day of the current week
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(date);
    monday.setDate(diff);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      weekDates.push(nextDate);
    }
    
    return weekDates;
  };
  
  // Get current week's dates
  const weekDates = getWeekDates(selectedDate);
  
  // Filter events for the current week
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return weekDates.some(date => formatDate(date) === event.date);
  });
  
  // Group events by date
  const groupedEvents = groupEventsByDate(weekEvents);
  
  const handleAddOrUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const eventData = Object.fromEntries(formData.entries()) as any;
    
    if (currentEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === currentEvent.id ? {...event, ...eventData, id: event.id} : event
      ));
      toast({
        title: "Compromisso atualizado",
        description: "As informações do compromisso foram atualizadas com sucesso.",
      });
    } else {
      // Add new event
      setEvents([...events, {
        ...eventData,
        id: events.length + 1,
        completed: false
      }]);
      toast({
        title: "Compromisso adicionado",
        description: "O novo compromisso foi adicionado com sucesso.",
      });
    }
    
    setIsModalOpen(false);
    setCurrentEvent(null);
  };
  
  const toggleEventCompletion = (id: number) => {
    setEvents(events.map(event => 
      event.id === id ? {...event, completed: !event.completed} : event
    ));
  };
  
  const deleteEvent = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este compromisso?")) {
      setEvents(events.filter(event => event.id !== id));
      toast({
        title: "Compromisso excluído",
        description: "O compromisso foi removido com sucesso.",
      });
    }
  };
  
  const navigatePrev = () => {
    const newDate = new Date(selectedDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setSelectedDate(newDate);
  };
  
  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setSelectedDate(newDate);
  };
  
  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
    
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
    const dayStr = date.toLocaleDateString('pt-BR', options);
    
    return (
      <div className={`text-center p-2 ${isToday ? 'bg-lawyer-primary text-white rounded-t-lg' : ''}`}>
        {dayStr}
      </div>
    );
  };
  
  const getEventTimeDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Agenda & Compromissos</h1>
              <p className="text-gray-600">Organize seus compromissos e nunca perca um prazo</p>
            </div>
            <button 
              onClick={() => {
                setCurrentEvent(null);
                setIsModalOpen(true);
              }} 
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-1" />
              Novo Compromisso
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold mx-4">
                  {currentView === 'day' && selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {currentView === 'week' && `Semana de ${weekDates[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} a ${weekDates[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  {currentView === 'month' && selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={navigateNext} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button 
                  className="ml-4 px-3 py-1 border rounded-md hover:bg-gray-50"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Hoje
                </button>
              </div>
              <div className="flex rounded-md shadow-sm">
                <button 
                  onClick={() => setCurrentView('day')} 
                  className={`px-4 py-2 text-sm ${currentView === 'day' ? 'bg-lawyer-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Dia
                </button>
                <button 
                  onClick={() => setCurrentView('week')} 
                  className={`px-4 py-2 text-sm ${currentView === 'week' ? 'bg-lawyer-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setCurrentView('month')} 
                  className={`px-4 py-2 text-sm ${currentView === 'month' ? 'bg-lawyer-primary text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  Mês
                </button>
              </div>
            </div>
            
            {/* Week View */}
            {currentView === 'week' && (
              <div className="grid grid-cols-7 min-h-[600px] border-b">
                {weekDates.map((date, i) => (
                  <div key={i} className="border-r last:border-r-0">
                    {formatDayHeader(date)}
                    <div className="min-h-[500px] p-2">
                      {groupedEvents[formatDate(date)]?.map((event: any) => (
                        <div 
                          key={event.id} 
                          className={`mb-2 p-2 rounded-md text-sm cursor-pointer hover:shadow-md transition-all ${
                            event.completed 
                              ? 'bg-gray-100 text-gray-500 line-through' 
                              : 'bg-blue-50 border-l-4 border-lawyer-primary'
                          }`}
                          onClick={() => {
                            setCurrentEvent(event);
                            setIsModalOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{event.title}</p>
                            <button 
                              className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEventCompletion(event.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </div>
                          {event.time && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{getEventTimeDisplay(event.time)}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upcoming Events Section */}
            <div className="p-4">
              <h3 className="font-semibold mb-4">Próximos Compromissos</h3>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.date) >= new Date() && !event.completed)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="bg-lawyer-primary/10 p-3 rounded-lg text-lawyer-primary flex flex-col items-center justify-center min-w-[60px]">
                        <CalendarIcon className="h-5 w-5 mb-1" />
                        <span className="text-sm font-semibold">
                          {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            {event.time && (
                              <div className="flex items-center text-gray-600 mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{getEventTimeDisplay(event.time)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex">
                            <button 
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                              onClick={() => {
                                setCurrentEvent(event);
                                setIsModalOpen(true);
                              }}
                              title="Editar compromisso"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-y-1 gap-x-3 mt-2">
                          {event.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.client && (
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-1" />
                              <span>{event.client}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal para adicionar/editar compromisso */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentEvent ? 'Editar Compromisso' : 'Novo Compromisso'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateEvent}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    defaultValue={currentEvent?.title || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input 
                      type="date" 
                      id="date" 
                      name="date" 
                      defaultValue={currentEvent?.date || formatDate(new Date())}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input 
                      type="time" 
                      id="time" 
                      name="time" 
                      defaultValue={currentEvent?.time || ''}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    defaultValue={currentEvent?.location || ''}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input 
                    type="text" 
                    id="client" 
                    name="client" 
                    defaultValue={currentEvent?.client || ''}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    defaultValue={currentEvent?.description || ''}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary h-24"
                  />
                </div>
              </div>
              <div className="p-4 border-t flex justify-between">
                {currentEvent && (
                  <button 
                    type="button" 
                    onClick={() => deleteEvent(currentEvent.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentEvent(null);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {currentEvent ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AgendaPage;
