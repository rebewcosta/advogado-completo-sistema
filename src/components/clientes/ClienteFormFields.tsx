
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="nome_cliente_form">
            Nome <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="nome_cliente_form" 
            name="nome" 
            value={formData.nome}
            onChange={handleChange}
            placeholder="Nome completo ou Razão Social"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tipo_cliente_form">
            Tipo de Cliente <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.tipo_cliente}
            onValueChange={(value) => handleSelectChange('tipo_cliente', value)}
          >
            <SelectTrigger id="tipo_cliente_form">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="cpfCnpj_cliente_form">
            {formData.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"} <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="cpfCnpj_cliente_form" 
            name="cpfCnpj" 
            value={formData.cpfCnpj}
            onChange={handleChange}
            placeholder={formData.tipo_cliente === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email_cliente_form">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="email_cliente_form" 
            name="email" 
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="cliente@exemplo.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="telefone_cliente_form">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="telefone_cliente_form" 
            name="telefone" 
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endereco_cliente_form">
            Endereço
          </Label>
          <Input 
            id="endereco_cliente_form" 
            name="endereco" 
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Rua, número, complemento"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="cidade_cliente_form">
            Cidade
          </Label>
          <Input 
            id="cidade_cliente_form" 
            name="cidade" 
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Cidade"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="estado_cliente_form">
            Estado
          </Label>
          <Select 
            value={formData.estado}
            onValueChange={(value) => handleSelectChange('estado', value)}
          >
            <SelectTrigger id="estado_cliente_form">
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
          <Label htmlFor="cep_cliente_form">
            CEP
          </Label>
          <Input 
            id="cep_cliente_form" 
            name="cep" 
            value={formData.cep}
            onChange={handleChange}
            placeholder="00000-000"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="observacoes_cliente_form">
          Observações
        </Label>
        <Textarea 
          id="observacoes_cliente_form" 
          name="observacoes" 
          value={formData.observacoes}
          onChange={handleChange}
          placeholder="Observações adicionais sobre o cliente"
          rows={3}
        />
      </div>
    </div>
  );
};

export default ClienteFormFields;
