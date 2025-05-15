
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const HeroSection = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

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
      console.log("Tentando fazer login com:", email);
      await signIn(email, password);
      console.log("Login bem-sucedido!");
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      // Erro específico já é tratado no hook useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-lawyer-dark text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Gerencie seu escritório de advocacia com eficiência
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              O JusGestão é um sistema completo para advogados que simplifica a gestão de clientes, 
              processos, documentos e finanças em uma única plataforma.
            </p>
            <Link to="/cadastro" className="btn-primary">
              Cadastrar Agora <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-lawyer-primary/10 p-8 rounded-lg border border-lawyer-primary/30 shadow-lg shadow-lawyer-primary/20 w-full max-w-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Acesso ao Sistema</h2>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary border-gray-700 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-gray-300">
                      Lembrar de mim
                    </label>
                  </div>
                  <div>
                    <a href="#" className="font-medium text-lawyer-accent hover:text-lawyer-accent/90">
                      Esqueceu sua senha?
                    </a>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-lawyer-primary text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </button>
                <div className="text-center text-sm mt-4">
                  <span className="text-gray-300">Não tem uma conta? </span>
                  <Link to="/cadastro" className="text-lawyer-accent hover:underline">Cadastre-se</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
