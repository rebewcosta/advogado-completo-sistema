
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Phone, Scale, Building, Lock } from 'lucide-react';
import PlanInfoBox from './PlanInfoBox';

const RegisterForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, checkEmailExists } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  
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
    
    // Verificar debounce para evitar muitas tentativas seguidas (5 segundos)
    const now = Date.now();
    if (now - lastSubmitTime < 5000) {
      toast({
        title: "Aguarde um momento",
        description: "Por favor, aguarde alguns segundos antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLastSubmitTime(now);
    
    try {
      // Verificar se o email já existe antes de tentar criar
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está cadastrado. Tente fazer login ou use a opção 'Esqueci minha senha'.",
          variant: "destructive",
        });
        return;
      }

      // Criar a conta diretamente com 7 dias de trial
      await signUp(formData.email, formData.senha, {
        nome_completo: formData.nome,
        telefone: formData.telefone,
        oab: formData.oab,
        empresa: formData.empresa || 'Meu Escritório de Advocacia',
        plano: formData.plano
      });

      // Guardar email para a página de confirmação
      localStorage.setItem('pendingConfirmationEmail', formData.email);
      
      // Toast mais detalhado
      toast({
        title: "🎉 Cadastro realizado com sucesso!",
        description: "Redirecionando para instruções de confirmação do email...",
        duration: 5000,
      });

      // Redirecionar para página de confirmação depois de um delay
      setTimeout(() => {
        navigate('/confirmacao-email');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      // Tratamento específico para diferentes tipos de erro
      let errorMessage = "Houve um problema. Tente novamente.";
      
      if (error.message.includes('email rate limit') || error.message.includes('tentativas de cadastro')) {
        errorMessage = error.message;
      } else if (error.message.includes('já está cadastrado') || error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado. Tente fazer login ou use a opção 'Esqueci minha senha'.";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "Email inválido. Verifique se digitou corretamente.";
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({
        title: "❌ Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Duração maior para mensagens de erro
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {/* Informações Pessoais */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome" className="text-gray-700 font-medium text-sm sm:text-base">Nome completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="mt-1 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Seu nome completo"
                      required
                    />
                    {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium text-sm sm:text-base">Email *</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-8 sm:pl-10 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone" className="text-gray-700 font-medium text-sm sm:text-base">Telefone</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="pl-8 sm:pl-10 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Segurança</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="senha" className="text-gray-700 font-medium text-sm sm:text-base">Senha *</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      className="mt-1 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium text-sm sm:text-base">Confirmar senha *</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                      className="mt-1 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Confirme sua senha"
                      required
                    />
                    {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Informações Profissionais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="oab" className="text-gray-700 font-medium text-sm sm:text-base">Número da OAB</Label>
                    <Input
                      id="oab"
                      type="text"
                      value={formData.oab}
                      onChange={(e) => handleChange('oab', e.target.value)}
                      placeholder="Ex: 123456/SP"
                      className="mt-1 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="empresa" className="text-gray-700 font-medium text-sm sm:text-base">Nome do escritório</Label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <Input
                        id="empresa"
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => handleChange('empresa', e.target.value)}
                        placeholder="Meu Escritório de Advocacia"
                        className="pl-8 sm:pl-10 h-11 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Plano */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <PlanInfoBox />
              </div>

              {/* Botão de Submissão */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    '🎉 Começar 7 Dias Grátis'
                  )}
                </Button>
                
                <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 px-2">
                  Ao continuar, você concorda com nossos{' '}
                  <Link to="/termos-privacidade" className="text-blue-600 hover:text-blue-700 font-medium">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/termos-privacidade" className="text-blue-600 hover:text-blue-700 font-medium">
                    Política de Privacidade
                  </Link>
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
