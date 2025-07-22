import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useActivityTracker = () => {
  const { user } = useAuth();
  const lastActivityRef = useRef<Date>(new Date());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivity = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔄 Atualizando atividade para:', user.email);
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          nome_completo: user.user_metadata?.nome_completo,
          last_seen: new Date().toISOString(),
          is_online: true
        }, { onConflict: 'id' });
      
      lastActivityRef.current = new Date();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
  }, [user]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Se passou mais de 1 minuto desde a última atividade, atualizar
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
    
    if (timeSinceLastActivity > 60000) { // 1 minuto
      updateActivity();
    }
    
    // Configurar timer para marcar como inativo após 5 minutos
    inactivityTimerRef.current = setTimeout(async () => {
      if (user) {
        console.log('⏰ Marcando usuário como inativo após 5 minutos:', user.email);
        await supabase
          .from('user_profiles')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    }, 5 * 60 * 1000); // 5 minutos
  }, [user, updateActivity]);

  useEffect(() => {
    if (!user) return;

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Adicionar listeners para detectar atividade
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Marcar como ativo inicialmente
    updateActivity();
    resetInactivityTimer();

    return () => {
      // Limpar listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, updateActivity, resetInactivityTimer]);

  return { updateActivity };
};