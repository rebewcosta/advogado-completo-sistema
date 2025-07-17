import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProcessoEscavador {
  numero_processo: string;
  tipo_processo: string;
  status_processo: string;
  vara_tribunal: string;
  proximo_prazo: string | null;
  cliente_id: string | null;
  nome_cliente_text: string | null;
  fonte: string;
}

interface EscavadorResponse {
  success: boolean;
  oab: string;
  totalEncontrados: number;
  processosNovos: number;
  processosExistentes: number;
  processos: ProcessoEscavador[];
  error?: string;
}

export const useEscavadorImport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [processosEncontrados, setProcessosEncontrados] = useState<ProcessoEscavador[]>([]);
  const [resultadoConsulta, setResultadoConsulta] = useState<EscavadorResponse | null>(null);

  const consultarProcessosEscavador = async (oab: string): Promise<EscavadorResponse | null> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log('[ESCAVADOR-HOOK] Iniciando consulta aos processos');
      
      const { data, error } = await supabase.functions.invoke('escavador-consulta-processos', {
        body: { oab },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('[ESCAVADOR-HOOK] Erro na edge function:', error);
        toast({
          title: "Erro na consulta",
          description: error.message || "Erro ao consultar processos no Escavador",
          variant: "destructive"
        });
        return null;
      }

      console.log('[ESCAVADOR-HOOK] Resposta recebida:', data);

      if (!data.success) {
        toast({
          title: "Erro na consulta",
          description: data.error || "Erro ao consultar processos no Escavador",
          variant: "destructive"
        });
        return null;
      }

      setProcessosEncontrados(data.processos || []);
      setResultadoConsulta(data);

      toast({
        title: "Consulta realizada com sucesso",
        description: `Encontrados ${data.totalEncontrados} processos. ${data.processosNovos} novos para importar.`,
      });

      return data;

    } catch (error: any) {
      console.error('[ESCAVADOR-HOOK] Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: error.message || "Erro inesperado ao consultar processos",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const importarProcessosSelecionados = async (processosParaImportar: ProcessoEscavador[]) => {
    if (!user || processosParaImportar.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      console.log(`[ESCAVADOR-HOOK] Importando ${processosParaImportar.length} processos`);

      // Preparar dados para inserção
      const processosParaInserir = processosParaImportar.map(processo => ({
        user_id: user.id,
        numero_processo: processo.numero_processo,
        tipo_processo: processo.tipo_processo,
        status_processo: processo.status_processo,
        vara_tribunal: processo.vara_tribunal,
        proximo_prazo: processo.proximo_prazo,
        cliente_id: processo.cliente_id,
        nome_cliente_text: processo.nome_cliente_text
      }));

      const { data, error } = await supabase
        .from('processos')
        .insert(processosParaInserir)
        .select();

      if (error) {
        console.error('[ESCAVADOR-HOOK] Erro ao inserir processos:', error);
        toast({
          title: "Erro na importação",
          description: error.message || "Erro ao importar processos",
          variant: "destructive"
        });
        return false;
      }

      console.log(`[ESCAVADOR-HOOK] ${data?.length || 0} processos importados com sucesso`);
      
      toast({
        title: "Importação concluída",
        description: `${data?.length || 0} processos importados com sucesso da OAB`,
      });

      // Limpar estado após importação
      setProcessosEncontrados([]);
      setResultadoConsulta(null);

      return true;

    } catch (error: any) {
      console.error('[ESCAVADOR-HOOK] Erro na importação:', error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro inesperado ao importar processos",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const limparResultados = () => {
    setProcessosEncontrados([]);
    setResultadoConsulta(null);
  };

  return {
    isLoading,
    processosEncontrados,
    resultadoConsulta,
    consultarProcessosEscavador,
    importarProcessosSelecionados,
    limparResultados
  };
};