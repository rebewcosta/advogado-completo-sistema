
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityLog {
  id: string;
  user_id: string;
  data_execucao: string;
  status: string;
  publicacoes_encontradas: number;
  erros?: string;
  tempo_execucao_segundos?: number;
}

const SecurityMonitoring: React.FC = () => {
  const { isAdmin } = useUserRole();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) return;

    const fetchSecurityLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('logs_monitoramento')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching security logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityLogs();

    // Set up real-time subscription for new logs
    const subscription = supabase
      .channel('security-logs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'logs_monitoramento' },
        (payload) => {
          setLogs(prev => [payload.new as SecurityLog, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Acesso negado. Apenas administradores podem ver este conteúdo.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, hasErrors: boolean) => {
    if (hasErrors) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Com Erros</Badge>;
    }
    
    switch (status) {
      case 'concluido':
        return <Badge variant="default">Concluído</Badge>;
      case 'iniciado':
        return <Badge variant="secondary">Em Andamento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Monitoramento de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando logs de segurança...</div>
        ) : (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Nenhum log de monitoramento encontrado.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">
                        Monitoramento - User: {log.user_id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(log.data_execucao).toLocaleString()}
                        {log.tempo_execucao_segundos && (
                          <span>• {log.tempo_execucao_segundos}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {log.publicacoes_encontradas} publicações
                    </span>
                    {getStatusBadge(log.status, !!log.erros)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMonitoring;
