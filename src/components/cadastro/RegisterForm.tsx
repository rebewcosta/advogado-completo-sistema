
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Phone, Scale, Building, Lock } from 'lucide-react';
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
    <div className="container mx-auto px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Informações Pessoais */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome" className="text-gray-700 font-medium">Nome completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="mt-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Seu nome completo"
                      required
                    />
                    {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Lock className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Segurança</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="senha" className="text-gray-700 font-medium">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      className="mt-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium">Confirmar senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                      className="mt-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Confirme sua senha"
                      required
                    />
                    {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Informações Profissionais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="oab" className="text-gray-700 font-medium">Número da OAB</Label>
                    <Input
                      id="oab"
                      type="text"
                      value={formData.oab}
                      onChange={(e) => handleChange('oab', e.target.value)}
                      placeholder="Ex: 123456/SP"
                      className="mt-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="empresa" className="text-gray-700 font-medium">Nome do escritório</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="empresa"
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => handleChange('empresa', e.target.value)}
                        placeholder="Meu Escritório de Advocacia"
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Plano */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <PlanInfoBox />
              </div>

              {/* Botão de Submissão */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
                
                <p className="text-center text-sm text-gray-600 mt-4">
                  Ao criar sua conta, você concorda com nossos{' '}
                  <a href="/termos" className="text-blue-600 hover:text-blue-700 font-medium">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="/privacidade" className="text-blue-600 hover:text-blue-700 font-medium">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;
