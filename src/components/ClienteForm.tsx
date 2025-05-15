
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ClienteFormProps {
  onSave: (cliente: any) => void;
  onCancel: () => void;
  cliente?: any;
  isEdit?: boolean;
}

const ClienteForm = ({ onSave, onCancel, cliente, isEdit = false }: ClienteFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    tipo: cliente?.tipo || 'Pessoa Física',
    cpfCnpj: cliente?.cpfCnpj || '',
    endereco: cliente?.endereco || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    cep: cliente?.cep || '',
    observacoes: cliente?.observacoes || '',
  });

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O email do cliente é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.telefone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O telefone do cliente é obrigatório.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(formData);
    toast({
      title: isEdit ? "Cliente atualizado" : "Cliente cadastrado",
      description: isEdit 
        ? "Os dados do cliente foram atualizados com sucesso." 
        : "O cliente foi cadastrado com sucesso.",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
            <CardDescription>
              {isEdit 
                ? 'Atualize os dados do cliente no formulário abaixo.' 
                : 'Preencha os dados do cliente no formulário abaixo.'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="nome">
                  Nome <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="nome" 
                  name="nome" 
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome completo ou Razão Social"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tipo">
                  Tipo de Cliente <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.tipo}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="cpfCnpj">
                  {formData.tipo === "Pessoa Física" ? "CPF" : "CNPJ"} <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="cpfCnpj" 
                  name="cpfCnpj" 
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder={formData.tipo === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="telefone">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input 
                  id="telefone" 
                  name="telefone" 
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="endereco">
                  Endereço
                </label>
                <Input 
                  id="endereco" 
                  name="endereco" 
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cidade">
                    Cidade
                  </label>
                  <Input 
                    id="cidade" 
                    name="cidade" 
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="estado">
                    Estado
                  </label>
                  <Select 
                    value={formData.estado}
                    onValueChange={(value) => handleSelectChange('estado', value)}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="cep">
                    CEP
                  </label>
                  <Input 
                    id="cep" 
                    name="cep" 
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="observacoes">
                Observações
              </label>
              <Textarea 
                id="observacoes" 
                name="observacoes" 
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Observações adicionais sobre o cliente"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ClienteForm;
