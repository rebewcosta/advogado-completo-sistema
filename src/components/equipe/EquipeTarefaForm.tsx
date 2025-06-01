
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

type EquipeTarefaFormData = {
  titulo: string;
  descricao_detalhada: string;
  responsavel_id: string;
  data_vencimento: string;
  prioridade: string;
  status: string;
  tempo_estimado_horas: string;
  tempo_gasto_horas: string;
  observacoes_conclusao: string;
};

interface EquipeTarefaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tarefa?: EquipeTarefa | null;
  membros: EquipeMembro[];
}

const EquipeTarefaForm: React.FC<EquipeTarefaFormProps> = ({
  isOpen,
  onClose,
  onSave,
  tarefa,
  membros
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<EquipeTarefaFormData>({
    titulo: '',
    descricao_detalhada: '',
    responsavel_id: '',
    data_vencimento: '',
    prioridade: 'Média',
    status: 'Pendente',
    tempo_estimado_horas: '',
    tempo_gasto_horas: '',
    observacoes_conclusao: ''
  });

  const membrosAtivos = membros.filter(m => m.ativo);

  useEffect(() => {
    if (tarefa) {
      setFormData({
        titulo: tarefa.titulo,
        descricao_detalhada: tarefa.descricao_detalhada || '',
        responsavel_id: tarefa.responsavel_id || '',
        data_vencimento: tarefa.data_vencimento || '',
        prioridade: tarefa.prioridade,
        status: tarefa.status,
        tempo_estimado_horas: tarefa.tempo_estimado_horas?.toString() || '',
        tempo_gasto_horas: tarefa.tempo_gasto_horas?.toString() || '',
        observacoes_conclusao: tarefa.observacoes_conclusao || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao_detalhada: '',
        responsavel_id: '',
        data_vencimento: '',
        prioridade: 'Média',
        status: 'Pendente',
        tempo_estimado_horas: '',
        tempo_gasto_horas: '',
        observacoes_conclusao: ''
      });
    }
  }, [tarefa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const dadosParaSupabase = {
        user_id: user.id,
        titulo: formData.titulo,
        descricao_detalhada: formData.descricao_detalhada || null,
        responsavel_id: formData.responsavel_id || null,
        data_vencimento: formData.data_vencimento || null,
        prioridade: formData.prioridade,
        status: formData.status,
        tempo_estimado_horas: formData.tempo_estimado_horas ? parseInt(formData.tempo_estimado_horas) : null,
        tempo_gasto_horas: formData.tempo_gasto_horas ? parseInt(formData.tempo_gasto_horas) : null,
        observacoes_conclusao: formData.observacoes_conclusao || null,
        data_conclusao: formData.status === 'Concluída' ? new Date().toISOString() : null
      };

      if (tarefa) {
        const { error } = await supabase
          .from('equipe_tarefas')
          .update(dadosParaSupabase)
          .eq('id', tarefa.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Tarefa atualizada!",
          description: `A tarefa "${formData.titulo}" foi atualizada.`
        });
      } else {
        const { error } = await supabase
          .from('equipe_tarefas')
          .insert(dadosParaSupabase);

        if (error) throw error;
        
        toast({
          title: "Tarefa criada!",
          description: `A tarefa "${formData.titulo}" foi delegada.`
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar tarefa",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título da Tarefa *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao_detalhada">Descrição Detalhada</Label>
            <Textarea
              id="descricao_detalhada"
              value={formData.descricao_detalhada}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao_detalhada: e.target.value }))}
              placeholder="Descreva a tarefa detalhadamente..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel_id">Responsável</Label>
              <Select
                value={formData.responsavel_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {membrosAtivos.map((membro) => (
                    <SelectItem key={membro.id} value={membro.id}>
                      {membro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tempo_estimado_horas">Tempo Estimado (horas)</Label>
              <Input
                id="tempo_estimado_horas"
                type="number"
                min="0"
                value={formData.tempo_estimado_horas}
                onChange={(e) => setFormData(prev => ({ ...prev, tempo_estimado_horas: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="tempo_gasto_horas">Tempo Gasto (horas)</Label>
              <Input
                id="tempo_gasto_horas"
                type="number"
                min="0"
                value={formData.tempo_gasto_horas}
                onChange={(e) => setFormData(prev => ({ ...prev, tempo_gasto_horas: e.target.value }))}
              />
            </div>
          </div>

          {formData.status === 'Concluída' && (
            <div>
              <Label htmlFor="observacoes_conclusao">Observações de Conclusão</Label>
              <Textarea
                id="observacoes_conclusao"
                value={formData.observacoes_conclusao}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes_conclusao: e.target.value }))}
                placeholder="Observações sobre a conclusão da tarefa..."
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-lawyer-primary hover:bg-lawyer-primary/90"
            >
              {isSubmitting ? 'Salvando...' : tarefa ? 'Atualizar' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipeTarefaForm;
