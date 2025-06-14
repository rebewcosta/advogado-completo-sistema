
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  tipo_cliente: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  status_cliente: string;
}

interface ClienteFormFieldsProps {
  formData: ClienteFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const ClienteFormFields: React.FC<ClienteFormFieldsProps> = ({
  formData,
  handleChange,
  handleSelectChange
}) => {
  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nome" className="text-gray-700 font-medium">Nome *</Label>
          <Input
            id="nome"
            name="nome"
            type="text"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo ou Razão Social"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="cliente@exemplo.com"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone *</Label>
          <Input
            id="telefone"
            name="telefone"
            type="text"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>

        <div>
          <Label htmlFor="cpfCnpj" className="text-gray-700 font-medium">
            {formData.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"} *
          </Label>
          <Input
            id="cpfCnpj"
            name="cpfCnpj"
            type="text"
            value={formData.cpfCnpj}
            onChange={handleChange}
            placeholder={formData.tipo_cliente === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="tipo_cliente" className="text-gray-700 font-medium">Tipo de Cliente *</Label>
          <Select value={formData.tipo_cliente} onValueChange={(value) => handleSelectChange('tipo_cliente', value)}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status_cliente" className="text-gray-700 font-medium">Status</Label>
          <Select value={formData.status_cliente} onValueChange={(value) => handleSelectChange('status_cliente', value)}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="endereco" className="text-gray-700 font-medium">Endereço</Label>
        <Input
          id="endereco"
          name="endereco"
          type="text"
          value={formData.endereco}
          onChange={handleChange}
          placeholder="Rua, número, complemento"
          className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="cidade" className="text-gray-700 font-medium">Cidade</Label>
          <Input
            id="cidade"
            name="cidade"
            type="text"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Cidade"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="estado" className="text-gray-700 font-medium">Estado</Label>
          <Select value={formData.estado} onValueChange={(value) => handleSelectChange('estado', value)}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              {estados.map(estado => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cep" className="text-gray-700 font-medium">CEP</Label>
          <Input
            id="cep"
            name="cep"
            type="text"
            value={formData.cep}
            onChange={handleChange}
            placeholder="00000-000"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          placeholder="Observações adicionais sobre o cliente"
          rows={3}
          className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
        />
      </div>
    </div>
  );
};

export default ClienteFormFields;
