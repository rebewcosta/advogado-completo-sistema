import React, { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";
import ClienteModalSimples from '@/components/processos/ClienteModalSimples';

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
  onClienteAdded?: () => void;
}

const ProcessForm: React.FC<ProcessFormProps> = ({
  onSave,
  onCancel,
  processoParaEditar,
  isEdit,
  clientesDoUsuario = [],
  isLoadingClientes = false,
  onClienteAdded
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [numero, setNumero] = useState("");
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState<string | null>(null);
  const [tipo, setTipo] = useState("Cível");
  const [vara, setVara] = useState("");
  const [status, setStatus] = useState<'Em andamento' | 'Concluído' | 'Suspenso'>("Em andamento");
  const [prazoDate, setPrazoDate] = useState<Date | undefined>(undefined);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [isSavingCliente, setIsSavingCliente] = useState(false);

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
    if (isEdit && processoParaEditar) {
      setNumero(processoParaEditar.numero || "");
      setClienteIdSelecionado(processoParaEditar.cliente_id || null);
      setTipo(processoParaEditar.tipo || "Cível");
      setVara(processoParaEditar.vara || "");
      setStatus(processoParaEditar.status || "Em andamento");
      setPrazoDate(stringToDate(processoParaEditar.prazo));
    } else {
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
    onSave(processData);
  };

  const handleSaveCliente = async (clienteData: any) => {
    if (!user || isSavingCliente) return false;
    
    setIsSavingCliente(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cliente cadastrado",
        description: `O cliente ${data.nome} foi cadastrado com sucesso.`,
      });

      if (onClienteAdded) {
        onClienteAdded();
      }
      setClienteIdSelecionado(data.id);
      setShowClienteModal(false);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingCliente(false);
    }
  };

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          {/* Header com gradiente azul */}
          <div className="p-6">
            <TooltipProvider>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">
                    {isEdit ? 'Editar Processo' : 'Novo Processo'}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {isEdit 
                          ? "Atualize as informações do processo. Campos com * são obrigatórios."
                          : "Cadastre um novo processo preenchendo todos os campos obrigatórios."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-white hover:bg-white/20 -mr-2 -mt-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </TooltipProvider>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {/* Campos do formulário com fundo branco */}
            <div className="bg-white mx-6 rounded-xl p-6 flex-1 overflow-y-auto">
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
                        onClick={() => setShowClienteModal(true)}
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
            </div>

            {/* Footer com gradiente azul e botões */}
            <div className="p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {isEdit ? 'Salvar Alterações' : 'Cadastrar Processo'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>

      <ClienteModalSimples
        open={showClienteModal}
        onOpenChange={setShowClienteModal}
        onSaveCliente={handleSaveCliente}
        isSaving={isSavingCliente}
      />
    </>
  );
};

export default ProcessForm;
