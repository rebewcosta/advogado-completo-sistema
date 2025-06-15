
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ValidadorCpfCnpj: React.FC = () => {
  const { toast } = useToast();
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [cnpjValid, setCnpjValid] = useState<boolean | null>(null);

  const formatCPF = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 11) {
      return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return digitsOnly.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 14) {
      return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return digitsOnly.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const validarCPF = (cpfString: string): boolean => {
    const cpfDigits = cpfString.replace(/\D/g, '');
    
    if (cpfDigits.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfDigits)) return false;
    
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpfDigits.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfDigits.charAt(9))) return false;
    
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpfDigits.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfDigits.charAt(10))) return false;
    
    return true;
  };

  const validarCNPJ = (cnpjString: string): boolean => {
    const cnpjDigits = cnpjString.replace(/\D/g, '');
    
    if (cnpjDigits.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpjDigits)) return false;
    
    // Valida primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpjDigits.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpjDigits.charAt(12))) return false;
    
    // Valida segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpjDigits.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cnpjDigits.charAt(13))) return false;
    
    return true;
  };

  const handleCPFValidation = () => {
    if (!cpf) {
      toast({
        title: "CPF vazio",
        description: "Por favor, digite um CPF para validar.",
        variant: "destructive",
      });
      return;
    }

    const isValid = validarCPF(cpf);
    setCpfValid(isValid);
    
    toast({
      title: isValid ? "CPF Válido" : "CPF Inválido",
      description: isValid ? "O CPF informado é válido." : "O CPF informado não é válido.",
      variant: isValid ? "default" : "destructive",
    });
  };

  const handleCNPJValidation = () => {
    if (!cnpj) {
      toast({
        title: "CNPJ vazio",
        description: "Por favor, digite um CNPJ para validar.",
        variant: "destructive",
      });
      return;
    }

    const isValid = validarCNPJ(cnpj);
    setCnpjValid(isValid);
    
    toast({
      title: isValid ? "CNPJ Válido" : "CNPJ Inválido",
      description: isValid ? "O CNPJ informado é válido." : "O CNPJ informado não é válido.",
      variant: isValid ? "default" : "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Validador de CPF/CNPJ
        </CardTitle>
        <CardDescription>
          Valide a autenticidade de documentos CPF e CNPJ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cpf">Validar CPF</TabsTrigger>
            <TabsTrigger value="cnpj">Validar CNPJ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cpf" className="space-y-4">
            <div>
              <Label htmlFor="cpf-input">CPF</Label>
              <Input
                id="cpf-input"
                type="text"
                value={cpf}
                onChange={(e) => {
                  setCpf(formatCPF(e.target.value));
                  setCpfValid(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCPFValidation()}
                placeholder="123.456.789-01"
                maxLength={14}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleCPFValidation} 
              disabled={!cpf}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Validar CPF
            </Button>

            {cpfValid !== null && (
              <div className={`p-4 rounded-lg border ${cpfValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {cpfValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${cpfValid ? 'text-green-800' : 'text-red-800'}`}>
                    {cpfValid ? 'CPF Válido' : 'CPF Inválido'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${cpfValid ? 'text-green-700' : 'text-red-700'}`}>
                  {cpfValid 
                    ? 'O CPF informado passou na validação dos dígitos verificadores.'
                    : 'O CPF informado não passou na validação dos dígitos verificadores.'
                  }
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cnpj" className="space-y-4">
            <div>
              <Label htmlFor="cnpj-input">CNPJ</Label>
              <Input
                id="cnpj-input"
                type="text"
                value={cnpj}
                onChange={(e) => {
                  setCnpj(formatCNPJ(e.target.value));
                  setCnpjValid(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCNPJValidation()}
                placeholder="12.345.678/0001-90"
                maxLength={18}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleCNPJValidation} 
              disabled={!cnpj}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Validar CNPJ
            </Button>

            {cnpjValid !== null && (
              <div className={`p-4 rounded-lg border ${cnpjValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {cnpjValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${cnpjValid ? 'text-green-800' : 'text-red-800'}`}>
                    {cnpjValid ? 'CNPJ Válido' : 'CNPJ Inválido'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${cnpjValid ? 'text-green-700' : 'text-red-700'}`}>
                  {cnpjValid 
                    ? 'O CNPJ informado passou na validação dos dígitos verificadores.'
                    : 'O CNPJ informado não passou na validação dos dígitos verificadores.'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> Esta validação verifica apenas a autenticidade matemática dos dígitos verificadores. 
            Para confirmar a existência real do documento, consulte as bases oficiais.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
