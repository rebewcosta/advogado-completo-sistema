
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AvisoAdministrativo, AvisoNaoLido } from '@/types/avisos';

export const useAvisos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avisosNaoLidos, setAvisosNaoLidos] = useState<AvisoNaoLido[]>([]);
  const [avisos, setAvisos] = useState<AvisoAdministrativo[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar avisos não lidos do usuário atual
  const fetchAvisosNaoLidos = useCallback(async () => {
    if (!user?.id) {
      console.log('🔔 [useAvisos] Usuário não logado, não buscando avisos');
      return;
    }

    console.log('🔔 [useAvisos] Buscando avisos não lidos para usuário:', user.id);

    try {
      const { data, error } = await supabase.rpc('get_avisos_nao_lidos', {
        p_user_id: user.id
      });

      if (error) {
        console.error('🔔 [useAvisos] Erro na RPC get_avisos_nao_lidos:', error);
        throw error;
      }

      console.log('🔔 [useAvisos] Dados brutos retornados da RPC:', data);

      // Type cast the response to match our interface
      const typedData = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'info' | 'warning' | 'error' | 'success',
        prioridade: item.prioridade as 'baixa' | 'normal' | 'alta' | 'critica'
      }));

      console.log('🔔 [useAvisos] Avisos processados:', typedData);
      setAvisosNaoLidos(typedData);
    } catch (error: any) {
      console.error('🔔 [useAvisos] Erro ao buscar avisos não lidos:', error);
      toast({
        title: "Erro ao carregar avisos",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  // Buscar todos os avisos (para admins)
  const fetchTodosAvisos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('avisos_administrativos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type cast the response to match our interface
      const typedData = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'info' | 'warning' | 'error' | 'success',
        prioridade: item.prioridade as 'baixa' | 'normal' | 'alta' | 'critica'
      }));

      setAvisos(typedData);
    } catch (error: any) {
      console.error('Erro ao buscar todos os avisos:', error);
      toast({
        title: "Erro ao carregar avisos",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Marcar aviso como lido
  const marcarComoLido = async (avisoId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('avisos_lidos')
        .insert([
          {
            aviso_id: avisoId,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      // Remove o aviso da lista de não lidos
      setAvisosNaoLidos(prev => prev.filter(aviso => aviso.id !== avisoId));

      toast({
        title: "Aviso marcado como lido",
        description: "O aviso foi marcado como lido com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao marcar aviso como lido:', error);
      toast({
        title: "Erro ao marcar aviso como lido",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Criar novo aviso (apenas para admins)
  const criarAviso = async (aviso: Omit<AvisoAdministrativo, 'id' | 'created_at' | 'updated_at' | 'criado_por'>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('avisos_administrativos')
        .insert([
          {
            ...aviso,
            criado_por: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Type cast the response
      const typedData = {
        ...data,
        tipo: data.tipo as 'info' | 'warning' | 'error' | 'success',
        prioridade: data.prioridade as 'baixa' | 'normal' | 'alta' | 'critica'
      };

      setAvisos(prev => [typedData, ...prev]);

      toast({
        title: "Aviso criado com sucesso",
        description: "O aviso foi enviado para todos os usuários."
      });

      return typedData;
    } catch (error: any) {
      console.error('Erro ao criar aviso:', error);
      toast({
        title: "Erro ao criar aviso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar aviso (apenas para admins)
  const atualizarAviso = async (id: string, updates: Partial<AvisoAdministrativo>) => {
    try {
      const { data, error } = await supabase
        .from('avisos_administrativos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Type cast the response
      const typedData = {
        ...data,
        tipo: data.tipo as 'info' | 'warning' | 'error' | 'success',
        prioridade: data.prioridade as 'baixa' | 'normal' | 'alta' | 'critica'
      };

      setAvisos(prev => prev.map(aviso => 
        aviso.id === id ? typedData : aviso
      ));

      toast({
        title: "Aviso atualizado",
        description: "O aviso foi atualizado com sucesso."
      });

      return typedData;
    } catch (error: any) {
      console.error('Erro ao atualizar aviso:', error);
      toast({
        title: "Erro ao atualizar aviso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Deletar aviso (apenas para admins)
  const deletarAviso = async (id: string) => {
    try {
      const { error } = await supabase
        .from('avisos_administrativos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvisos(prev => prev.filter(aviso => aviso.id !== id));

      toast({
        title: "Aviso deletado",
        description: "O aviso foi removido com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao deletar aviso:', error);
      toast({
        title: "Erro ao deletar aviso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAvisosNaoLidos();
      setLoading(false);
    }
  }, [user?.id, fetchAvisosNaoLidos]);

  // Configurar realtime para avisos
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('avisos-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avisos_administrativos'
        },
        () => {
          fetchAvisosNaoLidos();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'avisos_administrativos'
        },
        () => {
          fetchAvisosNaoLidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAvisosNaoLidos]);

  return {
    avisosNaoLidos,
    avisos,
    loading,
    marcarComoLido,
    criarAviso,
    atualizarAviso,
    deletarAviso,
    fetchTodosAvisos,
    refetch: fetchAvisosNaoLidos
  };
};
