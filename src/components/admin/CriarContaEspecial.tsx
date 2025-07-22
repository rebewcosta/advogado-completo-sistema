
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const CriarContaEspecial = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(true);
  const [createdAccounts, setCreatedAccounts] = useState<Array<{email: string, nome: string, date: string}>>([]);
  
  const { createSpecialAccount, checkEmailExists } = useAuth();
  const { toast } = useToast();
  
  // Lista de emails especiais predefinidos
  const specialEmails = ['webercostag@gmail.com', 'logo.advocacia@gmail.com', 'focolaresce@gmail.com','future.iartificial@gmail.com'];
  
  // Função para criar uma senha aleatória
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Função para criar uma conta especial com email predefinido
  const handleCreateSpecialAccount = async (presetEmail: string) => {
    const presetNome = presetEmail.split('@')[0];
    const presetPassword = generatePassword();
    
    setIsLoading(true);
    
    try {
      console.log(`Tentando criar conta especial para: ${presetEmail}`);
      
      // Verificar se o email já existe
      console.log('Verificando se email já existe...');
      const emailExists = await checkEmailExists(presetEmail);
      console.log(`Email ${presetEmail} já existe:`, emailExists);
      
      if (emailExists) {
        toast({
          title: "Email já cadastrado",
          description: `O email ${presetEmail} já está sendo usado por outra conta.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Criando conta especial...');
      await createSpecialAccount(presetEmail, presetPassword, { 
        nome: presetNome, 
        special_access: true,
        skip_email_confirmation: true 
      });
      
      // Adicionar à lista de contas criadas
      setCreatedAccounts([
        ...createdAccounts,
        { 
          email: presetEmail, 
          nome: presetNome, 
          date: new Date().toLocaleString('pt-BR') 
        }
      ]);
      
      toast({
        title: "Conta especial criada com sucesso",
        description: `Uma conta com acesso especial foi criada para ${presetEmail}.`,
      });
      
    } catch (error: any) {
      console.error('Erro ao criar conta especial:', error);
      toast({
        title: "Erro ao criar conta especial",
        description: error.message || 'Ocorreu um erro inesperado',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log(`Tentando criar conta especial para: ${email}`);
      
      // Verificar se o email já existe
      console.log('Verificando se email já existe...');
      const emailExists = await checkEmailExists(email);
      console.log(`Email ${email} já existe:`, emailExists);
      
      if (emailExists) {
        toast({
          title: "Email já cadastrado",
          description: `O email ${email} já está sendo usado por outra conta.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Criando conta especial...');
      await createSpecialAccount(email, password, { 
        nome, 
        special_access: true,
        skip_email_confirmation: skipConfirmation 
      });
      
      // Adicionar à lista de contas criadas
      setCreatedAccounts([
        ...createdAccounts,
        { 
          email, 
          nome, 
          date: new Date().toLocaleString('pt-BR') 
        }
      ]);
      
      // Limpar campos
      setEmail('');
      setNome('');
      setPassword('');
      
      toast({
        title: "Conta especial criada com sucesso",
        description: `Uma conta com acesso especial foi criada para ${email}.`,
      });
    } catch (error: any) {
      console.error('Erro ao criar conta especial:', error);
      toast({
        title: "Erro ao criar conta especial",
        description: error.message || 'Ocorreu um erro inesperado',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Conta Especial</CardTitle>
        <CardDescription>
          Crie uma conta com acesso especial que não precisa de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Botões de acesso rápido para contas especiais */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Contas especiais rápidas:</h3>
          <div className="flex flex-wrap gap-2">
            {specialEmails.map((email) => (
              <Button
                key={email}
                variant="outline"
                onClick={() => handleCreateSpecialAccount(email)}
                disabled={isLoading}
                className="text-xs"
              >
                {email}
              </Button>
            ))}
          </div>
          <Alert className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertDescription className="text-xs">
              Ao clicar em um dos botões acima, uma conta especial será criada automaticamente para o email selecionado com uma senha aleatória segura.
            </AlertDescription>
          </Alert>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha segura"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipConfirmation" 
              checked={skipConfirmation}
              onCheckedChange={(checked) => setSkipConfirmation(!!checked)}
            />
            <Label htmlFor="skipConfirmation">Pular confirmação de email</Label>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Criando...' : 'Criar Conta Especial'}
          </Button>
        </form>
        
        {createdAccounts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Contas especiais criadas:</h3>
            <div className="overflow-y-auto max-h-40">
              <ul className="space-y-1 text-sm">
                {createdAccounts.map((account, index) => (
                  <li key={index} className="border-b pb-1">
                    <strong>{account.nome}</strong> ({account.email}) - {account.date}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriarContaEspecial;
