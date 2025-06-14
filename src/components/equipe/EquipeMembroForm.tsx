
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import EquipeMembroFormHeader from './EquipeMembroFormHeader';

interface Membro {
  id?: string;
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  nivel_acesso: 'admin' | 'editor' | 'visualizador';
  status: 'ativo' | 'inativo';
}

interface EquipeMembroFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membro: Omit<Membro, 'id'>) => void;
  membro?: Membro | null;
  isEdit?: boolean;
}

const EquipeMembroForm: React.FC<EquipeMembroFormProps> = ({
  isOpen,
  onClose,
  onSave,
  membro,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Omit<Membro, 'id'>>({
    nome: '',
    email: '',
    cargo: '',
    telefone: '',
    nivel_acesso: 'visualizador',
    status: 'ativo'
  });

  useEffect(() => {
    if (isEdit && membro) {
      setFormData({
        nome: membro.nome,
        email: membro.email,
        cargo: membro.cargo,
        telefone: membro.telefone,
        nivel_acesso: membro.nivel_acesso,
        status: membro.status
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        cargo: '',
        telefone: '',
        nivel_acesso: 'visualizador',
        status: 'ativo'
      });
    }
  }, [isEdit, membro, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Omit<Membro, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-lawyer-dark border border-blue-600">
        <EquipeMembroFormHeader isEdit={isEdit} />
        <DialogDescription className="text-blue-200">
          {isEdit 
            ? "Atualize as informações do membro da equipe."
            : "Adicione um novo membro à sua equipe com as permissões adequadas."}
        </DialogDescription>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Informações Pessoais */}
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <Label className="text-sm font-semibold text-gray-100 mb-3 block">
                👤 Informações Pessoais
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome" className="text-gray-100">
                    Nome completo <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    placeholder="Nome do membro"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-100">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone" className="text-gray-100">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Informações Profissionais */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <Label className="text-sm font-semibold text-blue-100 mb-3 block">
                💼 Informações Profissionais
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cargo" className="text-blue-100">
                    Cargo <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleChange('cargo', e.target.value)}
                    placeholder="Ex: Advogado Júnior, Secretária, Estagiário"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel_acesso" className="text-blue-100">
                    Nível de acesso <span className="text-red-400">*</span>
                  </Label>
                  <Select 
                    value={formData.nivel_acesso} 
                    onValueChange={(value: 'admin' | 'editor' | 'visualizador') => handleChange('nivel_acesso', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-blue-100">
                    Status
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'ativo' | 'inativo') => handleChange('status', value)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t border-blue-600 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEdit ? 'Salvar Alterações' : 'Adicionar Membro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipeMembroForm;
