
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface FormSectionProps {
  children: React.ReactNode;
}

const FormSection = ({ children }: FormSectionProps) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
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
      {children}
    </div>
  );
};

export default FormSection;
