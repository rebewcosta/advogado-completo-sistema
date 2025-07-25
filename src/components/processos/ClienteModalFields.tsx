
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const estadosBrasil = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const ClienteModalFields: React.FC<ClienteModalFieldsProps> = ({
  formData,
  onFieldChange
}) => {
  return (
    <div className="space-y-3 md:space-y-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="nome" className="text-gray-700 font-medium text-sm md:text-base">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onFieldChange('nome', e.target.value)}
              placeholder="Nome completo ou Razão Social"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium text-sm md:text-base">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
              placeholder="cliente@exemplo.com"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="telefone" className="text-gray-700 font-medium text-sm md:text-base">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => onFieldChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>

          <div>
            <Label htmlFor="cpfCnpj" className="text-gray-700 font-medium text-sm md:text-base">
              {formData.tipo_cliente === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
            </Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => onFieldChange('cpfCnpj', e.target.value)}
              placeholder={formData.tipo_cliente === 'Pessoa Física' ? '000.000.000-00' : '00.000.000/0000-00'}
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="tipo_cliente" className="text-gray-700 font-medium text-sm md:text-base">Tipo de Cliente *</Label>
            <Select value={formData.tipo_cliente} onValueChange={(value) => onFieldChange('tipo_cliente', value)}>
              <SelectTrigger className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status_cliente" className="text-gray-700 font-medium text-sm md:text-base">Status</Label>
            <Select value={formData.status_cliente} onValueChange={(value) => onFieldChange('status_cliente', value)}>
              <SelectTrigger className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="endereco" className="text-gray-700 font-medium text-sm md:text-base">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => onFieldChange('endereco', e.target.value)}
              placeholder="Rua, número, complemento"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>

          <div>
            <Label htmlFor="cep" className="text-gray-700 font-medium text-sm md:text-base">CEP</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => onFieldChange('cep', e.target.value)}
              placeholder="00000-000"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="cidade" className="text-gray-700 font-medium text-sm md:text-base">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => onFieldChange('cidade', e.target.value)}
              placeholder="Nome da cidade"
              className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base"
            />
          </div>

          <div>
            <Label htmlFor="estado" className="text-gray-700 font-medium text-sm md:text-base">Estado</Label>
            <Select value={formData.estado} onValueChange={(value) => onFieldChange('estado', value)}>
              <SelectTrigger className="mt-1 h-9 md:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base">
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-h-48 overflow-y-auto">
                {estadosBrasil.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes" className="text-gray-700 font-medium text-sm md:text-base">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => onFieldChange('observacoes', e.target.value)}
            placeholder="Informações adicionais sobre o cliente"
            className="mt-1 min-h-[60px] md:min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm md:text-base resize-none"
            rows={3}
          />
        </div>
    </div>
  );
};

export default ClienteModalFields;
