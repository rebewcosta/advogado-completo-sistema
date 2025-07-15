
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFinanceVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Chave para storage local do PIN
  const PIN_STORAGE_KEY = `finance_pin_remember_${user?.id}`;

  // Verificar se PIN está habilitado e se está lembrado no dispositivo
  useEffect(() => {
    const checkPinSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.functions.invoke('manage-finance-pin-settings', {
          body: { action: 'status' }
        });

        if (error) {
          console.error('Erro ao verificar configurações do PIN:', error);
          return;
        }

        setPinEnabled(data?.enabled ?? true);

        // Se PIN está desabilitado, tornar valores visíveis automaticamente
        if (!data?.enabled) {
          setIsVisible(true);
          return;
        }

        // Se PIN está habilitado, verificar se está lembrado no dispositivo
        const rememberedPin = localStorage.getItem(PIN_STORAGE_KEY);
        if (rememberedPin) {
          // Validar PIN lembrado
          const { data: pinData, error: pinError } = await supabase.functions.invoke('verify-finance-pin', {
            body: { pinAttempt: rememberedPin },
          });

          if (!pinError && pinData?.verified) {
            setIsVisible(true);
          } else {
            // PIN inválido, remover do storage
            localStorage.removeItem(PIN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar configurações do PIN:', error);
      }
    };

    checkPinSettings();
  }, [user, PIN_STORAGE_KEY]);

  const validatePinAndToggle = useCallback(async (pin: string, rememberDevice = false) => {
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
        
        // Se usuário optou por lembrar o dispositivo, salvar PIN no localStorage
        if (rememberDevice) {
          localStorage.setItem(PIN_STORAGE_KEY, pin);
        }
        
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
  }, [user, toast, PIN_STORAGE_KEY]);

  const togglePinEnabled = useCallback(async (enabled: boolean) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('manage-finance-pin-settings', {
        body: { action: 'toggle', enabled }
      });

      if (error) {
        throw new Error(error.message || "Erro ao alterar configuração do PIN");
      }

      setPinEnabled(enabled);
      
      if (!enabled) {
        // Se desabilitou PIN, tornar valores visíveis e limpar storage
        setIsVisible(true);
        localStorage.removeItem(PIN_STORAGE_KEY);
      } else {
        // Se habilitou PIN, ocultar valores
        setIsVisible(false);
      }

      toast({
        title: enabled ? "PIN Habilitado" : "PIN Desabilitado",
        description: data?.message || "Configuração alterada com sucesso",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Erro na Configuração",
        description: err.message || "Não foi possível alterar a configuração do PIN",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, PIN_STORAGE_KEY]);

  const hideValues = useCallback(() => {
    setIsVisible(false);
  }, []);

  const clearRememberedPin = useCallback(() => {
    localStorage.removeItem(PIN_STORAGE_KEY);
  }, [PIN_STORAGE_KEY]);

  return {
    isVisible,
    isValidating,
    pinEnabled,
    validatePinAndToggle,
    hideValues,
    togglePinEnabled,
    clearRememberedPin,
  };
};
