import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo_cliente: string;
  cpfCnpj: string;
  status_cliente: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
}

interface ClienteModalFieldsProps {
  formData: ClienteFormData;
  onFieldChange: (field: keyof ClienteFormData, value: string) => void;
}

const ClienteModalFields: React.FC<ClienteModalFieldsProps> = ({
  formData,
  onFieldChange
}) => {
  return (
    <>
      <div>
        <Label htmlFor="nome" className="text-gray-700 font-medium">Nome *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => onFieldChange('nome', e.target.value)}
          placeholder="Nome completo do cliente"
          className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
          style={{ fontSize: '16px' }} // Prevent iOS zoom
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder="email@exemplo.com"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div>
          <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => onFieldChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="tipo_cliente" className="text-gray-700 font-medium">Tipo de Cliente *</Label>
          <Select value={formData.tipo_cliente} onValueChange={(value) => onFieldChange('tipo_cliente', value)}>
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
          <Label htmlFor="cpfCnpj" className="text-gray-700 font-medium">CPF/CNPJ</Label>
          <Input
            id="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={(e) => onFieldChange('cpfCnpj', e.target.value)}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="endereco" className="text-gray-700 font-medium">Endereço</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={(e) => onFieldChange('endereco', e.target.value)}
          placeholder="Rua, número, bairro"
          className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
          style={{ fontSize: '16px' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <Label htmlFor="cidade" className="text-gray-700 font-medium">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => onFieldChange('cidade', e.target.value)}
            placeholder="Cidade"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div>
          <Label htmlFor="estado" className="text-gray-700 font-medium">Estado</Label>
          <Input
            id="estado"
            value={formData.estado}
            onChange={(e) => onFieldChange('estado', e.target.value)}
            placeholder="SP"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div>
          <Label htmlFor="cep" className="text-gray-700 font-medium">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => onFieldChange('cep', e.target.value)}
            placeholder="00000-000"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="status_cliente" className="text-gray-700 font-medium">Status *</Label>
          <Select value={formData.status_cliente} onValueChange={(value) => onFieldChange('status_cliente', value)}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => onFieldChange('observacoes', e.target.value)}
            placeholder="Observações adicionais"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>
    </>
  );
};

export default ClienteModalFields;