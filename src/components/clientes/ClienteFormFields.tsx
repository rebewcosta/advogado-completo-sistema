
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
      {/* Dados Principais */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          👤 Dados Principais
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="nome_cliente_form" className="text-gray-100">
              Nome <span className="text-red-400">*</span>
            </Label>
            <Input 
              id="nome_cliente_form" 
              name="nome" 
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome completo ou Razão Social"
              className="bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tipo_cliente_form" className="text-gray-100">
              Tipo de Cliente <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.tipo_cliente}
              onValueChange={(value) => handleSelectChange('tipo_cliente', value)}
            >
              <SelectTrigger id="tipo_cliente_form" className="bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cpfCnpj_cliente_form" className="text-gray-100">
              {formData.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"} <span className="text-red-400">*</span>
            </Label>
            <Input 
              id="cpfCnpj_cliente_form" 
              name="cpfCnpj" 
              value={formData.cpfCnpj}
              onChange={handleChange}
              placeholder={formData.tipo_cliente === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
              className="bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email_cliente_form" className="text-gray-100">
              Email
            </Label>
            <Input 
              id="email_cliente_form" 
              name="email" 
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="cliente@exemplo.com"
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <Label className="text-sm font-semibold text-blue-100 mb-3 block">
          📞 Contato
        </Label>
        <div className="space-y-1">
          <Label htmlFor="telefone_cliente_form" className="text-blue-100">
            Telefone <span className="text-red-400">*</span>
          </Label>
          <Input 
            id="telefone_cliente_form" 
            name="telefone" 
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className="bg-white"
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
        <Label className="text-sm font-semibold text-gray-100 mb-3 block">
          📍 Endereço
        </Label>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <Label htmlFor="endereco_cliente_form" className="text-gray-100">
              Endereço
            </Label>
            <Input 
              id="endereco_cliente_form" 
              name="endereco" 
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua, número, complemento"
              className="bg-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cidade_cliente_form" className="text-gray-100">
                Cidade
              </Label>
              <Input 
                id="cidade_cliente_form" 
                name="cidade" 
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade"
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="estado_cliente_form" className="text-gray-100">
                Estado
              </Label>
              <Select 
                value={formData.estado}
                onValueChange={(value) => handleSelectChange('estado', value)}
              >
                <SelectTrigger id="estado_cliente_form" className="bg-white">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map(estado => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cep_cliente_form" className="text-gray-100">
                CEP
              </Label>
              <Input 
                id="cep_cliente_form" 
                name="cep" 
                value={formData.cep}
                onChange={handleChange}
                placeholder="00000-000"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <Label className="text-sm font-semibold text-blue-100 mb-3 block">
          📝 Observações
        </Label>
        <div className="space-y-1">
          <Label htmlFor="observacoes_cliente_form" className="text-blue-100">
            Observações
          </Label>
          <Textarea 
            id="observacoes_cliente_form" 
            name="observacoes" 
            value={formData.observacoes}
            onChange={handleChange}
            placeholder="Observações adicionais sobre o cliente"
            rows={3}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default ClienteFormFields;
