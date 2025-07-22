
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEquipeTarefaSave } from '@/hooks/useEquipeTarefaSave';

interface Tarefa {
  id?: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: Date | undefined;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'em_andamento' | 'concluida';
}

interface EquipeTarefaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tarefa?: Tarefa | null;
}

const EquipeTarefaForm: React.FC<EquipeTarefaFormProps> = ({
  isOpen,
  onClose,
  onSave,
  tarefa
}) => {
  const isEdit = !!tarefa;
  const { saveTarefa, isSubmitting } = useEquipeTarefaSave();
  const [formData, setFormData] = useState<Omit<Tarefa, 'id'>>({
    titulo: '',
    descricao: '',
    responsavel: '',
    prazo: undefined,
    prioridade: 'media',
    status: 'pendente'
  });

  useEffect(() => {
    if (isEdit && tarefa) {
      setFormData({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavel: tarefa.responsavel,
        prazo: tarefa.prazo,
        prioridade: tarefa.prioridade,
        status: tarefa.status
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        responsavel: '',
        prazo: undefined,
        prioridade: 'media',
        status: 'pendente'
      });
    }
  }, [isEdit, tarefa, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Enviando formulário de tarefa:', formData);
    
    const success = await saveTarefa(formData, tarefa?.id);
    if (success) {
      onSave(); // Chama refresh
      onClose();
    }
  };

  const handleChange = (field: keyof Omit<Tarefa, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-lawyer-dark border border-blue-600">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Tarefa da Equipe' : 'Nova Tarefa da Equipe'}
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            {isEdit 
              ? "Atualize as informações da tarefa."
              : "Crie uma nova tarefa para a equipe com prazo e responsável definidos."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Informações da Tarefa */}
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <Label className="text-sm font-semibold text-gray-100 mb-3 block">
                📋 Informações da Tarefa
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo" className="text-gray-100">
                    Título <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    placeholder="Título da tarefa"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao" className="text-gray-100">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    placeholder="Descreva os detalhes da tarefa"
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Atribuição e Prazo */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <Label className="text-sm font-semibold text-blue-100 mb-3 block">
                👤 Atribuição e Prazo
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="responsavel" className="text-blue-100">
                    Responsável <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleChange('responsavel', e.target.value)}
                    placeholder="Nome do responsável"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-blue-100">Prazo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !formData.prazo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.prazo ? format(formData.prazo, "dd/MM/yyyy") : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.prazo}
                        onSelect={(date) => handleChange('prazo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <Label className="text-sm font-semibold text-gray-100 mb-3 block">
                ⚡ Status e Prioridade
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prioridade" className="text-gray-100">
                    Prioridade
                  </Label>
                  <Select 
                    value={formData.prioridade} 
                    onValueChange={(value: 'baixa' | 'media' | 'alta') => handleChange('prioridade', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-gray-100">
                    Status
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'pendente' | 'em_andamento' | 'concluida') => handleChange('status', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t border-blue-600 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Tarefa')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipeTarefaForm;
