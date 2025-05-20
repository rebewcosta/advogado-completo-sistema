
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RecuperarSenhaPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) {
        throw error;
      }

      setEnviado(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro ao enviar o email de recuperação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <div>
            <Link to="/" className="flex items-center text-lawyer-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para a home
            </Link>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Recuperar Senha
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {enviado 
                  ? "Email enviado! Verifique sua caixa de entrada para redefinir sua senha."
                  : "Informe seu email para receber um link de recuperação de senha."
                }
              </p>
            </div>
          </div>
          
          {enviado ? (
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Um email com instruções para recuperar sua senha foi enviado para <strong>{email}</strong>. 
                  Verifique sua caixa de entrada e também a pasta de spam.
                </p>
                <div className="mt-6">
                  <Link to="/login" className="font-medium text-lawyer-primary hover:text-blue-700">
                    Voltar para o login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md space-y-4">
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary ${isLoading ? 'opacity-75' : ''}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Lembrou sua senha?{' '}
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

export default RecuperarSenhaPage;
