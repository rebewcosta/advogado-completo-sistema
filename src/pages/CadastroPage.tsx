
import React from 'react';
import FormSection from '@/components/cadastro/FormSection';
import RegisterForm from '@/components/cadastro/RegisterForm';

const CadastroPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FormSection>
          <RegisterForm />
        </FormSection>
      </div>
    </div>
  );
};

export default CadastroPage;
