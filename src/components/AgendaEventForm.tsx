
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
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
import { X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgendaEvent {
  id?: string;
  titulo: string;
  descricao_evento: string;
  data_hora_inicio: Date;
  duracao_minutos: number;
  local_evento: string;
  cliente_associado_id?: string;
  processo_associado_id?: string;
  prioridade: 'baixa' | 'média' | 'alta';
  tipo_evento: string;
  status_evento: string;
}

interface AgendaEventFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (eventData: any) => Promise<boolean>;
  initialEventData?: AgendaEvent | null;
  clientes: any[];
  processos: any[];
}

const AgendaEventForm: React.FC<AgendaEventFormProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  initialEventData,
  clientes,
  processos
}) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao_evento: '',
    data_hora_inicio: '',
    duracao_minutos: 60,
    local_evento: '',
    cliente_associado_id: '',
    processo_associado_id: '',
    prioridade: 'média' as 'baixa' | 'média' | 'alta',
    tipo_evento: 'reuniao',
    status_evento: 'agendado'
  });

  useEffect(() => {
    if (initialEventData) {
      setFormData({
        titulo: initialEventData.titulo || '',
        descricao_evento: initialEventData.descricao_evento || '',
        data_hora_inicio: initialEventData.data_hora_inicio 
          ? new Date(initialEventData.data_hora_inicio).toISOString().slice(0, 16)
          : '',
        duracao_minutos: initialEventData.duracao_minutos || 60,
        local_evento: initialEventData.local_evento || '',
        cliente_associado_id: initialEventData.cliente_associado_id || '',
        processo_associado_id: initialEventData.processo_associado_id || '',
        prioridade: initialEventData.prioridade || 'média',
        tipo_evento: initialEventData.tipo_evento || 'reuniao',
        status_evento: initialEventData.status_evento || 'agendado'
      });
    } else {
      setFormData({
        titulo: '',
        descricao_evento: '',
        data_hora_inicio: '',
        duracao_minutos: 60,
        local_evento: '',
        cliente_associado_id: '',
        processo_associado_id: '',
        prioridade: 'média',
        tipo_evento: 'reuniao',
        status_evento: 'agendado'
      });
    }
  }, [initialEventData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.titulo.trim()) {
      alert('Por favor, preencha o título do evento.');
      return;
    }
    
    if (!formData.data_hora_inicio) {
      alert('Por favor, selecione a data e hora do evento.');
      return;
    }

    // Prepara os dados para envio, garantindo que campos vazios sejam null
    const eventDataToSave = {
      titulo: formData.titulo.trim(),
      descricao_evento: formData.descricao_evento.trim() || '',
      data_hora_inicio: new Date(formData.data_hora_inicio),
      duracao_minutos: formData.duracao_minutos,
      local_evento: formData.local_evento.trim() || '',
      cliente_associado_id: formData.cliente_associado_id || null,
      processo_associado_id: formData.processo_associado_id || null,
      prioridade: formData.prioridade,
      tipo_evento: formData.tipo_evento,
      status_evento: formData.status_evento
    };

    const success = await onSave(eventDataToSave);
    if (success) {
      onOpenChange(false);
    }
  };

  
  // Mobile full-screen dialog
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-white"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100dvh',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {initialEventData ? 'Editar Evento' : 'Novo Evento'}
                </h2>
                <button onClick={() => onOpenChange(false)} className="text-white">
                  ✕
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50 p-4"
              style={{
                height: 'calc(100dvh - 140px)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="titulo" className="text-gray-700 font-medium">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Título do evento"
                    className="mt-2 h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data_hora_inicio" className="text-gray-700 font-medium">Data/Hora *</Label>
                  <Input
                    id="data_hora_inicio"
                    type="datetime-local"
                    value={formData.data_hora_inicio}
                    onChange={(e) => setFormData({...formData, data_hora_inicio: e.target.value})}
                    className="mt-2 h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="local_evento" className="text-gray-700 font-medium">Local</Label>
                  <Input
                    id="local_evento"
                    value={formData.local_evento}
                    onChange={(e) => setFormData({...formData, local_evento: e.target.value})}
                    placeholder="Local do evento"
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_evento" className="text-gray-700 font-medium">Descrição</Label>
                  <Textarea
                    id="descricao_evento"
                    value={formData.descricao_evento}
                    onChange={(e) => setFormData({...formData, descricao_evento: e.target.value})}
                    placeholder="Descrição do evento"
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {initialEventData ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl"
        style={{
          touchAction: 'manipulation',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          {/* Header com gradiente azul */}
          <div className="p-6">
            <TooltipProvider>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">
                    {initialEventData ? 'Editar Evento' : 'Novo Evento'}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {initialEventData 
                          ? "Atualize as informações do evento. Campos com * são obrigatórios."
                          : "Cadastre um novo evento preenchendo todos os campos obrigatórios."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
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
                <div>
                  <Label htmlFor="titulo" className="text-gray-700 font-medium">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Título do evento"
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tipo_evento" className="text-gray-700 font-medium">Tipo *</Label>
                    <Select value={formData.tipo_evento} onValueChange={(value) => setFormData({...formData, tipo_evento: value})}>
                      <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="audiencia">Audiência</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="prazo">Prazo</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status_evento" className="text-gray-700 font-medium">Status *</Label>
                    <Select value={formData.status_evento} onValueChange={(value) => setFormData({...formData, status_evento: value})}>
                      <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="realizado">Realizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="remarcado">Remarcado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="data_hora_inicio" className="text-gray-700 font-medium">Data/Hora de Início *</Label>
                    <Input
                      id="data_hora_inicio"
                      type="datetime-local"
                      value={formData.data_hora_inicio}
                      onChange={(e) => setFormData({...formData, data_hora_inicio: e.target.value})}
                      className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duracao_minutos" className="text-gray-700 font-medium">Duração (minutos)</Label>
                    <Input
                      id="duracao_minutos"
                      type="number"
                      value={formData.duracao_minutos}
                      onChange={(e) => setFormData({...formData, duracao_minutos: parseInt(e.target.value) || 60})}
                      className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="local_evento" className="text-gray-700 font-medium">Local do Evento</Label>
                  <Input
                    id="local_evento"
                    value={formData.local_evento}
                    onChange={(e) => setFormData({...formData, local_evento: e.target.value})}
                    placeholder="Local onde ocorrerá o evento"
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao_evento" className="text-gray-700 font-medium">Descrição</Label>
                  <Textarea
                    id="descricao_evento"
                    value={formData.descricao_evento}
                    onChange={(e) => setFormData({...formData, descricao_evento: e.target.value})}
                    placeholder="Descrição detalhada do evento"
                    rows={4}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Footer com gradiente azul e botões */}
            <div className="p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {initialEventData ? 'Salvar Alterações' : 'Cadastrar Evento'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaEventForm;
