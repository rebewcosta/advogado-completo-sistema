// src/components/ProcessForm.tsx
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
import { format, parse, isValid } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

interface ProcessoFormInput {
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessFormProps {
  onSave: (data: ProcessoFormInput) => void;
  onCancel: () => void;
  processoParaEditar?: Partial<ProcessoFormInput> & { id?: string , cliente?: any};
  isEdit: boolean;
  clientesDoUsuario: ClienteParaSelect[] | undefined;
  isLoadingClientes?: boolean;
}

const ProcessForm: React.FC<ProcessFormProps> = ({
  onSave,
  onCancel,
  processoParaEditar,
  isEdit,
  clientesDoUsuario = [], // Valor padrão como array vazio
  isLoadingClientes = false
}) => {
  const [numero, setNumero] = useState("");
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState<string | null>(null);
  const [tipo, setTipo] = useState("Cível");
  const [vara, setVara] = useState("");
  const [status, setStatus] = useState<'Em andamento' | 'Concluído' | 'Suspenso'>("Em andamento");
  const [prazoDate, setPrazoDate] = useState<Date | undefined>(undefined);

  console.log("ProcessForm: Props no início - clientesDoUsuario:", clientesDoUsuario, "isLoadingClientes:", isLoadingClientes, "processoParaEditar:", processoParaEditar, "isEdit:", isEdit);

  const stringToDate = (dateString?: string): Date | undefined => {
    if (!dateString || dateString.trim() === "") return undefined;
    let parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) return parsedDate;
    parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const dateToString = (date?: Date): string => {
    if (!date) return "";
    return format(date, 'dd/MM/yyyy');
  };

  useEffect(() => {
    console.log("ProcessForm useEffect [processoParaEditar, isEdit] - processoParaEditar:", processoParaEditar, "isEdit:", isEdit);
    if (isEdit && processoParaEditar) {
      setNumero(processoParaEditar.numero || "");
      setClienteIdSelecionado(processoParaEditar.cliente_id || null);
      setTipo(processoParaEditar.tipo || "Cível");
      setVara(processoParaEditar.vara || "");
      setStatus(processoParaEditar.status || "Em andamento");
      setPrazoDate(stringToDate(processoParaEditar.prazo));
      console.log("ProcessForm useEffect - Formulário populado para edição. clienteIdSelecionado:", processoParaEditar.cliente_id || null);
    } else {
      console.log("ProcessForm useEffect - Resetando formulário para novo processo.");
      setNumero("");
      setClienteIdSelecionado(null);
      setTipo("Cível");
      setVara("");
      setStatus("Em andamento");
      setPrazoDate(undefined);
    }
  }, [processoParaEditar, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !tipo || !status) {
        alert("Por favor, preencha os campos obrigatórios: Número do Processo, Tipo e Status.");
        return;
    }

    const selectedClienteObj = Array.isArray(clientesDoUsuario) ? clientesDoUsuario.find(c => c.id === clienteIdSelecionado) : undefined;

    const processData: ProcessoFormInput = {
      numero,
      cliente_id: clienteIdSelecionado,
      nome_cliente_text: clienteIdSelecionado && selectedClienteObj ? selectedClienteObj.nome : (clienteIdSelecionado === null ? undefined : 'Cliente não encontrado'),
      tipo,
      vara,
      status,
      prazo: prazoDate ? dateToString(prazoDate) : "",
    };
    console.log("ProcessForm handleSubmit, enviando processData:", processData);
    onSave(processData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold">{isEdit ? "Editar Processo" : "Novo Processo"}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="-mr-2 -mt-2 md:mr-0 md:mt-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="numero">Número do Processo <span className="text-red-500">*</span></Label>
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
            <Label htmlFor="cliente_id">Cliente</Label>
            {console.log("ProcessForm: Renderizando Select de Clientes - isLoadingClientes:", isLoadingClientes, "clientesDoUsuario (tipo):", typeof clientesDoUsuario, "clientesDoUsuario (valor):", clientesDoUsuario)}
            <Select
              value={clienteIdSelecionado || ""}
              onValueChange={(value) => setClienteIdSelecionado(value === "" ? null : value)}
            >
              <SelectTrigger className="mt-1" disabled={isLoadingClientes}>
                <SelectValue placeholder={isLoadingClientes ? "Carregando clientes..." : "Selecione o cliente"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingClientes ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  Array.isArray(clientesDoUsuario) && clientesDoUsuario.length > 0 ? (
                    clientesDoUsuario.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_clients_available" disabled>Nenhum cliente cadastrado</SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {clienteIdSelecionado === null && !isLoadingClientes && (!clientesDoUsuario || clientesDoUsuario.length === 0) && <p className="text-xs text-gray-500 mt-1">Cadastre clientes na aba "Clientes" para selecioná-los aqui.</p>}
            {clienteIdSelecionado === null && !isLoadingClientes && clientesDoUsuario && clientesDoUsuario.length > 0 && <p className="text-xs text-gray-500 mt-1">Ou prossiga sem selecionar um cliente formal.</p>}
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Processo <span className="text-red-500">*</span></Label>
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
                <SelectItem value="Outro">Outro</SelectItem>
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
            />
          </div>

          <div>
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
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
              className="mt-1 w-full"
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