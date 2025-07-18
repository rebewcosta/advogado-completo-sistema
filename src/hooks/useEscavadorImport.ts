import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

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
  const { canUsePremiumFeatures, subscriptionStatus } = useSubscriptionStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [processosEncontrados, setProcessosEncontrados] = useState<ProcessoEscavador[]>([]);
  const [resultadoConsulta, setResultadoConsulta] = useState<EscavadorResponse | null>(null);

  const checkImportLimit = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      
      const { data: limitData, error } = await supabase
        .from('escavador_import_limits')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_import_date', currentMonth + '-01')
        .lt('last_import_date', new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar limite:', error);
        return false;
      }

      return !limitData; // Retorna true se ainda pode importar
    } catch (error) {
      console.error('Erro ao verificar limite de importação:', error);
      return false;
    }
  };

  const updateImportLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
      
      const { data: existingLimit } = await supabase
        .from('escavador_import_limits')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_import_date', currentMonth + '-01')
        .lt('last_import_date', new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0])
        .single();

      if (existingLimit) {
        await supabase
          .from('escavador_import_limits')
          .update({ import_count: existingLimit.import_count + 1, last_import_date: today })
          .eq('id', existingLimit.id);
      } else {
        await supabase
          .from('escavador_import_limits')
          .insert({
            user_id: user.id,
            last_import_date: today,
            import_count: 1
          });
      }
    } catch (error) {
      console.error('Erro ao atualizar limite de importação:', error);
    }
  };

  const consultarProcessosEscavador = async (oab: string): Promise<EscavadorResponse | null> => {
    // Verificar se o usuário pode usar recursos premium ANTES de verificar limite
    if (!canUsePremiumFeatures()) {
      const accountTypeMessages = {
        'trial': 'Usuários em período de teste não podem usar a importação automática. Este é um recurso premium que consome tokens da API. Você pode adicionar processos manualmente usando o botão "Novo Processo" de forma ilimitada.',
        'none': 'É necessário ter uma assinatura ativa para usar a importação automática.',
        'expired_canceled': 'Sua assinatura expirou. Renove para usar a importação automática.',
        'grace_expired': 'Período de carência expirado. Regularize seu pagamento para usar a importação automática.',
        'pending': 'Pagamento pendente. Complete o pagamento para usar a importação automática.',
        'error': 'Erro ao verificar status da assinatura.'
      };

      const message = accountTypeMessages[subscriptionStatus?.account_type as keyof typeof accountTypeMessages] 
        || 'Você precisa de uma assinatura ativa para usar este recurso premium.';

      toast({
        title: "Recurso Premium Restrito",
        description: message,
        variant: "destructive"
      });
      return null;
    }

    const canImport = await checkImportLimit();
    if (!canImport) {
      throw new Error('Você já utilizou a importação automática este mês. A importação do Escavador é limitada a 1 vez por mês. Para adicionar mais processos, use o botão "Novo Processo" que permite cadastro manual ilimitado.');
    }
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

      // Atualizar limite de importação após sucesso
      await updateImportLimit();

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
    limparResultados,
    checkImportLimit,
    canUsePremiumFeatures
  };
};
