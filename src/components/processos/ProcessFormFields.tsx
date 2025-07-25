
import React from 'react';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
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
  clientesDoUsuario: ClienteParaSelect[] | undefined;
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="numero" className="text-gray-700 font-medium">Número do Processo *</Label>
          <Input
            id="numero"
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ex: 1234567-89.2023.8.12.3456"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            required
          />
        </div>

        <div>
          <Label htmlFor="cliente" className="text-gray-700 font-medium">Cliente</Label>
          <div className="flex gap-2 mt-2">
            <Select value={clienteIdSelecionado || "sem_cliente"} onValueChange={(value) => setClienteIdSelecionado(value === "sem_cliente" ? null : value)}>
              <SelectTrigger className="flex-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                <SelectValue placeholder={isLoadingClientes ? "Carregando clientes..." : "Selecione um cliente"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                <SelectItem value="sem_cliente">Sem cliente associado</SelectItem>
                {clientesDoUsuario?.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={onShowClienteModal}
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="tipo" className="text-gray-700 font-medium">Tipo de Processo *</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="Cível">Cível</SelectItem>
              <SelectItem value="Criminal">Criminal</SelectItem>
              <SelectItem value="Trabalhista">Trabalhista</SelectItem>
              <SelectItem value="Tributário">Tributário</SelectItem>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
              <SelectItem value="Família">Família</SelectItem>
              <SelectItem value="Empresarial">Empresarial</SelectItem>
              <SelectItem value="Previdenciário">Previdenciário</SelectItem>
              <SelectItem value="Consumidor">Consumidor</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vara" className="text-gray-700 font-medium">Vara/Tribunal</Label>
          <Input
            id="vara"
            type="text"
            value={vara}
            onChange={(e) => setVara(e.target.value)}
            placeholder="Ex: 1ª Vara Cível de São Paulo"
            className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="status" className="text-gray-700 font-medium">Status *</Label>
          <Select value={status} onValueChange={(value: 'Em andamento' | 'Concluído' | 'Suspenso') => setStatus(value)}>
            <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
              <SelectItem value="Em andamento">Em andamento</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Suspenso">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-gray-700 font-medium">Próximo Prazo</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg hover:bg-gray-50",
                  !prazoDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {prazoDate ? format(prazoDate, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg rounded-lg">
              <Calendar
                mode="single"
                selected={prazoDate}
                onSelect={setPrazoDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ProcessFormFields;
