
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import RegisterFormHeader from './RegisterFormHeader';
import FormSection from './FormSection';
import SubmitButton from './SubmitButton';
import PlanInfoBox from './PlanInfoBox';

const RegisterForm = () => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    oab: '',
    empresa: '',
    plano: 'basico'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await signUp(
        formData.email,
        formData.senha,
        {
          nome: formData.nome,
          telefone: formData.telefone,
          oab: formData.oab,
          empresa: formData.empresa || 'Meu Escritório de Advocacia',
          plano: formData.plano
        }
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta antes de fazer login.",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lawyer-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <RegisterFormHeader />
        
        <Card className="border-0 shadow-lg bg-lawyer-dark">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                <FormSection
                  title="📝 Informações Pessoais"
                  fields={[
                    { name: 'nome', label: 'Nome completo', type: 'text', required: true },
                    { name: 'email', label: 'Email', type: 'email', required: true },
                    { name: 'telefone', label: 'Telefone', type: 'tel', placeholder: '(11) 99999-9999' }
                  ]}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <FormSection
                  title="🔒 Segurança"
                  fields={[
                    { name: 'senha', label: 'Senha', type: 'password', required: true },
                    { name: 'confirmarSenha', label: 'Confirmar senha', type: 'password', required: true }
                  ]}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>

              <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                <FormSection
                  title="⚖️ Informações Profissionais"
                  fields={[
                    { name: 'oab', label: 'Número da OAB', type: 'text', placeholder: 'Ex: 123456/SP' },
                    { name: 'empresa', label: 'Nome do escritório', type: 'text', placeholder: 'Meu Escritório de Advocacia' }
                  ]}
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <PlanInfoBox 
                  selectedPlan={formData.plano}
                  onPlanChange={(plano) => handleChange('plano', plano)}
                />
              </div>

              <div className="pt-4 border-t border-blue-600">
                <SubmitButton isLoading={isLoading} />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
