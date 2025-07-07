
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const useValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateInput = async (
    data: Record<string, any>,
    requiredFields: string[] = [],
    maxLengths: Record<string, number> = {}
  ): Promise<ValidationResult> => {
    setIsValidating(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('validate-input', {
        body: {
          data,
          required_fields: requiredFields,
          max_lengths: maxLengths
        }
      });

      if (error) {
        console.error('Erro na validação:', error);
        toast({
          title: "Erro de Validação",
          description: "Erro interno na validação dos dados",
          variant: "destructive"
        });
        return { valid: false, errors: ['Erro interno na validação'] };
      }

      return result as ValidationResult;

    } catch (error) {
      console.error('Erro na validação:', error);
      toast({
        title: "Erro de Validação",
        description: "Erro ao validar dados",
        variant: "destructive"
      });
      return { valid: false, errors: ['Erro ao validar dados'] };
    } finally {
      setIsValidating(false);
    }
  };

  const sanitizeText = (text: string): string => {
    // Sanitização local básica
    return text
      .trim()
      .replace(/[<>"'&]/g, '')
      .replace(/\s+/g, ' ');
  };

  return {
    validateInput,
    sanitizeText,
    isValidating
  };
};
