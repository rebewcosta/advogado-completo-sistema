
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const CriarContaEspecial = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(true);
  const [createdAccounts, setCreatedAccounts] = useState<Array<{email: string, nome: string, date: string}>>([]);
  
  const { createSpecialAccount } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
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
    } catch (error) {
      console.error('Erro ao criar conta especial:', error);
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
