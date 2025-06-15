
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Award } from 'lucide-react';
import RegisterForm from '@/components/cadastro/RegisterForm';

const CadastroPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative min-h-screen">
        {/* Header Section */}
        <div className="relative z-10 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12">
          <div className="container mx-auto px-3 sm:px-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-white/70 hover:text-white transition-colors duration-300 mb-6 sm:mb-8 bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-lg backdrop-blur-sm text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a home
            </Link>
            
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <img 
                  src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png"
                  alt="JusGestão Logo" 
                  className="h-10 w-10 sm:h-12 sm:w-12"
                />
                <span className="text-2xl sm:text-3xl font-bold">
                  <span className="text-white">Jus</span><span className="text-blue-400">Gestão</span>
                </span>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/30 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6 backdrop-blur-sm">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300" />
                <span className="text-blue-200 text-xs sm:text-sm font-medium">Sistema #1 para Advogados</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                <span className="text-white">Crie sua conta e</span><br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                  transforme seu escritório
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
                Cadastre-se para acessar o sistema JusGestão e otimize a gestão do seu escritório de advocacia
              </p>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 text-blue-300">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Setup em 5min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="relative z-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default CadastroPage;
