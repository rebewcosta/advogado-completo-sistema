
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2 } from 'lucide-react';
import { formatCNPJ, consultarCNPJAPI, CNPJData } from './utils/cnpjUtils';

export const ConsultaCnpj: React.FC = () => {
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState('');
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const consultarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, digite um CNPJ válido com 14 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await consultarCNPJAPI(cnpj);
      setCnpjData(data);
      toast({
        title: "CNPJ encontrado",
        description: "Dados da empresa consultados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CNPJ. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      setCnpjData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            disabled={isLoading || !cnpj}
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
    </div>
  );
};
