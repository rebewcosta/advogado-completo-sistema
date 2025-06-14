
import React from 'react';
import FormSection from '@/components/cadastro/FormSection';
import RegisterForm from '@/components/cadastro/RegisterForm';

const CadastroPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <FormSection>
          <RegisterForm />
        </FormSection>
      </div>
    </div>
  );
};

export default CadastroPage;
