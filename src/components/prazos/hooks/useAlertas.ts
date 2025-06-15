
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertaPrazo } from '../types/alertTypes';

export const useAlertas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alertas, setAlertas] = useState<AlertaPrazo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAlertas = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prazo_alertas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAlertas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alertas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const gerarNovosAlertas = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gerar-alertas', {
        body: {
          user_id: user.id
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro desconhecido na função');
      }

      const alertasGerados = data.alertas_gerados || 0;
      
      toast({
        title: "Alertas gerados com sucesso!",
        description: `${alertasGerados} ${alertasGerados === 1 ? 'novo alerta foi criado' : 'novos alertas foram criados'}.`,
      });

      await fetchAlertas();
      
    } catch (error: any) {
      console.error('Erro ao gerar alertas:', error);
      toast({
        title: "Erro ao gerar alertas",
        description: error.message || 'Erro desconhecido ao gerar alertas',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const marcarComoEnviado = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('prazo_alertas')
        .update({ 
          alerta_enviado: true,
          data_envio: new Date().toISOString()
        })
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Alerta marcado como enviado",
      });

      fetchAlertas();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const excluirAlerta = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('prazo_alertas')
        .delete()
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Alerta excluído",
      });

      fetchAlertas();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    alertas,
    isLoading,
    isGenerating,
    fetchAlertas,
    gerarNovosAlertas,
    marcarComoEnviado,
    excluirAlerta
  };
};
