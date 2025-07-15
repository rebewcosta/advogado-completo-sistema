import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserPresence {
  user_id: string;
  email: string;
  nome_completo?: string;
  online_at: string;
  last_seen: string;
}

export const useRealtimePresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channelName = 'user_presence_channel';
    const presenceChannel = supabase.channel(channelName);

    // Configurar os listeners de presença
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(presenceKey => {
          const presences = presenceState[presenceKey];
          presences.forEach((presence: any) => {
            users.push({
              user_id: presence.user_id,
              email: presence.email,
              nome_completo: presence.nome_completo,
              online_at: presence.online_at,
              last_seen: presence.last_seen || new Date().toISOString()
            });
          });
        });

        setOnlineUsers(users);
        setIsConnected(true);
      });

    // Fazer subscribe e track da presença do usuário atual
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const userPresence = {
          user_id: user.id,
          email: user.email || '',
          nome_completo: user.user_metadata?.nome_completo || '',
          online_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        };

        await presenceChannel.track(userPresence);
        
        // Atualizar o status na tabela user_profiles apenas uma vez
        await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            nome_completo: user.user_metadata?.nome_completo,
            last_seen: new Date().toISOString(),
            is_online: true
          }, { onConflict: 'id' });
      }
    });

    // Cleanup
    return () => {
      // Atualizar status para offline antes de sair
      supabase
        .from('user_profiles')
        .update({
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
      
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isConnected
  };
};