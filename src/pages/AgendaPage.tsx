// src/pages/AgendaPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIconLucide, Plus, MoreVertical, Eye, Edit, Trash2, CalendarDays } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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


  const fetchEvents = useCallback(async (dateToFilter?: Date) => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let query = supabase
        .from('agenda_eventos')
        .select(`
          *,
          clientes (id, nome),
          processos (id, numero_processo)
        `)
        .eq('user_id', user.id);

      if (dateToFilter) {
        const dayStart = format(dateToFilter, 'yyyy-MM-dd') + 'T00:00:00.000Z';
        const dayEnd = format(dateToFilter, 'yyyy-MM-dd') + 'T23:59:59.999Z';
        query = query.gte('data_hora_inicio', dayStart).lte('data_hora_inicio', dayEnd);
      }
      
      query = query.order('data_hora_inicio', { ascending: true });
      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao buscar eventos", description: error.message || "Ocorreu um erro.", variant: "destructive" });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

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
      toast({ title: "Erro ao carregar dados para formulário", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setIsLoadingDropdownData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchEvents(selectedDate);
      fetchDropdownData();
    } else {
      setEvents([]);
    }
  }, [user, selectedDate, fetchEvents, fetchDropdownData]);

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
        setEventoParaForm({ data_hora_inicio: selectedDate || new Date(), duracao_minutos: 60, prioridade: 'média' });
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
        fetchEvents(selectedDate);
        setIsFormOpen(false);
        setEventoParaForm(null);
    } catch (error: any) {
        toast({ title: "Erro ao salvar evento", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
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
            fetchEvents(selectedDate);
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

  const formatTime = (isoString: string) => {
    try {
        return format(parseISO(isoString), 'HH:mm');
    } catch (e) {
        console.warn("Erro ao formatar hora:", isoString, e);
        return "Inválida";
    }
  };
  const getPriorityBadgeClass = (priority?: string | null) => {
    switch (priority) {
        case 'alta': return 'bg-red-100 text-red-700 border-red-300';
        case 'média': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'baixa': return 'bg-green-100 text-green-700 border-green-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
            <CalendarDays className="mr-3 h-7 w-7 text-lawyer-primary" />
            Agenda de Compromissos
          </h1>
          <p className="text-gray-600 text-left mt-1">
            Organize seus prazos, audiências e reuniões.
          </p>
        </div>

        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadcnCalendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} initialFocus />
                </PopoverContent>
              </Popover>
              <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
                <Plus className="mr-2 h-4 w-4" /> Novo Evento
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-10 flex justify-center items-center">
                <Spinner size="lg" /> <span className="ml-2 text-gray-500">Carregando eventos...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] text-gray-600">Hora</TableHead>
                      <TableHead className="text-gray-600">Título</TableHead>
                      <TableHead className="hidden md:table-cell text-gray-600">Tipo</TableHead>
                      <TableHead className="hidden lg:table-cell text-gray-600">Cliente</TableHead>
                      <TableHead className="hidden lg:table-cell text-gray-600">Prioridade</TableHead>
                      <TableHead className="text-right text-gray-600">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length > 0 ? (
                      events.map(event => (
                        <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium py-3 px-4 text-gray-700">{formatTime(event.data_hora_inicio)}</TableCell>
                          <TableCell className="py-3 px-4 text-gray-700">{event.titulo}</TableCell>
                          <TableCell className="hidden md:table-cell py-3 px-4 text-gray-600">{event.tipo_evento || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell py-3 px-4 text-gray-600">{event.clientes?.nome || '-'}</TableCell>
                          <TableCell className="hidden lg:table-cell py-3 px-4">
                            <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClass(event.prioridade))}>{event.prioridade || 'N/D'}</Badge>
                          </TableCell>
                          <TableCell className="text-right py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-lawyer-primary">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(event)} className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenForm(event)} className="cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:!text-red-700 hover:!bg-red-50 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          {isLoading ? "Carregando..." : "Nenhum evento para esta data."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {isFormOpen && (
            <AgendaEventForm
                key={eventoParaForm ? eventoParaForm.id || 'new-event' : 'new-event'}
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialEventData={eventoParaForm || { data_hora_inicio: selectedDate || new Date(), duracao_minutos: 60, prioridade: 'média' }}
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
                onEdit={() => {
                    setIsDetailOpen(false);
                    handleOpenForm(currentEvent);
                }}
            />
        )}
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;