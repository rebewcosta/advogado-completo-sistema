
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
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

interface ProcessFormFieldsProps {
  numero: string;
  setNumero: (value: string) => void;
  clienteIdSelecionado: string | null;
  setClienteIdSelecionado: (value: string | null) => void;
  tipo: string;
  setTipo: (value: string) => void;
  vara: string;
  setVara: (value: string) => void;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  setStatus: (value: 'Em andamento' | 'Concluído' | 'Suspenso') => void;
  prazoDate: Date | undefined;
  setPrazoDate: (date: Date | undefined) => void;
  clientesDoUsuario: ClienteParaSelect[];
  isLoadingClientes: boolean;
  onShowClienteModal: () => void;
}

const ProcessFormFields: React.FC<ProcessFormFieldsProps> = ({
  numero,
  setNumero,
  clienteIdSelecionado,
  setClienteIdSelecionado,
  tipo,
  setTipo,
  vara,
  setVara,
  status,
  setStatus,
  prazoDate,
  setPrazoDate,
  clientesDoUsuario,
  isLoadingClientes,
  onShowClienteModal
}) => {
  return (
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
        <div className="flex gap-2 mt-1">
          <Select
            value={clienteIdSelecionado || ""}
            onValueChange={(value) => setClienteIdSelecionado(value === "" ? null : value)}
          >
            <SelectTrigger className="flex-1" disabled={isLoadingClientes}>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShowClienteModal}
            className="px-3"
            title="Cadastrar novo cliente"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {clienteIdSelecionado === null && !isLoadingClientes && (!clientesDoUsuario || clientesDoUsuario.length === 0) && (
          <p className="text-xs text-gray-500 mt-1">Cadastre clientes na aba "Clientes" ou clique no botão "+" para adicionar um novo.</p>
        )}
        {clienteIdSelecionado === null && !isLoadingClientes && clientesDoUsuario && clientesDoUsuario.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">Ou prossiga sem selecionar um cliente formal.</p>
        )}
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
  );
};

export default ProcessFormFields;
