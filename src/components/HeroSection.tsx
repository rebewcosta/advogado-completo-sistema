
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
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
            <Link to="/login" className="btn-primary">
              Começar Agora <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-lawyer-primary/10 p-8 rounded-lg border border-lawyer-primary/30 shadow-lg shadow-lawyer-primary/20 w-full max-w-md">
              <form className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Acesso ao Sistema</h2>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lawyer-accent text-white"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
                  <input 
                    type="password" 
                    id="password" 
                    className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lawyer-accent text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      id="remember" 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-white/20 text-lawyer-accent focus:ring-lawyer-accent"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm">Lembrar-me</label>
                  </div>
                  <a href="#" className="text-sm text-lawyer-accent hover:underline">Esqueceu a senha?</a>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-lawyer-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Entrar
                </button>
                <div className="text-center text-sm">
                  <span>Não tem uma conta? </span>
                  <a href="#" className="text-lawyer-accent hover:underline">Cadastre-se</a>
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
