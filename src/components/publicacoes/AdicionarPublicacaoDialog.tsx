
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

const estados = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, 
  { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' }, { uf: 'MG', nome: 'Minas Gerais' }, 
  { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' }, { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
];

interface AdicionarPublicacaoDialogProps {
  onPublicacaoAdicionada: () => void;
}

const AdicionarPublicacaoDialog: React.FC<AdicionarPublicacaoDialogProps> = ({ onPublicacaoAdicionada }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_advogado: '',
    titulo_publicacao: '',
    conteudo_publicacao: '',
    data_publicacao: new Date().toISOString().split('T')[0],
    diario_oficial: '',
    estado: '',
    comarca: '',
    numero_processo: '',
    tipo_publicacao: '',
    url_publicacao: '',
    segredo_justica: false,
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .insert({
          user_id: user.id,
          ...formData,
          lida: false,
          importante: false
        });

      if (error) throw error;
      
      toast({
        title: "Publicação adicionada",
        description: "A publicação foi adicionada com sucesso"
      });
      
      // Reset form
      setFormData({
        nome_advogado: '',
        titulo_publicacao: '',
        conteudo_publicacao: '',
        data_publicacao: new Date().toISOString().split('T')[0],
        diario_oficial: '',
        estado: '',
        comarca: '',
        numero_processo: '',
        tipo_publicacao: '',
        url_publicacao: '',
        segredo_justica: false,
        observacoes: ''
      });
      
      setOpen(false);
      onPublicacaoAdicionada();
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar publicação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Publicação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Publicação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome_advogado">Nome do Advogado *</Label>
              <Input
                id="nome_advogado"
                value={formData.nome_advogado}
                onChange={(e) => setFormData({...formData, nome_advogado: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="data_publicacao">Data da Publicação *</Label>
              <Input
                id="data_publicacao"
                type="date"
                value={formData.data_publicacao}
                onChange={(e) => setFormData({...formData, data_publicacao: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="titulo_publicacao">Título da Publicação *</Label>
            <Input
              id="titulo_publicacao"
              value={formData.titulo_publicacao}
              onChange={(e) => setFormData({...formData, titulo_publicacao: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="conteudo_publicacao">Conteúdo da Publicação *</Label>
            <Textarea
              id="conteudo_publicacao"
              value={formData.conteudo_publicacao}
              onChange={(e) => setFormData({...formData, conteudo_publicacao: e.target.value})}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diario_oficial">Diário Oficial *</Label>
              <Input
                id="diario_oficial"
                value={formData.diario_oficial}
                onChange={(e) => setFormData({...formData, diario_oficial: e.target.value})}
                placeholder="Ex: Diário da Justiça - SP"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({...formData, estado: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map(estado => (
                    <SelectItem key={estado.uf} value={estado.uf}>
                      {estado.uf} - {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comarca">Comarca</Label>
              <Input
                id="comarca"
                value={formData.comarca}
                onChange={(e) => setFormData({...formData, comarca: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="tipo_publicacao">Tipo de Publicação</Label>
              <Select value={formData.tipo_publicacao} onValueChange={(value) => setFormData({...formData, tipo_publicacao: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Citação">Citação</SelectItem>
                  <SelectItem value="Intimação">Intimação</SelectItem>
                  <SelectItem value="Sentença">Sentença</SelectItem>
                  <SelectItem value="Despacho">Despacho</SelectItem>
                  <SelectItem value="Decisão">Decisão</SelectItem>
                  <SelectItem value="Edital">Edital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_processo">Número do Processo</Label>
              <Input
                id="numero_processo"
                value={formData.numero_processo}
                onChange={(e) => setFormData({...formData, numero_processo: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="url_publicacao">URL da Publicação</Label>
              <Input
                id="url_publicacao"
                type="url"
                value={formData.url_publicacao}
                onChange={(e) => setFormData({...formData, url_publicacao: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="segredo_justica"
              checked={formData.segredo_justica}
              onCheckedChange={(checked) => setFormData({...formData, segredo_justica: checked})}
            />
            <Label htmlFor="segredo_justica">Processo em segredo de justiça</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar Publicação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarPublicacaoDialog;
