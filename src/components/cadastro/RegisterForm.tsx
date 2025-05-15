
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  const { signUp } = useAuth();
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
    
    setIsSubmitting(true);
    onSubmitStart();

    try {
      // Pass the custom email sender address as part of the options
      await signUp(email, password, { 
        nome, 
        emailRedirectTo: window.location.origin + "/login",
        emailSender: "suporte@sisjusgestao.com.br" 
      });
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Você será redirecionado para o pagamento.",
      });
      
      // Redirect to payment page after successful registration
      navigate('/pagamento');
    } catch (error) {
      // Erro já tratado no hook useAuth
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
