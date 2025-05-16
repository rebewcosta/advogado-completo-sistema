
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessFormProps {
  onSave: (data: Omit<Process, "id">) => void;
  onCancel: () => void;
  process: Process | null;
  isEdit: boolean;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ onSave, onCancel, process, isEdit }) => {
  const [numero, setNumero] = useState(process?.numero || "");
  const [cliente, setCliente] = useState(process?.cliente || "");
  const [tipo, setTipo] = useState(process?.tipo || "");
  const [vara, setVara] = useState(process?.vara || "");
  const [status, setStatus] = useState<'Em andamento' | 'Concluído' | 'Suspenso'>(process?.status || "Em andamento");
  const [prazoDate, setPrazoDate] = useState<Date | undefined>(
    process?.prazo ? new Date(process.prazo) : undefined
  );
  const [clienteOptions, setClienteOptions] = useState<string[]>([]);

  // Carregar clientes do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const clients = JSON.parse(savedClients);
        const clientNames = clients.map((client: any) => client.nome);
        setClienteOptions(clientNames);
        console.log("Clientes carregados:", clientNames.length);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    } else {
      console.log("Nenhum cliente encontrado no localStorage");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", { numero, cliente, tipo, vara, status, prazoDate });
    
    const processData = {
      numero,
      cliente,
      tipo,
      vara,
      status,
      prazo: prazoDate ? format(prazoDate, 'dd/MM/yyyy') : ""
    };
    
    onSave(processData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{isEdit ? "Editar Processo" : "Novo Processo"}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="numero">Número do Processo</Label>
            <Input
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={cliente} onValueChange={setCliente} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clienteOptions.length > 0 ? (
                  clienteOptions.map((nome, index) => (
                    <SelectItem key={index} value={nome}>{nome}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Nenhum cliente cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tipo">Tipo de Processo</Label>
            <Select value={tipo} onValueChange={setTipo} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cível">Cível</SelectItem>
                <SelectItem value="Trabalhista">Trabalhista</SelectItem>
                <SelectItem value="Criminal">Criminal</SelectItem>
                <SelectItem value="Tributário">Tributário</SelectItem>
                <SelectItem value="Família">Família</SelectItem>
                <SelectItem value="Empresarial">Empresarial</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="vara">Vara ou Tribunal</Label>
            <Input
              id="vara"
              value={vara}
              onChange={(e) => setVara(e.target.value)}
              placeholder="Ex: 2ª Vara Cível"
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'Em andamento' | 'Concluído' | 'Suspenso') => setStatus(value)} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="prazo">Próximo Prazo</Label>
            <DatePicker 
              date={prazoDate}
              setDate={setPrazoDate}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? "Salvar Alterações" : "Cadastrar Processo"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProcessForm;
