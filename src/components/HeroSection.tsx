
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
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Acesso ao Sistema</h2>
                <Link to="/login" className="w-full bg-lawyer-primary text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                  Entrar no Sistema
                </Link>
                <div className="text-center text-sm mt-4">
                  <span>Não tem uma conta? </span>
                  <Link to="/cadastro" className="text-lawyer-accent hover:underline">Cadastre-se</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
