
import React, { useState, useEffect } from 'react';
import { useAvisos } from '@/hooks/useAvisos';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { AvisoAdministrativo } from '@/types/avisos';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PainelAdministrativo = () => {
  const { avisos, fetchTodosAvisos, criarAviso, atualizarAviso, deletarAviso } = useAvisos();
  const { userRole } = useUserRole();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [avisoEditando, setAvisoEditando] = useState<AvisoAdministrativo | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'info' as 'info' | 'warning' | 'error' | 'success',
    prioridade: 'normal' as 'baixa' | 'normal' | 'alta' | 'critica',
    ativo: true,
    data_inicio: new Date().toISOString(),
    data_fim: ''
  });

  useEffect(() => {
    if (userRole === 'admin') {
      fetchTodosAvisos();
    }
  }, [userRole, fetchTodosAvisos]);

  if (userRole !== 'admin') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dadosAviso = {
        titulo: formData.titulo,
        mensagem: formData.mensagem,
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        ativo: formData.ativo,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim ? new Date(formData.data_fim).toISOString() : null
      };

      if (avisoEditando) {
        await atualizarAviso(avisoEditando.id, dadosAviso);
      } else {
        await criarAviso(dadosAviso);
      }

      setDialogAberto(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      mensagem: '',
      tipo: 'info',
      prioridade: 'normal',
      ativo: true,
      data_inicio: new Date().toISOString(),
      data_fim: ''
    });
    setAvisoEditando(null);
  };

  const handleEdit = (aviso: AvisoAdministrativo) => {
    setAvisoEditando(aviso);
    setFormData({
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      prioridade: aviso.prioridade,
      ativo: aviso.ativo,
      data_inicio: aviso.data_inicio,
      data_fim: aviso.data_fim ? new Date(aviso.data_fim).toISOString().split('T')[0] : ''
    });
    setDialogAberto(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este aviso?')) {
      await deletarAviso(id);
    }
  };

  const toggleStatus = async (aviso: AvisoAdministrativo) => {
    await atualizarAviso(aviso.id, { ativo: !aviso.ativo });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Painel de Avisos Administrativos</CardTitle>
            <CardDescription>
              Gerencie avisos e notificações para todos os usuários do sistema
            </CardDescription>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {avisoEditando ? 'Editar Aviso' : 'Criar Novo Aviso'}
                </DialogTitle>
                <DialogDescription>
                  {avisoEditando ? 'Edite as informações do aviso' : 'Crie um novo aviso para todos os usuários'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'info' | 'warning' | 'error' | 'success') => setFormData(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Informação</SelectItem>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                        <SelectItem value="success">Sucesso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(value: 'baixa' | 'normal' | 'alta' | 'critica') => setFormData(prev => ({ ...prev, prioridade: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data de Expiração (opcional)</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Aviso ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {avisoEditando ? 'Salvar Alterações' : 'Criar Aviso'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogAberto(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {avisos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum aviso criado ainda.
            </p>
          ) : (
            avisos.map((aviso) => (
              <Card key={aviso.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{aviso.titulo}</h3>
                      <Badge variant={aviso.ativo ? 'default' : 'secondary'}>
                        {aviso.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">{aviso.tipo}</Badge>
                      <Badge variant="outline">{aviso.prioridade}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{aviso.mensagem}</p>
                    <p className="text-xs text-gray-400">
                      Criado {formatDistanceToNow(new Date(aviso.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                      {aviso.data_fim && (
                        <span> • Expira em {new Date(aviso.data_fim).toLocaleDateString('pt-BR')}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(aviso)}
                    >
                      {aviso.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(aviso)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(aviso.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PainelAdministrativo;
