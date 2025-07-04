
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, User, Clock } from 'lucide-react';

interface UserProfile {
  id: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  oab: string | null;
  is_online: boolean;
  last_seen: string;
}

interface UserMonitoringCardProps {
  user: UserProfile;
}

const UserMonitoringCard = ({ user }: UserMonitoringCardProps) => {
  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {user.is_online ? (
              <UserCheck className="h-4 w-4 text-green-500" />
            ) : (
              <User className="h-4 w-4 text-gray-400" />
            )}
            {user.nome_completo || 'Nome não informado'}
          </CardTitle>
          <Badge 
            variant={user.is_online ? "default" : "secondary"}
            className={user.is_online ? "bg-green-100 text-green-800" : ""}
          >
            {user.is_online ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <span className="text-gray-600">{user.email || 'N/A'}</span>
          </div>
          
          {user.oab && (
            <div className="flex items-center gap-2">
              <span className="font-medium">OAB:</span>
              <span className="text-gray-600">{user.oab}</span>
            </div>
          )}
          
          {user.telefone && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Telefone:</span>
              <span className="text-gray-600">{user.telefone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Última atividade: {formatLastSeen(user.last_seen)}</span>
          </div>
          
          <div className="text-xs text-gray-400 pt-1">
            ID: {user.id.substring(0, 8)}...
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserMonitoringCard;
