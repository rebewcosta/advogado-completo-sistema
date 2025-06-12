
import React, { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import ProcessFormHeader from '@/components/processos/ProcessFormHeader';
import ProcessFormFields from '@/components/processos/ProcessFormFields';
import ProcessFormActions from '@/components/processos/ProcessFormActions';
import ClienteModal from '@/components/processos/ClienteModal';

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
    if (!user || isSavingCliente) return;
    
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
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCliente(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <ProcessFormHeader isEdit={isEdit} onCancel={onCancel} />

        <form onSubmit={handleSubmit}>
          <ProcessFormFields
            numero={numero}
            setNumero={setNumero}
            clienteIdSelecionado={clienteIdSelecionado}
            setClienteIdSelecionado={setClienteIdSelecionado}
            tipo={tipo}
            setTipo={setTipo}
            vara={vara}
            setVara={setVara}
            status={status}
            setStatus={setStatus}
            prazoDate={prazoDate}
            setPrazoDate={setPrazoDate}
            clientesDoUsuario={clientesDoUsuario}
            isLoadingClientes={isLoadingClientes}
            onShowClienteModal={() => setShowClienteModal(true)}
          />

          <ProcessFormActions isEdit={isEdit} onCancel={onCancel} />
        </form>
      </div>

      <ClienteModal
        open={showClienteModal}
        onOpenChange={setShowClienteModal}
        onSaveCliente={handleSaveCliente}
        isSaving={isSavingCliente}
      />
    </>
  );
};

export default ProcessForm;
