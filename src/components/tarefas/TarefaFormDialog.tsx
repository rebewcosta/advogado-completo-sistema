
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { TarefaFormData } from '@/hooks/useTarefas';

interface TarefaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<boolean>;
  tarefaParaForm: (Partial<TarefaFormData> & { id?: string }) | null;
  processos: any[];
  clientes: any[];
  isLoadingDropdownData: boolean;
  isSubmitting: boolean;
}

const TarefaFormDialog: React.FC<TarefaFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  tarefaParaForm,
  processos,
  clientes,
  isLoadingDropdownData,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_conclusao: '',
    prioridade: 'Média' as TarefaFormData['prioridade'],
    status: 'Pendente' as TarefaFormData['status'],
    processo_id: '',
    cliente_id: ''
  });

  useEffect(() => {
    if (tarefaParaForm) {
      setFormData({
        titulo: tarefaParaForm.titulo || '',
        descricao: tarefaParaForm.descricao || '',
        data_conclusao: tarefaParaForm.data_conclusao || '',
        prioridade: tarefaParaForm.prioridade || 'Média',
        status: tarefaParaForm.status || 'Pendente',
        processo_id: tarefaParaForm.processo_id || '',
        cliente_id: tarefaParaForm.cliente_id || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        data_conclusao: '',
        prioridade: 'Média',
        status: 'Pendente',
        processo_id: '',
        cliente_id: ''
      });
    }
  }, [tarefaParaForm, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
        <DialogTitle className="sr-only">
          {tarefaParaForm?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          {/* Header com gradiente azul */}
          <div className="p-6">
            <TooltipProvider>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">
                    {tarefaParaForm?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {tarefaParaForm?.id 
                          ? "Atualize as informações da tarefa. Campos com * são obrigatórios."
                          : "Cadastre uma nova tarefa preenchendo todos os campos obrigatórios."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
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
                    placeholder="Título da tarefa"
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status" className="text-gray-700 font-medium">Status *</Label>
                    <Select value={formData.status} onValueChange={(value: TarefaFormData['status']) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Concluída">Concluída</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prioridade" className="text-gray-700 font-medium">Prioridade *</Label>
                    <Select value={formData.prioridade} onValueChange={(value: TarefaFormData['prioridade']) => setFormData({...formData, prioridade: value})}>
                      <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="data_conclusao" className="text-gray-700 font-medium">Data de Conclusão</Label>
                  <Input
                    id="data_conclusao"
                    type="date"
                    value={formData.data_conclusao}
                    onChange={(e) => setFormData({...formData, data_conclusao: e.target.value})}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-gray-700 font-medium">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição detalhada da tarefa"
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
                  onClick={onClose}
                  className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {tarefaParaForm?.id ? 'Salvar Alterações' : 'Cadastrar Tarefa'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TarefaFormDialog;
