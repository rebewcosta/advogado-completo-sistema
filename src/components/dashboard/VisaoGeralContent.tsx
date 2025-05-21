// src/components/dashboard/VisaoGeralContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Adicionado CardFooter
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CalendarClock,
  AlertTriangle,
  ListChecks,
  Briefcase,
  Users,
  CalendarDays,
  ArrowRight,
  Clock, // Adicionado para hora
  Activity // Para futuras atividades recentes
} from 'lucide-react';
import StatsCards from './StatsCards';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ProximoEvento = {
  id: string;
  titulo: string;
  data_formatada: string;
  hora_formatada?: string;
  tipo: 'prazo' | 'audiencia' | 'compromisso';
  link: string;
  detalhe?: string | null;
};

const VisaoGeralContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proximosPrazos, setProximosPrazos] = useState<ProximoEvento[]>([]);
  const [proximasAudienciasECompromissos, setProximasAudienciasECompromissos] = useState<ProximoEvento[]>([]);
  const [isLoadingPrazos, setIsLoadingPrazos] = useState(true);
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(true);

  const fetchProximosEventos = useCallback(async () => {
    if (!user) {
      setIsLoadingPrazos(false);
      setIsLoadingAgenda(false);
      return;
    }

    setIsLoadingPrazos(true);
    setIsLoadingAgenda(true);

    const hoje = startOfDay(new Date());
    const daqui7Dias = endOfDay(addDays(hoje, 7));

    try {
      const { data: prazosData, error: prazosError } = await supabase
        .from('processos')
        .select('id, numero_processo, proximo_prazo, clientes ( nome ), nome_cliente_text')
        .eq('user_id', user.id)
        .gte('proximo_prazo', format(hoje, 'yyyy-MM-dd'))
        .lte('proximo_prazo', format(daqui7Dias, 'yyyy-MM-dd'))
        .order('proximo_prazo', { ascending: true })
        .limit(5);

      if (prazosError) throw prazosError;
      const prazosFormatados: ProximoEvento[] = prazosData?.map(p => ({
        id: p.id,
        titulo: `Processo: ${p.numero_processo}`,
        data_formatada: p.proximo_prazo ? format(parseISO(p.proximo_prazo + 'T00:00:00Z'), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        tipo: 'prazo',
        link: `/meus-processos#${p.id}`,
        // @ts-ignore
        detalhe: p.clientes?.nome || p.nome_cliente_text || null,
      })) || [];
      setProximosPrazos(prazosFormatados);

    } catch (err: any) {
      toast({ title: "Erro ao carregar prazos", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingPrazos(false);
    }

    try {
      const { data: agendaData, error: agendaError } = await supabase
        .from('agenda_eventos')
        .select('id, titulo, data_hora_inicio, tipo_evento, clientes ( nome )')
        .eq('user_id', user.id)
        .gte('data_hora_inicio', format(hoje, "yyyy-MM-dd'T'HH:mm:ssxxx"))
        .lte('data_hora_inicio', format(daqui7Dias, "yyyy-MM-dd'T'HH:mm:ssxxx"))
        .order('data_hora_inicio', { ascending: true })
        .limit(5);

      if (agendaError) throw agendaError;
      const agendaFormatada: ProximoEvento[] = agendaData?.map(a => {
        const dataHora = parseISO(a.data_hora_inicio);
        return {
          id: a.id,
          titulo: a.titulo,
          data_formatada: format(dataHora, 'dd/MM/yyyy', { locale: ptBR }),
          hora_formatada: format(dataHora, 'HH:mm', { locale: ptBR }),
          tipo: (a.tipo_evento && a.tipo_evento.toLowerCase().includes('audiência')) ? 'audiencia' : 'compromisso',
          link: `/agenda#${a.id}`,
          // @ts-ignore
          detalhe: a.clientes?.nome || a.tipo_evento || 'Compromisso',
        };
      }) || [];
      setProximasAudienciasECompromissos(agendaFormatada);

    } catch (err: any) {
      toast({ title: "Erro ao carregar agenda", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingAgenda(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProximosEventos();
  }, [fetchProximosEventos]);

  const renderEventList = (
    eventos: ProximoEvento[],
    isLoading: boolean,
    title: string,
    icon: React.ReactNode,
    emptyMessage: string,
    emptyIcon: React.ReactNode,
    viewAllLink: string
  ) => (
    <Card className="flex flex-col h-full shadow-md dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
          {!isLoading && <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">{eventos.length}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0 pr-3 pl-3 pb-3"> {/* Ajustado padding */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40"><Spinner /></div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center h-full justify-center">
            {React.cloneElement(emptyIcon as React.ReactElement, { className: "h-10 w-10 text-gray-400 dark:text-gray-500" })}
            <p className="mt-2 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <ul className="space-y-1 max-h-60 overflow-y-auto pr-1"> {/* Scroll para listas longas */}
            {eventos.map((evento, index) => (
              <React.Fragment key={evento.id}>
                <li className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors">
                  <Link to={evento.link} className="block group">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 mb-1 sm:mb-0">
                        <p className="text-sm font-medium text-lawyer-primary group-hover:underline truncate" title={evento.titulo}>
                          {evento.titulo}
                        </p>
                        {evento.detalhe && <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={evento.detalhe}>{evento.detalhe.startsWith('Cliente: ') ? evento.detalhe : `Tipo: ${evento.detalhe}`}</p>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                        {evento.hora_formatada && (
                          <>
                            <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="whitespace-nowrap">{evento.hora_formatada}</span>
                            <Separator orientation="vertical" className="h-3 bg-gray-300 dark:bg-gray-600 mx-0.5" />
                          </>
                        )}
                        <CalendarDays className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span className="whitespace-nowrap">{evento.data_formatada}</span>
                      </div>
                    </div>
                  </Link>
                </li>
                {index < eventos.length - 1 && <Separator className="my-0.5 bg-gray-100 dark:bg-gray-700" />}
              </React.Fragment>
            ))}
          </ul>
        )}
      </CardContent>
      { !isLoading && eventos.length > 0 && (
        <CardFooter className="pt-2 pb-3 px-3 border-t dark:border-gray-700">
          <Button variant="link" size="sm" asChild className="text-lawyer-primary p-0 h-auto text-xs font-medium">
            <Link to={viewAllLink}>
              Ver todos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {renderEventList(
          proximasAudienciasECompromissos,
          isLoadingAgenda,
          "Agenda: Próximos 7 Dias",
          <CalendarClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
          "Nenhum compromisso ou audiência.",
          <CalendarClock />,
          "/agenda"
        )}
        {renderEventList(
          proximosPrazos,
          isLoadingPrazos,
          "Prazos Importantes: Próximos 7 Dias",
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />,
          "Nenhum prazo importante.",
          <ListChecks />,
          "/meus-processos"
        )}
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { title: "Gerenciar Processos", icon: Briefcase, link: "/meus-processos", description: "Acesse e atualize seus casos." },
            { title: "Gerenciar Clientes", icon: Users, link: "/clientes", description: "Organize seus contatos." },
            { title: "Minha Agenda", icon: CalendarDays, link: "/agenda", description: "Consulte seus compromissos." },
          ].map(item => (
            <Card key={item.title} className="hover:shadow-lg dark:bg-gray-800 dark:hover:shadow-blue-500/10 transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                  <item.icon className="mr-2 h-5 w-5 text-lawyer-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.description}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-3">
                <Button variant="outline" size="sm" asChild className="w-full text-lawyer-primary border-lawyer-primary hover:bg-lawyer-primary/10 dark:hover:bg-lawyer-primary/20 dark:border-lawyer-primary/70 dark:text-lawyer-primary/90">
                  <Link to={item.link} className="flex items-center justify-center">
                    Acessar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/*
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Activity className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm">Nenhuma atividade recente registrada.</p>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default VisaoGeralContent;