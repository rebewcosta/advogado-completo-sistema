
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Phone, User, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EquipeMembroForm from './EquipeMembroForm';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];

interface EquipeMembrosTabProps {
  membros: EquipeMembro[];
  searchTerm: string;
  isSubmitting: boolean;
  onRefresh: () => void;
  setIsSubmitting: (loading: boolean) => void;
}

const EquipeMembrosTab: React.FC<EquipeMembrosTabProps> = ({
  membros,
  searchTerm,
  isSubmitting,
  onRefresh,
  setIsSubmitting
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [membroEditando, setMembroEditando] = useState<EquipeMembro | null>(null);

  const filteredMembros = membros.filter(membro =>
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (membro.cargo && membro.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (membro: EquipeMembro) => {
    setMembroEditando(membro);
    setIsFormOpen(true);
  };

  const handleDelete = async (membro: EquipeMembro) => {
    if (!user || isSubmitting) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${membro.nome}?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('equipe_membros')
          .delete()
          .eq('id', membro.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Membro excluído!",
          description: `${membro.nome} foi removido da equipe.`
        });
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir membro",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMembroEditando(null);
  };

  const getPermissionColor = (nivel: string) => {
    switch (nivel) {
      case 'Administrador': return 'bg-red-100 text-red-700 border-red-200';
      case 'Supervisor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Colaborador': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Convert database type to form interface when editing
  const convertToFormInterface = (membro: EquipeMembro) => {
    return {
      id: membro.id,
      nome: membro.nome,
      email: membro.email,
      cargo: membro.cargo || '',
      telefone: membro.telefone || '',
      nivel_acesso: 'visualizador' as const, // Default mapping
      status: membro.ativo ? 'ativo' as const : 'inativo' as const
    };
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Membros da Equipe</h2>
          <p className="text-gray-600 text-sm">Gerencie os membros da sua equipe</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 bg-lawyer-primary hover:bg-lawyer-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {filteredMembros.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado ainda'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="mt-4 bg-lawyer-primary hover:bg-lawyer-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Membro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembros.map((membro) => (
            <Card key={membro.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{membro.nome}</CardTitle>
                    {membro.cargo && (
                      <p className="text-sm text-gray-600 truncate">{membro.cargo}</p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${getPermissionColor(membro.nivel_permissao)}`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {membro.nivel_permissao}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{membro.email}</span>
                </div>
                
                {membro.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{membro.telefone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={membro.ativo ? "default" : "secondary"}>
                    {membro.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(membro)}
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(membro)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <EquipeMembroForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={onRefresh}
          membro={membroEditando ? convertToFormInterface(membroEditando) : null}
        />
      )}
    </>
  );
};

export default EquipeMembrosTab;
