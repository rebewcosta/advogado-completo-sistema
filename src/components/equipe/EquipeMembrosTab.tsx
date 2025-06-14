
import React, { useState } from 'react';
import { Plus, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EquipeMembroForm from './EquipeMembroForm';
import EquipeMembroCard from './EquipeMembroCard';
import { useEquipeMembros } from '@/hooks/useEquipeMembros';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];

interface Membro {
  id?: string;
  nome: string;
  email: string;
  cargo: string;
  telefone: string;
  nivel_acesso: 'admin' | 'editor' | 'visualizador';
  status: 'ativo' | 'inativo';
}

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
  const [showForm, setShowForm] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const { deleteMembro } = useEquipeMembros();

  // Convert EquipeMembro to Membro format
  const convertToMembroFormat = (equipeMembro: EquipeMembro): Membro => {
    return {
      id: equipeMembro.id,
      nome: equipeMembro.nome,
      email: equipeMembro.email || '',
      cargo: equipeMembro.cargo || '',
      telefone: equipeMembro.telefone || '',
      nivel_acesso: equipeMembro.nivel_permissao === 'Administrador' ? 'admin' : 
                   equipeMembro.nivel_permissao === 'Editor' ? 'editor' : 'visualizador',
      status: equipeMembro.ativo ? 'ativo' : 'inativo'
    };
  };

  const filteredMembros = membros.filter(membro =>
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (membro.email && membro.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (membro.cargo && membro.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (membro: EquipeMembro) => {
    setEditingMembro(convertToMembroFormat(membro));
    setShowForm(true);
  };

  const handleDelete = async (membro: EquipeMembro) => {
    await deleteMembro(membro, onRefresh);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMembro(null);
  };

  const handleFormSuccess = async (membroData: any): Promise<boolean> => {
    try {
      // Here would be the actual save logic
      handleCloseForm();
      onRefresh();
      return true;
    } catch (error) {
      console.error('Error saving member:', error);
      return false;
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Membros da Equipe
          </h2>
          <p className="text-gray-600 text-sm mt-1">Gerencie os membros da sua equipe com facilidade</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {filteredMembros.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in">
          <CardContent className="py-12 text-center">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Nenhum membro encontrado' : 'Monte sua equipe'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Adicione membros para começar a gerenciar sua equipe'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Membro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredMembros.map((membro, index) => (
            <div 
              key={membro.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <EquipeMembroCard
                membro={membro}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSubmitting={isSubmitting}
              />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EquipeMembroForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSave={handleFormSuccess}
          membro={editingMembro}
        />
      )}
    </>
  );
};

export default EquipeMembrosTab;
