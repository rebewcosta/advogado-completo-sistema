
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, User, Shield, UserCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];

interface EquipeMembroCardProps {
  membro: EquipeMembro;
  onEdit: (membro: EquipeMembro) => void;
  onDelete: (membro: EquipeMembro) => void;
  isSubmitting: boolean;
}

const EquipeMembroCard: React.FC<EquipeMembroCardProps> = ({
  membro,
  onEdit,
  onDelete,
  isSubmitting
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0';
      case 'Inativo': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0';
      case 'Pendente': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    }
  };

  const getCargoColor = (cargo: string | null) => {
    if (!cargo) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    
    switch (cargo.toLowerCase()) {
      case 'supervisor': 
      case 'gerente': 
      case 'coordenador':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0';
      case 'colaborador':
      case 'assistente':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0';
      case 'estagiário':
      case 'trainee':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0';
      default: 
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0';
    }
  };

  const getCargoIcon = (cargo: string | null) => {
    if (!cargo) return <User className="h-4 w-4" />;
    
    switch (cargo.toLowerCase()) {
      case 'supervisor': 
      case 'gerente': 
      case 'coordenador':
        return <Shield className="h-4 w-4" />;
      default: 
        return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate text-white font-semibold">{membro.nome}</CardTitle>
            {membro.cargo && (
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  {getCargoIcon(membro.cargo)}
                </div>
                <span className="text-sm text-blue-100">{membro.cargo}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            {membro.cargo && (
              <Badge variant="outline" className={getCargoColor(membro.cargo)}>
                {membro.cargo}
              </Badge>
            )}
            <Badge variant="outline" className={getStatusColor(membro.status)}>
              {membro.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          {membro.email && (
            <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors">
              <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <span className="truncate text-sm">{membro.email}</span>
            </div>
          )}
          
          {membro.telefone && (
            <div className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors">
              <div className="p-2 bg-green-50 rounded-lg mr-3 group-hover:bg-green-100 transition-colors">
                <Phone className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm">{membro.telefone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Adicionado em {format(parseISO(membro.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(membro)}
              disabled={isSubmitting}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg p-2 h-auto"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(membro)}
              disabled={isSubmitting}
              className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg p-2 h-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipeMembroCard;
