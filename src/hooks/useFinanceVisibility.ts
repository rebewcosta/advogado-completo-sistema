
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFinanceVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const validatePinAndToggle = useCallback(async (pin: string) => {
    if (!user || !pin || pin.length !== 4) {
      toast({
        title: "PIN Inválido",
        description: "Digite um PIN de 4 dígitos",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-finance-pin', {
        body: { pinAttempt: pin },
      });

      if (error) {
        throw new Error(error.message || "Erro ao verificar PIN");
      }

      if (data?.verified === true) {
        setIsVisible(true);
        toast({
          title: "Acesso Liberado",
          description: "Valores financeiros liberados para visualização",
        });
        return true;
      } else {
        toast({
          title: "PIN Incorreto",
          description: "O PIN digitado está incorreto",
          variant: "destructive",
        });
        return false;
      }
    } catch (err: any) {
      toast({
        title: "Erro na Verificação",
        description: err.message || "Não foi possível verificar o PIN",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [user, toast]);

  const hideValues = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    isValidating,
    validatePinAndToggle,
    hideValues,
  };
};
