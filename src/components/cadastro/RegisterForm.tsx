
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RegisterFormHeader from './RegisterFormHeader';
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
      await signUp(
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
                <h3 className="text-white text-sm font-medium mb-4">📝 Informações Pessoais</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome" className="text-white">Nome completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    {errors.nome && <p className="text-red-400 text-sm mt-1">{errors.nome}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone" className="text-white">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white text-sm font-medium mb-4">🔒 Segurança</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="senha" className="text-white">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    {errors.senha && <p className="text-red-400 text-sm mt-1">{errors.senha}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmarSenha" className="text-white">Confirmar senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      required
                    />
                    {errors.confirmarSenha && <p className="text-red-400 text-sm mt-1">{errors.confirmarSenha}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
                <h3 className="text-white text-sm font-medium mb-4">⚖️ Informações Profissionais</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="oab" className="text-white">Número da OAB</Label>
                    <Input
                      id="oab"
                      type="text"
                      value={formData.oab}
                      onChange={(e) => handleChange('oab', e.target.value)}
                      placeholder="Ex: 123456/SP"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="empresa" className="text-white">Nome do escritório</Label>
                    <Input
                      id="empresa"
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => handleChange('empresa', e.target.value)}
                      placeholder="Meu Escritório de Advocacia"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <PlanInfoBox />
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
