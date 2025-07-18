
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionStatus {
  subscribed: boolean;
  account_type: string;
  subscription_end?: string;
  trial_days_remaining?: number;
  days_remaining?: number;
  message: string;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verificar-assinatura');
      
      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return null;
      }

      setSubscriptionStatus(data);
      return data;
    } catch (error) {
      console.error('Erro na verificação de assinatura:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  // Verifica se o usuário pode usar recursos premium (importação automática)
  const canUsePremiumFeatures = () => {
    if (!subscriptionStatus) return false;
    
    const allowedTypes = ['admin', 'amigo', 'premium', 'canceled_grace', 'grace_period'];
    return allowedTypes.includes(subscriptionStatus.account_type);
  };

  return {
    subscriptionStatus,
    isLoading,
    canUsePremiumFeatures,
    checkSubscriptionStatus
  };
};
