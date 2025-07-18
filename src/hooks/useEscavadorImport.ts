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
  // Campos enriquecidos
  assunto_processo?: string | null;
  classe_judicial?: string | null;
  instancia?: string | null;
  data_distribuicao?: string | null;
  segredo_justica?: boolean;
  valor_causa?: number | null;
  situacao_processo?: string | null;
  origem_dados?: string;
  escavador_id?: string | null;
  ultima_atualizacao_escavador?: string;
}

interface MovimentacaoEscavador {
  user_id: string;
  numero_processo: string;
  data_movimentacao: string | null;
  tipo_movimentacao: string | null;
  descricao_movimentacao: string | null;
  orgao: string | null;
  magistrado: string | null;
}

interface ParteEscavador {
  user_id: string;
  numero_processo: string;
  nome_parte: string;
  tipo_parte: string | null;
  documento: string | null;
  qualificacao: string | null;
}

interface FinanceiroEscavador {
  user_id: string;
  numero_processo: string;
  valor_causa: number | null;
  honorarios_contratuais: number | null;
  honorarios_sucumbenciais: number | null;
  custas_processuais: number | null;
}

interface EscavadorResponse {
  success: boolean;
  oab: string;
  totalEncontrados: number;
  processosNovos: number;
  processosExistentes: number;
  processos: ProcessoEscavador[];
  dadosEnriquecidos?: {
    movimentacoes: MovimentacaoEscavador[];
    partes: ParteEscavador[];
    financeiros: FinanceiroEscavador[];
  };
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

      // Calcular dados enriquecidos
      const totalMovimentacoes = data.dadosEnriquecidos?.movimentacoes?.length || 0;
      const totalPartes = data.dadosEnriquecidos?.partes?.length || 0;
      const totalFinanceiros = data.dadosEnriquecidos?.financeiros?.length || 0;

      toast({
        title: "Consulta realizada com sucesso",
        description: `Encontrados ${data.totalEncontrados} processos com ${totalMovimentacoes} movimentações, ${totalPartes} partes e ${totalFinanceiros} informações financeiras. ${data.processosNovos} novos para importar.`,
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

      // Preparar dados enriquecidos para inserção
      const processosParaInserir = processosParaImportar.map(processo => ({
        user_id: user.id,
        numero_processo: processo.numero_processo,
        tipo_processo: processo.tipo_processo,
        status_processo: processo.status_processo,
        vara_tribunal: processo.vara_tribunal,
        proximo_prazo: processo.proximo_prazo,
        cliente_id: processo.cliente_id,
        nome_cliente_text: processo.nome_cliente_text,
        // Campos enriquecidos
        assunto_processo: processo.assunto_processo,
        classe_judicial: processo.classe_judicial,
        instancia: processo.instancia,
        data_distribuicao: processo.data_distribuicao,
        segredo_justica: processo.segredo_justica || false,
        valor_causa: processo.valor_causa,
        situacao_processo: processo.situacao_processo,
        origem_dados: processo.origem_dados || 'Escavador',
        escavador_id: processo.escavador_id,
        ultima_atualizacao_escavador: processo.ultima_atualizacao_escavador
      }));

      // Inserir processos principais
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

      // Importar dados enriquecidos se disponíveis
      let totalMovimentacoes = 0;
      let totalPartes = 0;
      let totalFinanceiros = 0;

      if (resultadoConsulta?.dadosEnriquecidos) {
        const { movimentacoes, partes, financeiros } = resultadoConsulta.dadosEnriquecidos;
        
        // Filtrar apenas dados dos processos importados
        const numerosImportados = new Set(processosParaImportar.map(p => p.numero_processo));
        
        // Importar movimentações
        if (movimentacoes.length > 0) {
          const movimentacoesFiltradas = movimentacoes.filter(m => numerosImportados.has(m.numero_processo));
          if (movimentacoesFiltradas.length > 0) {
            const { error: movError } = await supabase
              .from('processo_movimentacoes')
              .insert(movimentacoesFiltradas);
            if (!movError) totalMovimentacoes = movimentacoesFiltradas.length;
          }
        }

        // Importar partes
        if (partes.length > 0) {
          const partesFiltradas = partes.filter(p => numerosImportados.has(p.numero_processo));
          if (partesFiltradas.length > 0) {
            const { error: partesError } = await supabase
              .from('processo_partes')
              .insert(partesFiltradas);
            if (!partesError) totalPartes = partesFiltradas.length;
          }
        }

        // Importar dados financeiros
        if (financeiros.length > 0) {
          const financeirosFiltrados = financeiros.filter(f => numerosImportados.has(f.numero_processo));
          if (financeirosFiltrados.length > 0) {
            const { error: finError } = await supabase
              .from('processo_financeiro')
              .insert(financeirosFiltrados);
            if (!finError) totalFinanceiros = financeirosFiltrados.length;
          }
        }
      }
      
      toast({
        title: "Importação enriquecida concluída",
        description: `${data?.length || 0} processos + ${totalMovimentacoes} movimentações + ${totalPartes} partes + ${totalFinanceiros} dados financeiros importados com sucesso!`,
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
