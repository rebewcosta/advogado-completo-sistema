
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Publicacao {
  id: string;
  user_id: string;
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
  segredo_justica: boolean;
  lida: boolean;
  importante: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const usePublicacoes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: publicacoes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['publicacoes'],
    queryFn: async (): Promise<Publicacao[]> => {
      console.log('Buscando publicações...');
      const { data, error } = await supabase
        .from('publicacoes_diario_oficial')
        .select('*')
        .order('data_publicacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar publicações:', error);
        throw error;
      }

      console.log('Publicações encontradas:', data?.length);
      return data || [];
    },
  });

  const adicionarPublicacao = useMutation({
    mutationFn: async (novaPublicacao: Omit<Publicacao, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('publicacoes_diario_oficial')
        .insert({
          ...novaPublicacao,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicacoes'] });
      toast({
        title: "Sucesso!",
        description: "Publicação adicionada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar publicação:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar publicação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const marcarComoLida = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicacoes'] });
    },
  });

  const marcarComoImportante = useMutation({
    mutationFn: async ({ id, importante }: { id: string; importante: boolean }) => {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ importante })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicacoes'] });
    },
  });

  const excluirPublicacao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicacoes'] });
      toast({
        title: "Sucesso!",
        description: "Publicação excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir publicação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir publicação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    publicacoes,
    isLoading,
    error,
    adicionarPublicacao: adicionarPublicacao.mutate,
    marcarComoLida: marcarComoLida.mutate,
    marcarComoImportante: marcarComoImportante.mutate,
    excluirPublicacao: excluirPublicacao.mutate,
    isAdicionando: adicionarPublicacao.isPending,
  };
};
