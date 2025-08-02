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
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const updatePresence = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📊 Atualizando presença para:', user.email);
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          nome_completo: user.user_metadata?.nome_completo,
          last_seen: new Date().toISOString(),
          is_online: true
        }, { onConflict: 'id' });
        
      if (error) {
        console.error('❌ Erro ao atualizar presença:', error);
      } else {
        console.log('✅ Presença atualizada com sucesso para:', user.email);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar presença:', error);
    }
  }, [user]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    // Atualizar presença a cada 30 segundos para melhor detecção
    heartbeatInterval.current = setInterval(updatePresence, 30 * 1000);
  }, [updatePresence]);

  useEffect(() => {
    if (!user || hasInitialized.current) return;

    console.log('🟢 Inicializando presença em tempo real para:', user.email);
    hasInitialized.current = true;
    
    // Adicionar delay para evitar múltiplas conexões simultâneas
    const initTimer = setTimeout(() => {
      const channelName = `user_presence_global`;
      const presenceChannel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id
          }
        }
      });
      channelRef.current = presenceChannel;

    // Configurar listeners de presença
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(presenceKey => {
          const presences = presenceState[presenceKey];
          presences.forEach((presence: any) => {
            // Evitar duplicatas
            if (!users.find(u => u.user_id === presence.user_id)) {
              users.push({
                user_id: presence.user_id,
                email: presence.email,
                nome_completo: presence.nome_completo,
                online_at: presence.online_at,
                last_seen: presence.last_seen || new Date().toISOString()
              });
            }
          });
        });

        console.log('🔄 Presença sincronizada:', users.length, 'usuários online');
        setOnlineUsers(users);
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('✅ Usuário entrou:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('❌ Usuário saiu:', key, leftPresences);
      });

    // Subscribe ao canal com tratamento de erro
    try {
      presenceChannel.subscribe(async (status) => {
        console.log('📡 Status da conexão:', status);
        
        if (status === 'SUBSCRIBED') {
          try {
            const userPresence = {
              user_id: user.id,
              email: user.email || '',
              nome_completo: user.user_metadata?.nome_completo || '',
              online_at: new Date().toISOString(),
              last_seen: new Date().toISOString()
            };

            console.log('🚀 Trackando presença:', userPresence);
            const trackResult = await presenceChannel.track(userPresence);
            console.log('📡 Resultado do track:', trackResult);
            await updatePresence();
            startHeartbeat();
            
            // Atualizar presença imediatamente para garantir
            setTimeout(updatePresence, 1000);
          } catch (error) {
            console.warn('⚠️ Erro ao configurar presença, funcionando em modo fallback:', error);
            await updatePresence(); // Apenas atualizar no banco sem realtime
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Erro no canal de presença, funcionando em modo fallback');
          setIsConnected(false);
          await updatePresence(); // Fallback para atualização direta no banco
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Timeout no canal de presença, funcionando em modo fallback');
          setIsConnected(false);
          await updatePresence(); // Fallback para atualização direta no banco
        } else if (status === 'CLOSED') {
          console.warn('🔒 Canal de presença fechado');
          setIsConnected(false);
        }
      });
    } catch (error) {
      console.warn('⚠️ Erro na conexão WebSocket inicial, funcionando em modo fallback:', error);
      setIsConnected(false);
      updatePresence(); // Fallback para atualização direta no banco
    }

    }, 1000); // delay de 1 segundo para evitar múltiplas conexões

    // Cleanup
    return () => {
      console.log('🔄 Limpando presença em tempo real');
      hasInitialized.current = false;
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      if (channelRef.current) {
        // Marcar como offline na base de dados
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
      
      setIsConnected(false);
      setOnlineUsers([]);
      
      // Limpar o timer se existir
      clearTimeout(initTimer);
    };
  }, [user, updatePresence, startHeartbeat]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isConnected
  };
};