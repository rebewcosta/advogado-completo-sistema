
import React from 'react';
import FormSection from '@/components/cadastro/FormSection';
import RegisterForm from '@/components/cadastro/RegisterForm';
import { Toaster } from "@/components/ui/toaster";

const CadastroPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FormSection>
          <RegisterForm />
        </FormSection>
      </div>
      <Toaster />
    </div>
  );
};

export default CadastroPage;
