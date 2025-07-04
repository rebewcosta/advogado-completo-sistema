
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserTracking = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Função para atualizar status online
    const updateOnlineStatus = async () => {
      try {
        await supabase.rpc('update_user_online_status', {
          user_uuid: user.id
        });
      } catch (error) {
        console.error('Erro ao atualizar status online:', error);
      }
    };

    // Atualizar status online imediatamente
    updateOnlineStatus();

    // Atualizar status online a cada 2 minutos
    const interval = setInterval(updateOnlineStatus, 2 * 60 * 1000);

    // Atualizar perfil do usuário se não existir
    const updateUserProfile = async () => {
      try {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              email: user.email,
              nome_completo: user.user_metadata?.nome_completo || null,
              telefone: user.user_metadata?.telefone || null,
              oab: user.user_metadata?.oab || null,
              is_online: true,
              last_seen: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    };

    updateUserProfile();

    // Cleanup
    return () => {
      clearInterval(interval);
      // Marcar como offline ao sair
      updateOnlineStatus();
    };
  }, [user]);
};
