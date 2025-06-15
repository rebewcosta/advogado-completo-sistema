
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { formatCPF, formatDate, consultarCPFAPI, CPFData } from './utils/cpfUtils';

export const ConsultaCpf: React.FC = () => {
  const { toast } = useToast();
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpfData, setCpfData] = useState<CPFData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    
    try {
      const data = await consultarCPFAPI(cpf, dataNascimento);
      setCpfData(data);
      
      toast({
        title: data.valid ? "CPF consultado" : "CPF inválido",
        description: data.valid ? 
          "Dados consultados com sucesso!" : 
          "CPF com formato inválido",
        variant: data.valid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o CPF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            disabled={isLoading || !cpf || !dataNascimento}
            className="h-10"
          >
            {isLoading ? (
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
    </div>
  );
};
