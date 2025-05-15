
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FormSection from '@/components/cadastro/FormSection';
import RegisterForm from '@/components/cadastro/RegisterForm';

const CadastroPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitStart = () => {
    setIsLoading(true);
  };

  const handleSubmitEnd = () => {
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FormSection>
          <RegisterForm
            onSubmitStart={handleSubmitStart}
            onSubmitEnd={handleSubmitEnd}
          />
        </FormSection>
      </div>
    </div>
  );
};

export default CadastroPage;
