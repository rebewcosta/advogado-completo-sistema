
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CadastroPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoPlano, setTipoPlano] = useState('profissional');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Você será redirecionado para o login.",
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }, 1500);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <div>
            <Link to="/" className="flex items-center text-lawyer-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para a home
            </Link>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Crie sua conta
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Cadastre-se para acessar o sistema JusGestão e otimize a gestão do seu escritório
              </p>
            </div>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirmar senha
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Escolha seu plano
                </label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${tipoPlano === 'iniciante' ? 'ring-2 ring-lawyer-primary' : 'hover:border-lawyer-primary'}`}
                    onClick={() => setTipoPlano('iniciante')}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={tipoPlano === 'iniciante'}
                        onChange={() => setTipoPlano('iniciante')}
                        className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                      />
                      <label className="ml-2 font-medium">Iniciante</label>
                    </div>
                    <p className="text-xl font-bold mb-1">R$ 99<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    <p className="text-sm text-gray-600">Ideal para advogados autônomos</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${tipoPlano === 'profissional' ? 'ring-2 ring-lawyer-primary' : 'hover:border-lawyer-primary'}`}
                    onClick={() => setTipoPlano('profissional')}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={tipoPlano === 'profissional'}
                        onChange={() => setTipoPlano('profissional')}
                        className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                      />
                      <label className="ml-2 font-medium">Profissional</label>
                    </div>
                    <p className="text-xl font-bold mb-1">R$ 199<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    <p className="text-sm text-gray-600">Para escritórios em crescimento</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${tipoPlano === 'empresarial' ? 'ring-2 ring-lawyer-primary' : 'hover:border-lawyer-primary'}`}
                    onClick={() => setTipoPlano('empresarial')}
                  >
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={tipoPlano === 'empresarial'}
                        onChange={() => setTipoPlano('empresarial')}
                        className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                      />
                      <label className="ml-2 font-medium">Empresarial</label>
                    </div>
                    <p className="text-xl font-bold mb-1">R$ 349<span className="text-sm font-normal text-gray-500">/mês</span></p>
                    <p className="text-sm text-gray-600">Para escritórios médios e grandes</p>
                  </div>
                </div>
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
                      Concordo com os <a href="#" className="text-lawyer-primary hover:underline">Termos de Serviço</a> e <a href="#" className="text-lawyer-primary hover:underline">Política de Privacidade</a>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary ${isLoading ? 'opacity-75' : ''}`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Processando...' : 'Criar conta'}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-lawyer-primary hover:text-blue-700">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPage;
