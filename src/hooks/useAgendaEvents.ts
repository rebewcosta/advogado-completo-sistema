import { useState, useEffect, useCallback } from 'react';
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { AgendaEvent } from '@/types/agenda';

export const useAgendaEvents = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      // Prepara os dados garantindo que todos os campos obrigatórios estejam presentes
      const dataToSave = {
        user_id: user.id,
        titulo: eventData.titulo || '',
        descricao_evento: eventData.descricao_evento || '',
        data_hora_inicio: eventData.data_hora_inicio instanceof Date 
          ? eventData.data_hora_inicio.toISOString() 
          : new Date(eventData.data_hora_inicio).toISOString(),
        duracao_minutos: eventData.duracao_minutos || 60,
        local_evento: eventData.local_evento || '',
        prioridade: eventData.prioridade || 'média',
        tipo_evento: eventData.tipo_evento || 'reuniao',
        status_evento: eventData.status_evento || 'agendado',
        cliente_associado_id: eventData.cliente_associado_id || null,
        processo_associado_id: eventData.processo_associado_id || null
      };

      const { error } = await supabase
        .from('agenda_eventos')
        .insert(dataToSave);
      
      if (error) throw error;
      
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso."
      });
      
      await fetchEvents();
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

  const handleUpdateEvent = async (eventId: string, eventData: any) => {
    try {
      // Prepara os dados para atualização
      const dataToUpdate = {
        titulo: eventData.titulo || '',
        descricao_evento: eventData.descricao_evento || '',
        data_hora_inicio: eventData.data_hora_inicio instanceof Date 
          ? eventData.data_hora_inicio.toISOString() 
          : new Date(eventData.data_hora_inicio).toISOString(),
        duracao_minutos: eventData.duracao_minutos || 60,
        local_evento: eventData.local_evento || '',
        prioridade: eventData.prioridade || 'média',
        tipo_evento: eventData.tipo_evento || 'reuniao',
        status_evento: eventData.status_evento || 'agendado',
        cliente_associado_id: eventData.cliente_associado_id || null,
        processo_associado_id: eventData.processo_associado_id || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('agenda_eventos')
        .update(dataToUpdate)
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso."
      });
      
      await fetchEvents();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
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

  return {
    events,
    isLoading,
    isRefreshing,
    dateRange,
    setDateRange,
    handleSaveEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleRefresh,
    fetchEvents
  };
};
