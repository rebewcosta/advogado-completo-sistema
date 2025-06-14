
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

interface TransacaoFormData {
  tipo: string;
  descricao: string;
  valor: string;
  categoria: string;
  data: string;
  status: string;
}

interface TransacaoFormFieldsProps {
  formData: TransacaoFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const TransacaoFormFields: React.FC<TransacaoFormFieldsProps> = ({
  formData,
  handleChange,
  handleSelectChange
}) => {
  return (
    <div className="space-y-6 p-6">
      {/* Dados da Transação */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          💰 Dados da Transação
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-gray-100">
              Tipo <span className="text-red-400">*</span>
            </Label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="tipo"
                  value="Receita"
                  checked={formData.tipo === "Receita"}
                  onChange={handleChange}
                  className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                />
                <span className="text-sm text-gray-100">Receita</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="tipo"
                  value="Despesa"
                  checked={formData.tipo === "Despesa"}
                  onChange={handleChange}
                  className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                />
                <span className="text-sm text-gray-100">Despesa</span>
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="valor_transacao_form" className="text-gray-100">
              Valor (R$) <span className="text-red-400">*</span>
            </Label>
            <Input
              type="number"
              id="valor_transacao_form"
              name="valor"
              min="0"
              step="0.01"
              value={formData.valor}
              onChange={handleChange}
              required
              className="bg-white"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="descricao_transacao_form" className="text-gray-100">
              Descrição <span className="text-red-400">*</span>
            </Label>
            <Input
              type="text"
              id="descricao_transacao_form"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição da transação"
              required
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Categorização */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          🏷️ Categorização
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="categoria_transacao_form" className="text-gray-100">
              Categoria <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.categoria}
              onValueChange={(value) => handleSelectChange('categoria', value)}
            >
              <SelectTrigger id="categoria_transacao_form" className="bg-white">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Honorários">Honorários</SelectItem>
                <SelectItem value="Consultas">Consultas</SelectItem>
                <SelectItem value="Custas Processuais">Custas Processuais</SelectItem>
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Salários">Salários</SelectItem>
                <SelectItem value="Impostos">Impostos</SelectItem>
                <SelectItem value="Suprimentos">Suprimentos</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="status_transacao_form" className="text-gray-100">
              Status <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger id="status_transacao_form" className="bg-white">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          📅 Data
        </Label>
        <div className="space-y-1">
          <Label htmlFor="data_transacao_form" className="text-gray-100">
            Data da Transação <span className="text-red-400">*</span>
          </Label>
          <Input
            type="date"
            id="data_transacao_form"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default TransacaoFormFields;
