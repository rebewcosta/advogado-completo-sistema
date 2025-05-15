
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const CriarContaEspecial: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { createSpecialAccount } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !nome) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setSuccess(false);
      
      // Dados do usuário para a conta especial
      const userData = {
        nome,
        special_access: true,
        created_at: new Date().toISOString()
      };
      
      await createSpecialAccount(email, password, userData);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Conta especial para ${email} foi criada.`
      });
      
      // Mostrar mensagem de sucesso
      setSuccess(true);
      
      // Limpar os campos do formulário
      setEmail('');
      setPassword('');
      setNome('');
      
    } catch (error: any) {
      console.error("Erro ao criar conta especial:", error);
      toast({
        title: "Erro ao criar conta especial",
        description: error.message || "Ocorreu um erro ao tentar criar a conta especial.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Conta Especial</CardTitle>
        <CardDescription>
          Use este formulário para criar uma conta com acesso gratuito ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Conta criada com sucesso!</AlertTitle>
            <AlertDescription className="text-green-600">
              O usuário agora pode fazer login com o email e senha fornecidos.
            </AlertDescription>
          </Alert>
        )}
      
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome completo
            </label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do usuário"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" /> 
              Criando...
            </>
          ) : (
            "Criar Conta Especial"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CriarContaEspecial;
