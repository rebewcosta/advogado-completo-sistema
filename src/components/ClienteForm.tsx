// src/components/ClienteForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // <<--- IMPORTAÇÃO ADICIONADA AQUI
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
    nome: '',
    email: '',
    telefone: '',
    tipo: 'Pessoa Física', 
    cpfCnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
    status_cliente: 'Ativo' 
  });

  useEffect(() => {
    if (isEdit && cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        tipo: cliente.tipo_cliente || cliente.tipo || 'Pessoa Física',
        cpfCnpj: cliente.cpfCnpj || '', 
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: cliente.cep || '',
        observacoes: cliente.observacoes || '',
        status_cliente: cliente.status_cliente || 'Ativo'
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        tipo: 'Pessoa Física',
        cpfCnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        observacoes: '',
        status_cliente: 'Ativo'
      });
    }
  }, [cliente, isEdit]);


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
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast({
            title: "Email inválido",
            description: "Por favor, insira um endereço de email válido.",
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
    
    if (!formData.cpfCnpj.trim()) {
        toast({
            title: "Campo obrigatório",
            description: `O ${formData.tipo === "Pessoa Física" ? "CPF" : "CNPJ"} é obrigatório.`,
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
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none rounded-none md:rounded-lg md:shadow-md">
      <CardHeader className="px-4 py-4 md:px-6 md:py-5 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg md:text-xl">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {isEdit 
                ? 'Atualize os dados do cliente no formulário abaixo.' 
                : 'Preencha os dados do cliente no formulário abaixo.'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 md:h-8 md:w-8">
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 md:p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
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
                  value={formData.tipo}
                  onValueChange={(value) => handleSelectChange('tipo', value)}
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
                  {formData.tipo === "Pessoa Física" ? "CPF" : "CNPJ"} <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="cpfCnpj_cliente_form" 
                  name="cpfCnpj" 
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder={formData.tipo === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
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
        </CardContent>
        <CardFooter className="flex justify-end gap-2 px-4 py-3 md:px-6 md:py-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
            {isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ClienteForm;