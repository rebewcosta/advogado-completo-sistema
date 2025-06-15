
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  tipo: string;
  porte: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
}

interface CPFData {
  valid: boolean;
  formatted: string;
}

export const ConsultaCnpjCpf: React.FC = () => {
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null);
  const [cpfData, setCpfData] = useState<CPFData | null>(null);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);

  const formatCNPJ = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 14) {
      return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return digitsOnly.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCPF = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 11) {
      return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return digitsOnly.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  const consultarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, digite um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCnpj(true);
    
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta');
      }
      
      const data = await response.json();
      
      if (data.status === 'ERROR') {
        toast({
          title: "CNPJ não encontrado",
          description: data.message || "O CNPJ informado não foi encontrado.",
          variant: "destructive",
        });
        setCnpjData(null);
        return;
      }
      
      setCnpjData(data);
      toast({
        title: "CNPJ encontrado",
        description: "Dados da empresa consultados com sucesso!",
      });
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CNPJ. Tente novamente.",
        variant: "destructive",
      });
      setCnpjData(null);
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const consultarCPF = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite um CPF válido com 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCpf(true);
    
    try {
      // Simulação de consulta de CPF (já que não há API pública gratuita)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValid = validarCPF(cpf);
      setCpfData({
        valid: isValid,
        formatted: cpf
      });
      
      if (isValid) {
        toast({
          title: "CPF consultado",
          description: "CPF válido e formatado corretamente.",
        });
      } else {
        toast({
          title: "CPF inválido",
          description: "O CPF informado não é válido.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CPF. Tente novamente.",
        variant: "destructive",
      });
      setCpfData(null);
    } finally {
      setIsLoadingCpf(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Consulta CNPJ/CPF
        </CardTitle>
        <CardDescription>
          Consulte dados de empresas (CNPJ) e informações de CPF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cnpj" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cnpj">CNPJ</TabsTrigger>
            <TabsTrigger value="cpf">CPF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cnpj" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  onKeyPress={(e) => e.key === 'Enter' && consultarCNPJ()}
                  placeholder="12.345.678/0001-90"
                  maxLength={18}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={consultarCNPJ} 
                  disabled={isLoadingCnpj || !cnpj}
                  className="h-10"
                >
                  {isLoadingCnpj ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Consultar
                </Button>
              </div>
            </div>

            {cnpjData && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Dados da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">CNPJ:</span>
                    <p className="text-gray-900">{cnpjData.cnpj}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Razão Social:</span>
                    <p className="text-gray-900">{cnpjData.razao_social}</p>
                  </div>
                  {cnpjData.nome_fantasia && (
                    <div>
                      <span className="font-medium text-gray-700">Nome Fantasia:</span>
                      <p className="text-gray-900">{cnpjData.nome_fantasia}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Situação:</span>
                    <p className="text-gray-900">{cnpjData.situacao}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Porte:</span>
                    <p className="text-gray-900">{cnpjData.porte}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Município:</span>
                    <p className="text-gray-900">{cnpjData.municipio} - {cnpjData.uf}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cpf" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCPF(e.target.value));
                    setCpfData(null);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && consultarCPF()}
                  placeholder="123.456.789-01"
                  maxLength={14}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={consultarCPF} 
                  disabled={isLoadingCpf || !cpf}
                  className="h-10"
                >
                  {isLoadingCpf ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Consultar
                </Button>
              </div>
            </div>
            
            {cpfData && (
              <div className={`p-4 rounded-lg border ${cpfData.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {cpfData.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${cpfData.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {cpfData.valid ? 'CPF Consultado com Sucesso' : 'CPF Inválido'}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <p className={`${cpfData.valid ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="font-medium">CPF:</span> {cpfData.formatted}
                  </p>
                  <p className={`${cpfData.valid ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="font-medium">Status:</span> {cpfData.valid ? 'Documento válido e bem formatado' : 'Documento inválido'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Informação:</strong> Esta consulta verifica a validade do CPF e exibe informações básicas. 
                Para dados pessoais detalhados, utilize apenas fontes oficiais e autorizadas.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
