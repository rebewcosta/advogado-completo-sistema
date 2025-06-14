
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransacaoFormFieldsProps {
  formData: {
    tipo: string;
    categoria: string;
    valor: string;
    descricao: string;
    data_transacao: string;
    cliente_associado_id: string;
    processo_associado_id: string;
  };
  onChange: (field: string, value: string) => void;
}

const TransacaoFormFields: React.FC<TransacaoFormFieldsProps> = ({ 
  formData, 
  onChange 
}) => {
  return (
    <div className="bg-white mx-6 rounded-xl p-6 flex-1 overflow-y-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="tipo" className="text-gray-700 font-medium">Tipo de Transação *</Label>
            <Select value={formData.tipo} onValueChange={(value) => onChange('tipo', value)}>
              <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="categoria" className="text-gray-700 font-medium">Categoria *</Label>
            <Select value={formData.categoria} onValueChange={(value) => onChange('categoria', value)}>
              <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="honorarios">Honorários</SelectItem>
                <SelectItem value="despesas_operacionais">Despesas Operacionais</SelectItem>
                <SelectItem value="investimentos">Investimentos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="valor" className="text-gray-700 font-medium">Valor *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => onChange('valor', e.target.value)}
              placeholder="0,00"
              className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="data_transacao" className="text-gray-700 font-medium">Data da Transação *</Label>
            <Input
              id="data_transacao"
              type="date"
              value={formData.data_transacao}
              onChange={(e) => onChange('data_transacao', e.target.value)}
              className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="descricao" className="text-gray-700 font-medium">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => onChange('descricao', e.target.value)}
            placeholder="Descrição da transação"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cliente_associado_id" className="text-gray-700 font-medium">Cliente Associado</Label>
            <Input
              id="cliente_associado_id"
              value={formData.cliente_associado_id}
              onChange={(e) => onChange('cliente_associado_id', e.target.value)}
              placeholder="ID do cliente (opcional)"
              className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
          
          <div>
            <Label htmlFor="processo_associado_id" className="text-gray-700 font-medium">Processo Associado</Label>
            <Input
              id="processo_associado_id"
              value={formData.processo_associado_id}
              onChange={(e) => onChange('processo_associado_id', e.target.value)}
              placeholder="ID do processo (opcional)"
              className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransacaoFormFields;
