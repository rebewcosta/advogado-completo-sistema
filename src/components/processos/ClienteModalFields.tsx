
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

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo_cliente: string;
  cpfCnpj: string;
  status_cliente: string;
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
    <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="nome" className="text-gray-700 font-medium">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onFieldChange('nome', e.target.value)}
              placeholder="Nome completo ou Razão Social"
              className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="cliente@exemplo.com"
              className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => onFieldChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            />
          </div>

          <div>
            <Label htmlFor="cpfCnpj" className="text-gray-700 font-medium">CPF/CNPJ</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => onFieldChange('cpfCnpj', e.target.value)}
              placeholder="000.000.000-00"
              className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="tipo_cliente" className="text-gray-700 font-medium">Tipo de Cliente *</Label>
            <Select value={formData.tipo_cliente} onValueChange={(value) => onFieldChange('tipo_cliente', value)}>
              <SelectTrigger className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base">
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
            <Select value={formData.status_cliente} onValueChange={(value) => onFieldChange('status_cliente', value)}>
              <SelectTrigger className="mt-1 md:mt-2 h-10 md:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-base">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
    </div>
  );
};

export default ClienteModalFields;
