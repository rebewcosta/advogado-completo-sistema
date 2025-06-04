// src/pages/AgendaPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCw, Calendar as CalendarView, Table } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';
import { AgendaEventForm } from '@/components/AgendaEventForm';
import { AgendaEventDetail } from '@/components/AgendaEventDetail';
import AgendaEventListAsCards from '@/components/agenda/AgendaEventListAsCards';
import AgendaEventTable from '@/components/agenda/AgendaEventTable';
import ModernCalendarView from '@/components/agenda/ModernCalendarView';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
    clientes?: { id: string; nome: string } | null;
    processos?: { id: string; numero_processo: string } | null;
};
export type EventoAgendaFormData = {
  titulo: string;
  descricao_evento?: string | null;
  data_hora_inicio: Date;
  duracao_minutos: number;
  local_evento?: string | null;
  cliente_associado_id?: string | null;
  processo_associado_id?: string | null;
  prioridade: 'baixa' | 'média' | 'alta';
  tipo_evento?: string | null;
  status_evento?: string | null;
};

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

const AgendaPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventoAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventoAgenda | null>(null);
  const [eventoParaForm, setEventoParaForm] = useState<Partial<EventoAgendaFormData> & { id?: string} | null>(null);

  const [clientesDoUsuario, setClientesDoUsuario] = useState<ClienteParaSelect[]>([]);
  const [processosDoUsuario, setProcessosDoUsuario] = useState<ProcessoParaSelect[]>([]);
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false);
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchEvents = useCallback(async (dateToFilter?: Date, showLoadingSpinner = true) => {
    if (!user) {
      setEvents([]);
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
      return;
    }
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshingManually(true);

    try {
      let query = supabase
        .from('agenda_eventos')
        .select(`*, clientes (id, nome), processos (id, numero_processo)`)
        .eq('user_id', user.id);

      // Para o calendário, buscar todos os eventos do mês atual ao invés de filtrar por dia
      if (viewMode === 'calendar') {
        query = query.order('data_hora_inicio', { ascending: true });
      } else if (dateToFilter) {
        const dayStart = format(dateToFilter, 'yyyy-MM-dd') + 'T00:00:00.000Z';
        const dayEnd = format(dateToFilter, 'yyyy-MM-dd') + 'T23:59:59.999Z';
        query = query.gte('data_hora_inicio', dayStart).lte('data_hora_inicio', dayEnd);
      }
      
      if (viewMode !== 'calendar') {
        query = query.order('data_hora_inicio', { ascending: true });
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao buscar eventos", description: error.message || "Ocorreu um erro.", variant: "destructive" });
      setEvents([]);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
    }
  }, [user, toast, viewMode]);

  const fetchDropdownData = useCallback(async () => {
    if (!user) return;
    setIsLoadingDropdownData(true);
    try {
      const [clientesRes, processosRes] = await Promise.all([
        supabase.from('clientes').select('id, nome').eq('user_id', user.id).order('nome'),
        supabase.from('processos').select('id, numero_processo').eq('user_id', user.id).order('numero_processo')
      ]);
      if (clientesRes.error) throw clientesRes.error;
      setClientesDoUsuario(clientesRes.data || []);
      if (processosRes.error) throw processosRes.error;
      setProcessosDoUsuario(processosRes.data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados para formulário", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingDropdownData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchEvents(viewMode === 'list' ? selectedDate : undefined); 
      fetchDropdownData(); 
    } else {
      setEvents([]);
      setIsLoading(false); 
    }
  }, [user, selectedDate, fetchEvents, fetchDropdownData, viewMode]);

  const handleOpenForm = (eventToEdit?: EventoAgenda) => {
    if (eventToEdit) {
        const formData: Partial<EventoAgendaFormData> & { id: string } = {
            id: eventToEdit.id,
            titulo: eventToEdit.titulo,
            descricao_evento: eventToEdit.descricao_evento,
            data_hora_inicio: new Date(eventToEdit.data_hora_inicio),
            duracao_minutos: eventToEdit.duracao_minutos,
            local_evento: eventToEdit.local_evento,
            cliente_associado_id: eventToEdit.cliente_associado_id,
            processo_associado_id: eventToEdit.processo_associado_id,
            prioridade: eventToEdit.prioridade as 'baixa' | 'média' | 'alta',
            tipo_evento: eventToEdit.tipo_evento,
            status_evento: eventToEdit.status_evento,
        };
        setEventoParaForm(formData);
        setCurrentEvent(null);
    } else {
        const initialDate = selectedDate || new Date();
        setEventoParaForm({ 
            data_hora_inicio: initialDate, 
            duracao_minutos: 60, 
            prioridade: 'média', 
            status_evento: 'Agendado',
            tipo_evento: 'Reunião'
        });
        setCurrentEvent(null);
    }
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleSaveEvent = async (formData: EventoAgendaFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    const dataHoraInicioISO = formData.data_hora_inicio.toISOString();
    const dadosParaSupabase = {
        user_id: user.id,
        titulo: formData.titulo,
        descricao_evento: formData.descricao_evento,
        data_hora_inicio: dataHoraInicioISO,
        duracao_minutos: Number(formData.duracao_minutos),
        local_evento: formData.local_evento,
        cliente_associado_id: formData.cliente_associado_id || null,
        processo_associado_id: formData.processo_associado_id || null,
        prioridade: formData.prioridade,
        tipo_evento: formData.tipo_evento || null,
        status_evento: formData.status_evento || 'Agendado',
    };

    try {
        if (eventoParaForm && eventoParaForm.id) {
            const { data: updatedEvent, error } = await supabase
                .from('agenda_eventos')
                .update(dadosParaSupabase)
                .eq('id', eventoParaForm.id)
                .eq('user_id', user.id)
                .select('*, clientes (id, nome), processos (id, numero_processo)')
                .single();
            if (error) throw error;
            toast({ title: "Evento atualizado!", description: `O evento "${updatedEvent?.titulo}" foi atualizado.` });
        } else {
            const { data: newEvent, error } = await supabase
                .from('agenda_eventos')
                .insert(dadosParaSupabase)
                .select('*, clientes (id, nome), processos (id, numero_processo)')
                .single();
            if (error) throw error;
            toast({ title: "Evento criado!", description: `O evento "${newEvent?.titulo}" foi adicionado à agenda.` });
        }
        fetchEvents(selectedDate, false);
        setIsFormOpen(false);
        setEventoParaForm(null);
    } catch (error: any) {
        toast({ title: "Erro ao salvar evento", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user || isSubmitting) return;
    const eventToDelete = events.find(e => e.id === eventId);
    if (eventToDelete && window.confirm(`Tem certeza que deseja excluir o evento "${eventToDelete.titulo}"?`)) {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('agenda_eventos')
                .delete()
                .eq('id', eventId)
                .eq('user_id', user.id);
            if (error) throw error;
            toast({ title: "Evento excluído!", description: `O evento "${eventToDelete.titulo}" foi removido.` });
            fetchEvents(selectedDate, false);
            setIsDetailOpen(false);
            setCurrentEvent(null);
        } catch (error: any) {
            toast({ title: "Erro ao excluir evento", description: error.message || "Ocorreu um erro.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleViewDetails = (event: EventoAgenda) => {
    setCurrentEvent(event);
    setIsDetailOpen(true);
    setIsFormOpen(false);
  };
  
  const handleManualRefresh = () => {
    fetchEvents(selectedDate, true); 
  };

  const isLoadingCombined = isLoading || isSubmitting || isRefreshingManually;

  if (isLoadingCombined && events.length === 0 && !isRefreshingManually) {
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
            pageIcon={<CalendarDays />}
            actionButtonText="Novo Evento"
            onActionButtonClick={() => handleOpenForm()}
            isLoading={isLoadingCombined}
        />
        
        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button 
                            variant={"outline"} 
                            className={cn(
                                "w-full sm:w-auto justify-start text-left font-normal text-sm h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg",
                                !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <ShadcnCalendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus locale={ptBR} className="p-3 pointer-events-auto" />
                        </PopoverContent>
                    </Popover>
                    
                    <Button 
                        onClick={handleManualRefresh} 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoadingCombined} 
                        className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingCombined ? 'animate-spin' : ''}`} />
                        {isLoadingCombined ? 'Atualizando...' : 'Atualizar Eventos'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Tabs para alternar entre Lista e Calendário */}
        <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'list' | 'calendar')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarView className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="hidden md:block">
                <AgendaEventTable
                    events={events}
                    onEdit={handleOpenForm}
                    onView={handleViewDetails}
                    onDelete={handleDeleteEvent}
                    isLoading={isLoadingCombined}
                    selectedDate={selectedDate}
                />
            </div>
            <div className="md:hidden">
                <AgendaEventListAsCards
                    events={events}
                    onEdit={handleOpenForm}
                    onView={handleViewDetails}
                    onDelete={handleDeleteEvent}
                    isLoading={isLoadingCombined}
                    selectedDate={selectedDate}
                />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ModernCalendarView
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEventClick={handleViewDetails}
            />
          </TabsContent>
        </Tabs>

        {isFormOpen && (
            <AgendaEventForm
                key={eventoParaForm ? eventoParaForm.id || 'new-event-key' : 'new-event-key'}
                isOpen={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) setEventoParaForm(null);
                    setIsFormOpen(open);
                }}
                initialEventData={eventoParaForm || { data_hora_inicio: selectedDate || new Date(), duracao_minutos: 60, prioridade: 'média', tipo_evento: 'Reunião', status_evento: 'Agendado' }}
                onSave={handleSaveEvent}
                clientes={clientesDoUsuario}
                processos={processosDoUsuario}
                isLoadingDropdownData={isLoadingDropdownData}
            />
        )}

        {isDetailOpen && currentEvent && (
            <AgendaEventDetail
                event={currentEvent}
                onClose={() => { setIsDetailOpen(false); setCurrentEvent(null); }}
                onDelete={handleDeleteEvent}
                onEdit={(eventToEdit) => {
                    setIsDetailOpen(false); 
                    handleOpenForm(eventToEdit); 
                }}
            />
        )}
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;
