
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e senha.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      // A navegação é tratada dentro do hook signIn
    } catch (error) {
      // Erro já é tratado e exibido pelo hook signIn
      console.error("Login error on LoginPage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Seção Esquerda (Informativa) - COR CORRIGIDA */}
      <div className="w-full lg:w-2/5 bg-lawyer-dark text-white p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center items-center lg:items-start text-center lg:text-left relative">
        <Link to="/" className="absolute top-3 left-3 sm:top-4 sm:left-4 text-white hover:text-gray-300 flex items-center text-sm z-10 bg-black/20 hover:bg-black/40 p-2 rounded-md transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para a Home
        </Link>
        <div className="mb-6 sm:mb-8 flex flex-col items-center lg:items-start mt-12 lg:mt-0">
          {/* Logo JusGestão na parte escura */}
          <div className="flex items-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" // Logo claro para fundo escuro
              alt="JusGestão Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            />
            {/* Ajuste na cor do "Jus" para branco e "Gestão" para o azul primário para melhor contraste no fundo escuro */}
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              <span className="text-white">Jus</span><span className="text-lawyer-primary">Gestão</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-100">
            Transforme a gestão do seu escritório
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6">
            Acesse sua conta para gerenciar clientes, processos, finanças e muito mais, de forma eficiente e organizada.
          </p>
        </div>
        <div className="mt-auto w-full text-center lg:text-left">
          <p className="text-sm text-gray-300 mb-2">Não tem uma conta?</p>
          {/* Botão de cadastro com cores que se destacam no fundo escuro */}
          <Button
            variant="default" // Usar a variante default para a cor primária
            className="w-full lg:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
            onClick={() => navigate('/cadastro')}
          >
            Cadastre-se
          </Button>
        </div>
      </div>

      {/* Seção Direita (Formulário de Login) */}
      <div className="w-full lg:w-3/5 bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
        <div className="w-full max-w-md">
           <div className="text-center mb-6">
             <img 
                src="/lovable-uploads/f43e275d-744e-43eb-a2c7-bbf3c17b3fc5.png" 
                alt="JusGestão Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" 
             />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Entrar na sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Bem-vindo(a) de volta!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="email-login" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Input
                  id="email-login"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-8 sm:pl-10 block w-full border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary rounded-md h-11 sm:h-12"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <Input
                  id="password-login"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-8 sm:pl-10 block w-full border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary rounded-md h-11 sm:h-12"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Checkbox id="remember-me-login" name="remember-me" className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary border-gray-300 rounded"/>
                <Label htmlFor="remember-me-login" className="ml-2 block text-gray-700 font-normal"> {/* Removido font-medium para consistência */}
                  Lembrar de mim
                </Label>
              </div>
              <Link to="/recuperar-senha" className="font-medium text-lawyer-primary hover:text-blue-700">
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lawyer-primary hover:bg-lawyer-primary/90 text-white py-3 text-base rounded-md h-12"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-sm"> {/* Aumentei o espaçamento superior */}
            <p className="text-gray-600">
              Ainda não tem uma conta?{' '}
              <Link to="/cadastro" className="font-medium text-lawyer-primary hover:text-blue-700">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
