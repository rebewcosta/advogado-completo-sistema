import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PlanInfoBox from './PlanInfoBox';
import InputField from './InputField';
import SubmitButton from './SubmitButton';

interface RegisterFormProps {
  onSubmitStart: () => void;
  onSubmitEnd: () => void;
}

const RegisterForm = ({ onSubmitStart, onSubmitEnd }: RegisterFormProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    onSubmitStart();

    try {
      // Redirecionar para a página de pagamento com os dados do cadastro
      console.log("Redirecionando para pagamento com os dados:", { nome, email, passwordNotSent: '***' });
      
      // Use navigate instead of history.push
      navigate('/pagamento', { 
        state: { 
          registrationData: { nome, email, password } 
        } 
      });
      
      // Não chamamos onSubmitEnd() aqui, pois a página de pagamento agora lida com o próximo passo
      
    } catch (error) {
      console.error("Erro ao redirecionar para pagamento:", error);
      toast({
        title: "Erro no Processo de Cadastro",
        description: "Ocorreu um erro inesperado ao tentar iniciar o processo de pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      onSubmitEnd();
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <InputField
          id="nome"
          label="Nome completo"
          type="text"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        
        <InputField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="password"
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <InputField
            id="confirm-password"
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <div>
          <PlanInfoBox />
        </div>
        
        <div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary border-gray-300 rounded"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                Concordo com os <Link to="/termos-privacidade" className="text-lawyer-primary hover:underline">Termos de Serviço</Link> e <Link to="/termos-privacidade" className="text-lawyer-primary hover:underline">Política de Privacidade</Link>
              </label>
            </div>
          </div>
        </div>
      </div>

      <SubmitButton isLoading={isSubmitting} />

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-lawyer-primary hover:text-blue-700">
            Faça login
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
