// src/components/dashboard/VisaoGeralContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarClock, AlertTriangle, ListChecks, ActivityIcon, Briefcase, Users, Calendar } from 'lucide-react';
import StatsCards from './StatsCards'; // Importado aqui
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

type ProximoEvento = {
  id: string;
  titulo: string;
  data_formatada: string;
  tipo: 'prazo' | 'audiencia' | 'compromisso';
  link: string;
};

const VisaoGeralContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proximosPrazos, setProximosPrazos] = useState<ProximoEvento[]>([]);
  const [proximasAudiencias, setProximasAudiencias] = useState<ProximoEvento[]>([]);
  const [isLoadingPrazos, setIsLoadingPrazos] = useState(true);
  const [isLoadingAudiencias, setIsLoadingAudiencias] = useState(true);
  // Para atividades recentes, podemos adicionar depois.

  const fetchProximosEventos = useCallback(async () => {
    if (!user) {
      setIsLoadingPrazos(false);
      setIsLoadingAudiencias(false);
      return;
    }

    console.log("VisaoGeralContent: Buscando próximos eventos...");
    setIsLoadingPrazos(true);
    setIsLoadingAudiencias(true);

    const hoje = startOfDay(new Date());
    const daqui7Dias = endOfDay(addDays(hoje, 7));

    try {
      // Buscar Próximos Prazos de Processos
      const { data: prazosData, error: prazosError } = await supabase
        .from('processos')
        .select('id, numero_processo, proximo_prazo')
        .eq('user_id', user.id)
        .gte('proximo_prazo', format(hoje, 'yyyy-MM-dd'))
        .lte('proximo_prazo', format(daqui7Dias, 'yyyy-MM-dd'))
        .order('proximo_prazo', { ascending: true })
        .limit(5);

      if (prazosError) throw prazosError;
      const prazosFormatados: ProximoEvento[] = prazosData?.map(p => ({
        id: p.id,
        titulo: `Prazo Processo: ${p.numero_processo}`,
        data_formatada: p.proximo_prazo ? format(parseISO(p.proximo_prazo + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A',
        tipo: 'prazo',
        link: `/meus-processos?view=${p.id}` // Ajuste o link conforme sua rota
      })) || [];
      setProximosPrazos(prazosFormatados);
      console.log("VisaoGeralContent: Prazos carregados:", prazosFormatados);

    } catch (err: any) {
      console.error("VisaoGeralContent: Erro ao buscar próximos prazos:", err);
      toast({ title: "Erro ao carregar prazos", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingPrazos(false);
    }

    try {
      // Buscar Próximas Audiências/Compromissos da Agenda
      const { data: audienciasData, error: audienciasError } = await supabase
        .from('agenda_eventos')
        .select('id, titulo, data_hora_inicio, tipo_evento')
        .eq('user_id', user.id)
        .gte('data_hora_inicio', format(hoje, "yyyy-MM-dd'T'HH:mm:ssxxx"))
        .lte('data_hora_inicio', format(daqui7Dias, "yyyy-MM-dd'T'HH:mm:ssxxx"))
        // Adicionar um filtro para tipo_evento se quiser diferenciar audiências de outros compromissos
        // .in('tipo_evento', ['Audiência', 'Sustentação Oral']) // Exemplo
        .order('data_hora_inicio', { ascending: true })
        .limit(5);

      if (audienciasError) throw audienciasError;
      const audienciasFormatadas: ProximoEvento[] = audienciasData?.map(a => ({
        id: a.id,
        titulo: `${a.tipo_evento || 'Compromisso'}: ${a.titulo}`,
        data_formatada: format(parseISO(a.data_hora_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        tipo: (a.tipo_evento && a.tipo_evento.toLowerCase().includes('audiência')) ? 'audiencia' : 'compromisso',
        link: `/agenda?view=${a.id}` // Ajuste o link conforme sua rota
      })) || [];
      setProximasAudiencias(audienciasFormatadas);
      console.log("VisaoGeralContent: Audiências/Compromissos carregados:", audienciasFormatadas);

    } catch (err: any) {
      console.error("VisaoGeralContent: Erro ao buscar próximas audiências/compromissos:", err);
      toast({ title: "Erro ao carregar audiências/compromissos", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingAudiencias(false);
    }

  }, [user, toast]);

  useEffect(() => {
    fetchProximosEventos();
  }, [fetchProximosEventos]);


  const renderEventList = (eventos: ProximoEvento[], isLoading: boolean, emptyMessage: string, icon: React.ReactNode) => {
    if (isLoading) {
      return <div className="flex justify-center items-center py-8"><Spinner /></div>;
    }
    if (eventos.length === 0) {
      return <div className="text-center py-8 text-muted-foreground flex flex-col items-center">{icon}<p className="mt-2">{emptyMessage}</p></div>;
    }
    return (
      <ul className="space-y-3">
        {eventos.map(evento => (
          <li key={evento.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
            <div>
              <Link to={evento.link} className="text-sm font-medium text-blue-600 hover:underline">{evento.titulo}</Link>
              <p className="text-xs text-gray-500">{evento.data_formatada}</p>
            </div>
            <Badge variant={evento.tipo === 'prazo' ? 'destructive' : 'secondary'} className="text-xs">
              {evento.tipo === 'prazo' ? 'Prazo' : evento.tipo === 'audiencia' ? 'Audiência' : 'Compromisso'}
            </Badge>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <StatsCards /> {/* Componente StatsCards adicionado aqui */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos Compromissos e Audiências (7 dias)</CardTitle>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderEventList(proximasAudiencias, isLoadingAudiencias, "Nenhuma audiência ou compromisso nos próximos 7 dias.", <CalendarClock className="h-10 w-10 text-gray-300 mb-2" />)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Prazos Fatais (7 dias)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderEventList(proximosPrazos, isLoadingPrazos, "Nenhum prazo fatal nos próximos 7 dias.", <ListChecks className="h-10 w-10 text-gray-300 mb-2" />)}
          </CardContent>
        </Card>
      </div>

      {/* Cards para acesso rápido aos módulos principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center"><Briefcase className="mr-2 h-5 w-5 text-blue-500" />Gerenciar Processos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Acesse e atualize seus casos jurídicos.</p>
            <Button variant="outline" size="sm" asChild><Link to="/meus-processos">Ver Processos</Link></Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center"><Users className="mr-2 h-5 w-5 text-green-500" />Gerenciar Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Cadastre e organize as informações dos seus clientes.</p>
            <Button variant="outline" size="sm" asChild><Link to="/clientes">Ver Clientes</Link></Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center"><Calendar className="mr-2 h-5 w-5 text-purple-500" />Minha Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Consulte seus compromissos e prazos.</p>
            <Button variant="outline" size="sm" asChild><Link to="/agenda">Ver Agenda</Link></Button>
          </CardContent>
        </Card>
      </div>


      {/* Atividades Recentes (Placeholder por enquanto) */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
          <ActivityIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <ActivityIcon className="h-10 w-10 text-gray-300 mb-2" />
            <p>Nenhuma atividade recente registrada no sistema.</p>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default VisaoGeralContent;
