
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
      case 'Administrador': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0';
      case 'Supervisor': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0';
      case 'Colaborador': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Membros da Equipe
          </h2>
          <p className="text-gray-600 text-sm mt-1">Gerencie os membros da sua equipe com facilidade</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {filteredMembros.length === 0 ? (
        <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white hover:shadow-2xl transition-all duration-300 animate-fade-in">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Nenhum membro encontrado' : 'Sua equipe está esperando'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca' 
                : 'Adicione o primeiro membro da sua equipe para começar'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Membro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredMembros.map((membro, index) => (
            <Card 
              key={membro.id} 
              className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate text-white">{membro.nome}</CardTitle>
                    {membro.cargo && (
                      <p className="text-sm text-slate-200 truncate mt-1">{membro.cargo}</p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${getPermissionColor(membro.nivel_permissao)} shadow-lg`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {membro.nivel_permissao}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="truncate flex-1">{membro.email}</span>
                </div>
                
                {membro.telefone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <Phone className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="truncate flex-1">{membro.telefone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge 
                    variant={membro.ativo ? "default" : "secondary"} 
                    className={membro.ativo 
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" 
                      : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0"
                    }
                  >
                    {membro.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(membro)}
                      disabled={isSubmitting}
                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(membro)}
                      disabled={isSubmitting}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
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
