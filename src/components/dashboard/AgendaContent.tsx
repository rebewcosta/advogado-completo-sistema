// src/components/dashboard/AgendaContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfDay, endOfDay, addDays, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarCheck, CalendarPlus, List, AlertCircle, ExternalLink, RefreshCw, CalendarClock, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

interface AgendaStats {
  eventosHoje: EventoAgenda[];
  eventosProximaSemana: EventoAgenda[]; // Eventos dos próximos 7 dias
}

const AgendaContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AgendaStats>({
    eventosHoje: [],
    eventosProximaSemana: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendaData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hoje = new Date();
      const inicioDoDia = format(startOfDay(hoje), "yyyy-MM-dd'T'HH:mm:ssxxx");
      const fimDoDia = format(endOfDay(hoje), "yyyy-MM-dd'T'HH:mm:ssxxx");
      const fimDaProximaSemana = format(endOfDay(addDays(hoje, 7)), "yyyy-MM-dd'T'HH:mm:ssxxx");

      // Eventos para Hoje
      const { data: eventosHojeData, error: eventosHojeError } = await supabase
        .from('agenda_eventos')
        .select('*, clientes (id, nome), processos (id, numero_processo)')
        .eq('user_id', user.id)
        .gte('data_hora_inicio', inicioDoDia)
        .lte('data_hora_inicio', fimDoDia)
        .order('data_hora_inicio', { ascending: true });

      if (eventosHojeError) throw eventosHojeError;

      // Eventos para a Próxima Semana (excluindo os de hoje, para não duplicar se houver)
      const { data: eventosSemanaData, error: eventosSemanaError } = await supabase
        .from('agenda_eventos')
        .select('*, clientes (id, nome), processos (id, numero_processo)')
        .eq('user_id', user.id)
        .gte('data_hora_inicio', format(startOfDay(addDays(hoje,1)), "yyyy-MM-dd'T'HH:mm:ssxxx")) // Começa amanhã
        .lte('data_hora_inicio', fimDaProximaSemana)
        .order('data_hora_inicio', { ascending: true })
        .limit(10); // Limitar para não sobrecarregar o dashboard

      if (eventosSemanaError) throw eventosSemanaError;
      
      setStats({
        eventosHoje: eventosHojeData || [],
        eventosProximaSemana: eventosSemanaData || [],
      });

    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados da agenda.");
      toast({
        title: "Erro ao carregar resumo da agenda",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAgendaData();
  }, [fetchAgendaData]);
  
  const getPriorityBadgeClass = (priority?: string | null) => {
    switch (priority) {
        case 'alta': return 'bg-red-100 text-red-700 border-red-200';
        case 'média': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'baixa': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderEventoItem = (evento: EventoAgenda, showTimeOnly = false) => (
    <li key={evento.id} className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 px-1 -mx-1 rounded-md transition-colors">
      <div className="truncate w-full pr-2">
        <Link to={`/agenda?view=${evento.id}`} className="text-xs font-medium text-blue-600 hover:underline truncate block" title={evento.titulo}>
          {evento.titulo}
        </Link>
        <div className="text-[11px] text-gray-500 flex items-center mt-0.5">
          <Clock size={10} className="mr-1 flex-shrink-0"/> 
          {format(parseISO(evento.data_hora_inicio), showTimeOnly ? 'HH:mm' : 'dd/MM HH:mm', { locale: ptBR })}
          {evento.tipo_evento && <span className="mx-1">·</span>}
          {evento.tipo_evento && <span className="truncate" title={evento.tipo_evento}>{evento.tipo_evento}</span>}
        </div>
      </div>
      <Badge variant="outline" className={cn("text-[10px] py-0.5 px-1.5 font-medium rounded-full capitalize whitespace-nowrap self-center", getPriorityBadgeClass(evento.prioridade))}>
          {evento.prioridade || 'N/D'}
      </Badge>
    </li>
  );


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="text-base">Compromissos de Hoje</CardTitle></CardHeader><CardContent className="h-48 flex justify-center items-center"><Spinner/></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Próximos 7 Dias</CardTitle></CardHeader><CardContent className="h-48 flex justify-center items-center"><Spinner/></CardContent></Card>
      </div>
    );
  }

  if (error) {
     return (
      <Card className="border-destructive bg-red-50">
        <CardHeader>
          <CardTitle className="text-destructive-foreground flex items-center"><AlertCircle className="mr-2"/>Erro no Resumo da Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground/90">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAgendaData} className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <CalendarCheck className="mr-2 h-5 w-5 text-indigo-500"/>
            Compromissos de Hoje ({format(new Date(), "dd/MM", { locale: ptBR })})
          </CardTitle>
          <CardDescription className="text-xs">Seus eventos agendados para o dia atual.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px]">
          {stats.eventosHoje.length > 0 ? (
            <ul className="space-y-1 max-h-64 overflow-y-auto pr-2">
              {stats.eventosHoje.map(e => renderEventoItem(e, true))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 py-10">Nenhum compromisso para hoje.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-purple-500"/>
            Próximos 7 Dias
          </CardTitle>
          <CardDescription className="text-xs">Visão geral dos seus próximos compromissos (excluindo hoje).</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[150px]">
          {stats.eventosProximaSemana.length > 0 ? (
            <ul className="space-y-1 max-h-64 overflow-y-auto pr-2">
              {stats.eventosProximaSemana.map(e => renderEventoItem(e, false))}
            </ul>
          ) : (
            <p className="text-sm text-center text-gray-500 py-10">Nenhum compromisso agendado para os próximos 7 dias.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button asChild variant="default" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
          <Link to="/agenda">
            Acessar Agenda Completa
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AgendaContent;