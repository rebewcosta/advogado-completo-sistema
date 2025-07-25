// src/components/clientes/ClienteFormFields.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClientesState } from '@/hooks/clientes/useClientesState';

const ClienteFormFields = () => {
  const {
    selectedCliente,
    errors,
    handleFieldChange,
    handleCepChange,
    isSubmitting,
  } = useClientesState();

  return (
    <div className="grid gap-4 py-4">
      {/* Nome Completo */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nome" className="text-right">
          Nome
        </Label>
        <div className="col-span-3">
          <Input
            id="nome"
            name="nome"
            value={selectedCliente?.nome || ''}
            onChange={handleFieldChange}
            className={errors.nome ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <div className="col-span-3">
          <Input
            id="email"
            name="email"
            type="email"
            value={selectedCliente?.email || ''}
            onChange={handleFieldChange}
            className={errors.email ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Telefone */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="telefone" className="text-right">
          Telefone
        </Label>
        <div className="col-span-3">
          <Input
            id="telefone"
            name="telefone"
            value={selectedCliente?.telefone || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* CPF/CNPJ */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cpf_cnpj" className="text-right">
          CPF/CNPJ
        </Label>
        <div className="col-span-3">
          <Input
            id="cpf_cnpj"
            name="cpf_cnpj"
            value={selectedCliente?.cpf_cnpj || ''}
            onChange={handleFieldChange}
            className={errors.cpf_cnpj ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.cpf_cnpj && <p className="text-red-500 text-xs mt-1">{errors.cpf_cnpj}</p>}
        </div>
      </div>

      {/* Endereço */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cep" className="text-right">
          CEP
        </Label>
        <div className="col-span-3">
          <Input
            id="cep"
            name="cep"
            value={selectedCliente?.cep || ''}
            onChange={handleCepChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rua" className="text-right">
          Rua
        </Label>
        <div className="col-span-3">
          <Input
            id="rua"
            name="rua"
            value={selectedCliente?.rua || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="numero" className="text-right">
          Número
        </Label>
        <div className="col-span-3">
          <Input
            id="numero"
            name="numero"
            value={selectedCliente?.numero || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bairro" className="text-right">
          Bairro
        </Label>
        <div className="col-span-3">
          <Input
            id="bairro"
            name="bairro"
            value={selectedCliente?.bairro || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cidade" className="text-right">
          Cidade
        </Label>
        <div className="col-span-3">
          <Input
            id="cidade"
            name="cidade"
            value={selectedCliente?.cidade || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="estado" className="text-right">
          Estado
        </Label>
        <div className="col-span-3">
          <Input
            id="estado"
            name="estado"
            value={selectedCliente?.estado || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Observações */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="observacoes" className="text-right">
          Observações
        </Label>
        <div className="col-span-3">
          <Textarea
            id="observacoes"
            name="observacoes"
            value={selectedCliente?.observacoes || ''}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ClienteFormFields;