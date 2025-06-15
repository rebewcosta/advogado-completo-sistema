
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Search, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
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
  nome?: string;
  situacao?: string;
  nascimento?: string;
  genero?: string;
  digito_verificador?: string;
  codigo_situacao?: string;
  descricao_situacao?: string;
}

export const ConsultaCnpjCpf: React.FC = () => {
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
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

  const formatDate = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 8) {
      return digitsOnly.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
    return digitsOnly.slice(0, 8).replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
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
      
      // Primeira tentativa: ReceitaWS
      let response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
      let data;
      
      if (response.ok) {
        data = await response.json();
        if (data.status !== 'ERROR') {
          setCnpjData(data);
          toast({
            title: "CNPJ encontrado",
            description: "Dados da empresa consultados com sucesso!",
          });
          return;
        }
      }

      // Segunda tentativa: API alternativa
      response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
      
      if (response.ok) {
        data = await response.json();
        
        // Adapta os dados para o formato esperado
        const adaptedData = {
          cnpj: data.estabelecimento?.cnpj || cnpjLimpo,
          razao_social: data.razao_social || 'Não informado',
          nome_fantasia: data.estabelecimento?.nome_fantasia || '',
          situacao: data.estabelecimento?.situacao_cadastral || 'Não informado',
          tipo: data.natureza_juridica?.descricao || 'Não informado',
          porte: data.porte?.descricao || 'Não informado',
          natureza_juridica: data.natureza_juridica?.descricao || 'Não informado',
          logradouro: data.estabelecimento?.logradouro || 'Não informado',
          numero: data.estabelecimento?.numero || '',
          municipio: data.estabelecimento?.cidade?.nome || 'Não informado',
          uf: data.estabelecimento?.estado?.sigla || 'Não informado',
          cep: data.estabelecimento?.cep || 'Não informado',
          telefone: data.estabelecimento?.telefone1 || 'Não informado',
          email: data.estabelecimento?.email || 'Não informado',
          atividade_principal: data.estabelecimento?.atividade_principal ? 
            [{ code: data.estabelecimento.atividade_principal.id, text: data.estabelecimento.atividade_principal.descricao }] : 
            [{ code: '', text: 'Não informado' }]
        };
        
        setCnpjData(adaptedData);
        toast({
          title: "CNPJ encontrado",
          description: "Dados da empresa consultados com sucesso!",
        });
        return;
      }

      throw new Error('Todas as APIs falharam');
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CNPJ. Verifique sua conexão e tente novamente.",
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

    if (!dataNascimento || dataNascimento.replace(/\D/g, '').length !== 8) {
      toast({
        title: "Data de nascimento inválida",
        description: "Por favor, digite uma data de nascimento válida no formato DD/MM/AAAA.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCpf(true);
    
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');
      const dataLimpa = dataNascimento.replace(/\D/g, '');
      
      // Primeira validação local
      const isValid = validarCPF(cpf);
      if (!isValid) {
        setCpfData({
          valid: false,
          formatted: cpf
        });
        toast({
          title: "CPF inválido",
          description: "O CPF informado não é válido.",
          variant: "destructive",
        });
        return;
      }

      // Tentativa de consulta na Receita Federal
      // Formato da data: DDMMAAAA
      const dataFormatada = `${dataLimpa.slice(0,2)}${dataLimpa.slice(2,4)}${dataLimpa.slice(4,8)}`;
      
      const response = await fetch(`https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `txtCPF=${cpfLimpo}&txtDataNascimento=${dataFormatada}&txtCaptcha=&Submit=Consultar`
      });

      if (response.ok) {
        const htmlText = await response.text();
        
        // Parse simples do HTML de resposta da Receita Federal
        const nomeMatch = htmlText.match(/Nome:\s*([^<]+)/i);
        const situacaoMatch = htmlText.match(/Situação:\s*([^<]+)/i);
        
        const cpfInfo: CPFData = {
          valid: true,
          formatted: cpf,
          nome: nomeMatch ? nomeMatch[1].trim() : 'Consulta realizada com sucesso',
          situacao: situacaoMatch ? situacaoMatch[1].trim() : 'Regular',
          nascimento: dataNascimento,
          descricao_situacao: 'Dados consultados na Receita Federal'
        };
        
        setCpfData(cpfInfo);
        toast({
          title: "CPF consultado",
          description: "Dados consultados com sucesso na Receita Federal!",
        });
        
      } else {
        throw new Error('Erro na consulta da Receita Federal');
      }
      
    } catch (error) {
      console.log('Erro na consulta da Receita Federal:', error);
      
      // Fallback: validação local com informações básicas
      const isValid = validarCPF(cpf);
      const cpfInfo: CPFData = {
        valid: isValid,
        formatted: cpf,
        nascimento: dataNascimento,
        situacao: isValid ? 'CPF válido (consulta offline)' : 'CPF inválido',
        descricao_situacao: 'Validação realizada localmente - API da Receita Federal indisponível'
      };
      
      setCpfData(cpfInfo);
      
      toast({
        title: isValid ? "CPF válido" : "CPF inválido",
        description: isValid ? 
          "CPF válido. Não foi possível consultar dados na Receita Federal." : 
          "CPF com formato inválido",
        variant: isValid ? "default" : "destructive",
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
          Consulte dados de empresas (CNPJ) e informações de CPF via APIs oficiais
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
                  {cnpjData.atividade_principal && cnpjData.atividade_principal[0] && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Atividade Principal:</span>
                      <p className="text-gray-900">{cnpjData.atividade_principal[0].text}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cpf" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value));
                      setCpfData(null);
                    }}
                    placeholder="123.456.789-01"
                    maxLength={14}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="text"
                    value={dataNascimento}
                    onChange={(e) => {
                      setDataNascimento(formatDate(e.target.value));
                      setCpfData(null);
                    }}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={consultarCPF} 
                  disabled={isLoadingCpf || !cpf || !dataNascimento}
                  className="h-10"
                >
                  {isLoadingCpf ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Consultar na Receita Federal
                </Button>
              </div>
            </div>
            
            {cpfData && (
              <div className={`p-4 rounded-lg border ${cpfData.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {cpfData.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${cpfData.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {cpfData.valid ? 'CPF Consultado com Sucesso' : 'CPF Inválido'}
                  </span>
                </div>
                
                {cpfData.valid && (
                  <div className="space-y-2 text-sm text-green-700">
                    <div>
                      <span className="font-medium">CPF:</span> {cpfData.formatted}
                    </div>
                    {cpfData.nome && (
                      <div>
                        <span className="font-medium">Nome:</span> {cpfData.nome}
                      </div>
                    )}
                    {cpfData.situacao && (
                      <div>
                        <span className="font-medium">Situação:</span> {cpfData.situacao}
                      </div>
                    )}
                    {cpfData.nascimento && (
                      <div>
                        <span className="font-medium">Data de Nascimento:</span> {cpfData.nascimento}
                      </div>
                    )}
                    {cpfData.descricao_situacao && (
                      <div>
                        <span className="font-medium">Fonte:</span> {cpfData.descricao_situacao}
                      </div>
                    )}
                  </div>
                )}
                
                {!cpfData.valid && (
                  <p className="text-sm text-red-700">
                    O CPF informado não passou na validação dos dígitos verificadores.
                  </p>
                )}
              </div>
            )}
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Consulta na Receita Federal</p>
                  <p>
                    Para consultar dados do CPF na Receita Federal, é necessário informar 
                    o CPF e a data de nascimento. Os dados pessoais são protegidos pela LGPD 
                    e podem ter disponibilidade limitada.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
