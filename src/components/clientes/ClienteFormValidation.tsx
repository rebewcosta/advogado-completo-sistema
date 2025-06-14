
import { useToast } from "@/hooks/use-toast";

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  status_cliente: string;
}

export const useClienteFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: ClienteFormData): boolean => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    // Email validation only if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.telefone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O telefone do cliente é obrigatório.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.cpfCnpj.trim()) {
      toast({
        title: "Campo obrigatório",
        description: `O ${formData.tipo === "Pessoa Física" ? "CPF" : "CNPJ"} é obrigatório.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};
