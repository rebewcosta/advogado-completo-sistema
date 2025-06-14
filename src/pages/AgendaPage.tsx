
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw } from 'lucide-react';
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import AgendaCalendarView from '@/components/agenda/AgendaCalendarView';
import AgendaEventTable from '@/components/agenda/AgendaEventTable';
import AgendaEventListAsCards from '@/components/agenda/AgendaEventListAsCards';
import { AgendaEventForm } from '@/components/AgendaEventForm';

type AgendaEvent = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

export type EventoAgenda = AgendaEvent;

const AgendaPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("lista");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30)
  });

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('agenda_eventos')
        .select(`
          *,
          clientes!cliente_associado_id(id, nome),
          processos!processo_associado_id(id, numero_processo)
        `)
        .eq('user_id', user.id)
        .order('data_hora_inicio', { ascending: true });

      // Aplicar filtro de data se definido
      if (dateRange?.from) {
        query = query.gte('data_hora_inicio', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('data_hora_inicio', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, dateRange, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (eventData: any) => {
    if (!user) return false;

    try {
      if (selectedEvent) {
        const { error } = await supabase
          .from('agenda_eventos')
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedEvent.id);
        
        if (error) throw error;
        
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('agenda_eventos')
          .insert({
            ...eventData,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso."
        });
      }
      
      await fetchEvents();
      setIsFormOpen(false);
      setSelectedEvent(null);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar evento",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleViewEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso."
      });
      
      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    toast({
      title: "Eventos atualizados",
      description: "A lista de eventos foi atualizada com sucesso."
    });
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.descricao_evento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading && events.length === 0) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando agenda...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Agenda de Compromissos"
          description="Organize seus prazos, audiências e reuniões."
          pageIcon={<Calendar />}
          actionButtonText="Novo Evento"
          onActionButtonClick={() => {
            setSelectedEvent(null);
            setIsFormOpen(true);
          }}
          isLoading={isLoading || isRefreshing}
        />

        {/* Barra de filtros */}
        <Card className="mb-6 shadow-md rounded-lg border border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={isRefreshing}
                className="bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Atualizando..." : "Atualizar Eventos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de visualização */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <div className="hidden md:block">
              <AgendaEventTable
                events={filteredEvents}
                onEdit={handleEditEvent}
                onView={handleViewEvent}
                onDelete={handleDeleteEvent}
                isLoading={isLoading || isRefreshing}
              />
            </div>
            <div className="md:hidden">
              <AgendaEventListAsCards
                events={filteredEvents}
                onEdit={handleEditEvent}
                onView={handleViewEvent}
                onDelete={handleDeleteEvent}
                isLoading={isLoading || isRefreshing}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendario">
            <AgendaCalendarView
              events={filteredEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEventClick={handleEditEvent}
            />
          </TabsContent>
        </Tabs>

        <AgendaEventForm
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSave={handleSaveEvent}
          initialEventData={selectedEvent}
          clientes={[]}
          processos={[]}
        />
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;
