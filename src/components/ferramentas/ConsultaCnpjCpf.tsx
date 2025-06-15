
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Search, Loader2 } from 'lucide-react';
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
  cpf: string;
  nome: string;
  situacao: string;
  data_nascimento: string;
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
      // Simulação de consulta CPF (APIs públicas de CPF são limitadas)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Consulta CPF",
        description: "Funcionalidade de consulta CPF disponível apenas para APIs premium.",
        variant: "destructive",
      });
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CPF. Tente novamente.",
        variant: "destructive",
      });
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
          Consulte dados de empresas (CNPJ) e pessoas físicas (CPF)
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
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
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
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Consultar
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Consultas de CPF são restritas por leis de proteção de dados. 
                Esta funcionalidade está disponível apenas para validação do formato.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
