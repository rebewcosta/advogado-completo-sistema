// src/components/AgendaEventForm.tsx
import React, { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { CalendarIcon as CalendarIconLucide, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';

export type EventoAgendaFormData = {
  titulo: string;
  descricao_evento?: string | null;
  data_hora_inicio: Date;
  duracao_minutos: number;
  local_evento?: string | null;
  cliente_associado_id?: string | null;
  processo_associado_id?: string | null;
  prioridade: 'baixa' | 'média' | 'alta';
  tipo_evento?: string | null;
  status_evento?: string | null;
};
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

type AgendaEventFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: EventoAgendaFormData) => void;
  initialEventData?: Partial<EventoAgendaFormData> & { id?: string };
  clientes: ClienteParaSelect[];
  processos: ProcessoParaSelect[];
  isLoadingDropdownData?: boolean;
};

export const AgendaEventForm = ({
  isOpen,
  onOpenChange,
  onSave,
  initialEventData,
  clientes,
  processos,
  isLoadingDropdownData = false,
}: AgendaEventFormProps) => {

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date());
  const [hora, setHora] = useState('09:00');
  const [duracao, setDuracao] = useState('60');
  const [local, setLocal] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [processoId, setProcessoId] = useState<string | null>(null);
  const [prioridade, setPrioridade] = useState<'baixa' | 'média' | 'alta'>('média');
  const [tipoEvento, setTipoEvento] = useState('');
  const [statusEvento, setStatusEvento] = useState('Agendado');

  useEffect(() => {
    if (isOpen && initialEventData) {
      setTitulo(initialEventData.titulo || '');
      setDescricao(initialEventData.descricao_evento || '');
      const dataHora = initialEventData.data_hora_inicio ? new Date(initialEventData.data_hora_inicio) : new Date();
      setDataSelecionada(dataHora);
      setHora(format(dataHora, 'HH:mm'));
      setDuracao(String(initialEventData.duracao_minutos || 60));
      setLocal(initialEventData.local_evento || '');
      setClienteId(initialEventData.cliente_associado_id || null);
      setProcessoId(initialEventData.processo_associado_id || null);
      setPrioridade(initialEventData.prioridade || 'média');
      setTipoEvento(initialEventData.tipo_evento || '');
      setStatusEvento(initialEventData.status_evento || 'Agendado');
    } else if (isOpen) {
        const dataInicialForm = initialEventData?.data_hora_inicio || new Date();
        setDataSelecionada(dataInicialForm);
        setHora(format(dataInicialForm, 'HH:mm'));
        setTitulo('');
        setDescricao('');
        setDuracao('60');
        setLocal('');
        setClienteId(null);
        setProcessoId(null);
        setPrioridade('média');
        setTipoEvento('Reunião');
        setStatusEvento('Agendado');
    }
  }, [initialEventData, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const form = document.getElementById("agenda-event-form-actual") as HTMLFormElement | null;
    if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
    }
    if (!titulo || !dataSelecionada || !hora || !duracao) {
      alert("Por favor, preencha os campos obrigatórios: Título, Data, Hora e Duração.");
      return;
    }

    const [h, m] = hora.split(':').map(Number);
    const dataHoraInicio = new Date(dataSelecionada);
    dataHoraInicio.setHours(h, m, 0, 0);

    onSave({
      titulo,
      descricao_evento: descricao,
      data_hora_inicio: dataHoraInicio,
      duracao_minutos: parseInt(duracao, 10),
      local_evento: local,
      cliente_associado_id: clienteId,
      processo_associado_id: processoId,
      prioridade,
      tipo_evento: tipoEvento,
      status_evento: statusEvento,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0"> {/* flex-shrink-0 para não encolher */}
          <DialogTitle>{initialEventData?.id ? 'Editar Compromisso' : 'Adicionar Compromisso'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do compromisso na agenda.
          </DialogDescription>
        </DialogHeader>

        {/* Área de scroll para o conteúdo do formulário */}
        <div className="flex-grow overflow-y-auto p-6">
          <form id="agenda-event-form-actual" onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div className="grid gap-1.5"> {/* Usando gap-1.5 para menos espaço vertical */}
              <Label htmlFor="titulo_form_agenda_v2">Título <span className="text-red-500">*</span></Label>
              <Input id="titulo_form_agenda_v2" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Audiência, Reunião" required />
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="data_form_agenda_v2">Data <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="data_form_agenda_v2" variant="outline" className={cn("w-full justify-start text-left font-normal", !dataSelecionada && "text-muted-foreground")}>
                      <CalendarIconLucide className="mr-2 h-4 w-4" />
                      {dataSelecionada ? format(dataSelecionada, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ShadcnCalendar mode="single" selected={dataSelecionada} onSelect={setDataSelecionada} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="hora_form_agenda_v2">Horário <span className="text-red-500">*</span></Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input id="hora_form_agenda_v2" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required className="w-full" />
                </div>
              </div>
            </div>

            {/* Duração e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="duracao_form_agenda_v2">Duração (minutos) <span className="text-red-500">*</span></Label>
                <Input id="duracao_form_agenda_v2" type="number" min="5" step="5" value={duracao} onChange={(e) => setDuracao(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="prioridade_form_agenda_v2">Prioridade <span className="text-red-500">*</span></Label>
                <Select value={prioridade} onValueChange={(value: 'baixa' | 'média' | 'alta') => setPrioridade(value)}>
                  <SelectTrigger id="prioridade_form_agenda_v2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="média">Média</SelectItem><SelectItem value="alta">Alta</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de Evento e Status do Evento */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="tipo_evento_form_agenda_v2">Tipo de Evento</Label>
                    <Input id="tipo_evento_form_agenda_v2" value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} placeholder="Ex: Audiência, Prazo"/>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="status_evento_form_agenda_v2">Status do Evento</Label>
                    <Input id="status_evento_form_agenda_v2" value={statusEvento} onChange={(e) => setStatusEvento(e.target.value)} placeholder="Ex: Agendado, Concluído"/>
                </div>
            </div>

            {/* Descrição */}
            <div className="grid gap-1.5">
              <Label htmlFor="descricao_form_agenda_v2">Descrição</Label>
              <Textarea
                id="descricao_form_agenda_v2"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes adicionais sobre o compromisso..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Local */}
            <div className="grid gap-1.5">
              <Label htmlFor="local_form_agenda_v2">Local</Label>
              <Input id="local_form_agenda_v2" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Fórum, Escritório" />
            </div>

            {/* Cliente Associado */}
            <div className="grid gap-1.5">
              <Label htmlFor="cliente_id_form_agenda_select_v2">Cliente Associado</Label>
              <Select value={clienteId || ""} onValueChange={(value) => setClienteId(value === "" ? null : value)} disabled={isLoadingDropdownData}>
                <SelectTrigger id="cliente_id_form_agenda_select_v2"><SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Nenhum"} /></SelectTrigger>
                <SelectContent>
                  {isLoadingDropdownData && <SelectItem value="loading_clients_v2" disabled>Carregando...</SelectItem>}
                  {!isLoadingDropdownData && clientes.length === 0 && <SelectItem value="no_clients_v2" disabled>Nenhum cliente</SelectItem>}
                  {clientes.map(c => <SelectItem key={c.id + '_v2_client'} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Processo Associado */}
            <div className="grid gap-1.5">
              <Label htmlFor="processo_id_form_agenda_select_v2">Processo Associado</Label>
              <Select value={processoId || ""} onValueChange={(value) => setProcessoId(value === "" ? null : value)} disabled={isLoadingDropdownData}>
                <SelectTrigger id="processo_id_form_agenda_select_v2"><SelectValue placeholder={isLoadingDropdownData ? "Carregando..." : "Nenhum"} /></SelectTrigger>
                <SelectContent>
                  {isLoadingDropdownData && <SelectItem value="loading_processos_v2" disabled>Carregando...</SelectItem>}
                  {!isLoadingDropdownData && processos.length === 0 && <SelectItem value="no_processos_v2" disabled>Nenhum processo</SelectItem>}
                  {processos.map(p => <SelectItem key={p.id + '_v2_process'} value={p.id}>{p.numero_processo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0"> {/* flex-shrink-0 para não encolher */}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" className="btn-primary" onClick={() => handleSubmit()}>
            {initialEventData?.id ? 'Salvar Alterações' : 'Criar Compromisso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};