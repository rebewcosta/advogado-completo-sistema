
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeMembroFormData = {
  nome: string;
  email: string;
  nivel_permissao: string;
  ativo: boolean;
  telefone: string;
  cargo: string;
  data_ingresso: string;
  observacoes: string;
};

interface EquipeMembroFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  membro?: EquipeMembro | null;
}

const EquipeMembroForm: React.FC<EquipeMembroFormProps> = ({
  isOpen,
  onClose,
  onSave,
  membro
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<EquipeMembroFormData>({
    nome: '',
    email: '',
    nivel_permissao: 'Colaborador',
    ativo: true,
    telefone: '',
    cargo: '',
    data_ingresso: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  useEffect(() => {
    if (membro) {
      setFormData({
        nome: membro.nome,
        email: membro.email,
        nivel_permissao: membro.nivel_permissao,
        ativo: membro.ativo,
        telefone: membro.telefone || '',
        cargo: membro.cargo || '',
        data_ingresso: membro.data_ingresso || new Date().toISOString().split('T')[0],
        observacoes: membro.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        nivel_permissao: 'Colaborador',
        ativo: true,
        telefone: '',
        cargo: '',
        data_ingresso: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
    }
  }, [membro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const dadosParaSupabase = {
        user_id: user.id,
        nome: formData.nome,
        email: formData.email,
        nivel_permissao: formData.nivel_permissao,
        ativo: formData.ativo,
        telefone: formData.telefone || null,
        cargo: formData.cargo || null,
        data_ingresso: formData.data_ingresso || null,
        observacoes: formData.observacoes || null
      };

      if (membro) {
        const { error } = await supabase
          .from('equipe_membros')
          .update(dadosParaSupabase)
          .eq('id', membro.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Membro atualizado!",
          description: `${formData.nome} foi atualizado com sucesso.`
        });
      } else {
        const { error } = await supabase
          .from('equipe_membros')
          .insert(dadosParaSupabase);

        if (error) throw error;
        
        toast({
          title: "Membro adicionado!",
          description: `${formData.nome} foi adicionado à equipe.`
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar membro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-lawyer-dark border border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-white">
            {membro ? 'Editar Membro' : 'Adicionar Membro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Principais */}
          <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
            <Label className="text-sm font-semibold text-gray-100 mb-3 block">
              👤 Dados Principais
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-gray-100">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-100">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Contato e Cargo */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <Label className="text-sm font-semibold text-blue-100 mb-3 block">
              💼 Informações Profissionais
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone" className="text-blue-100">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="cargo" className="text-blue-100">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Permissões e Status */}
          <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
            <Label className="text-sm font-semibold text-gray-100 mb-3 block">
              🔐 Permissões e Status
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nivel_permissao" className="text-gray-100">Nível de Permissão</Label>
                <Select
                  value={formData.nivel_permissao}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_permissao: value }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_ingresso" className="text-gray-100">Data de Ingresso</Label>
                <Input
                  id="data_ingresso"
                  type="date"
                  value={formData.data_ingresso}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_ingresso: e.target.value }))}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo" className="text-gray-100">Membro ativo</Label>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <Label className="text-sm font-semibold text-blue-100 mb-3 block">
              📝 Observações
            </Label>
            <div>
              <Label htmlFor="observacoes" className="text-blue-100">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o membro..."
                rows={3}
                className="bg-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-blue-600">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-lawyer-primary hover:bg-lawyer-primary/90"
            >
              {isSubmitting ? 'Salvando...' : membro ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipeMembroForm;
