import { useEffect, useState, useCallback, useRef } from 'react';
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
  const channelRef = useRef<any>(null);
  const hasInitialized = useRef(false);

  const updatePresence = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          nome_completo: user.user_metadata?.nome_completo,
          last_seen: new Date().toISOString(),
          is_online: true
        }, { onConflict: 'id' });
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user || hasInitialized.current) return;

    hasInitialized.current = true;
    const channelName = `user_presence_${Date.now()}`;
    const presenceChannel = supabase.channel(channelName);
    channelRef.current = presenceChannel;

    // Configurar apenas o listener essencial
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

    // Subscribe e track apenas uma vez
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
        await updatePresence();
      }
    });

    // Cleanup
    return () => {
      hasInitialized.current = false;
      if (channelRef.current) {
        // Marcar como offline
        if (user) {
          supabase
            .from('user_profiles')
            .update({
              is_online: false,
              last_seen: new Date().toISOString()
            })
            .eq('id', user.id);
        }
        
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, updatePresence]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isConnected
  };
};