
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface EnderecoData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const ConsultaCep: React.FC = () => {
  const { toast } = useToast();
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCep = (value: string) => {
    // Remove tudo que não é dígito
    const digitsOnly = value.replace(/\D/g, '');
    
    // Aplica a máscara de CEP (12345-678)
    if (digitsOnly.length <= 8) {
      return digitsOnly.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    
    return digitsOnly.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const consultarCep = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
          variant: "destructive",
        });
        setEndereco(null);
        return;
      }
      
      setEndereco(data);
      toast({
        title: "CEP encontrado",
        description: "Endereço consultado com sucesso!",
      });
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CEP. Tente novamente.",
        variant: "destructive",
      });
      setEndereco(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCep(e.target.value);
    setCep(formattedCep);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      consultarCep();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Consulta de CEP - Correios
        </CardTitle>
        <CardDescription>
          Consulte endereços completos através do CEP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              type="text"
              value={cep}
              onChange={handleCepChange}
              onKeyPress={handleKeyPress}
              placeholder="12345-678"
              maxLength={9}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={consultarCep} 
              disabled={isLoading || !cep}
              className="h-10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Consultar
            </Button>
          </div>
        </div>

        {endereco && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Endereço Encontrado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">CEP:</span>
                <p className="text-gray-900">{endereco.cep}</p>
              </div>
              
              {endereco.logradouro && (
                <div>
                  <span className="font-medium text-gray-700">Logradouro:</span>
                  <p className="text-gray-900">{endereco.logradouro}</p>
                </div>
              )}
              
              {endereco.complemento && (
                <div>
                  <span className="font-medium text-gray-700">Complemento:</span>
                  <p className="text-gray-900">{endereco.complemento}</p>
                </div>
              )}
              
              {endereco.bairro && (
                <div>
                  <span className="font-medium text-gray-700">Bairro:</span>
                  <p className="text-gray-900">{endereco.bairro}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Cidade:</span>
                <p className="text-gray-900">{endereco.localidade}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">UF:</span>
                <p className="text-gray-900">{endereco.uf}</p>
              </div>
              
              {endereco.ddd && (
                <div>
                  <span className="font-medium text-gray-700">DDD:</span>
                  <p className="text-gray-900">{endereco.ddd}</p>
                </div>
              )}
              
              {endereco.ibge && (
                <div>
                  <span className="font-medium text-gray-700">Código IBGE:</span>
                  <p className="text-gray-900">{endereco.ibge}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
