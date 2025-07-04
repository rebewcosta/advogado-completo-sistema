
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';

interface ErrorLog {
  id: string;
  user_id: string | null;
  error_type: string;
  error_message: string;
  component_name: string | null;
  url: string | null;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  resolved: boolean;
}

interface ErrorLogsTableProps {
  errors: ErrorLog[];
  onMarkResolved: (errorId: string) => void;
}

const ErrorLogsTable = ({ errors, onMarkResolved }: ErrorLogsTableProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'warning': return <Clock className="h-3 w-3" />;
      case 'info': return <User className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Logs de Erros do Sistema ({errors.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {errors.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum erro registrado recentemente
              </p>
            ) : (
              errors.map((error) => (
                <div 
                  key={error.id} 
                  className={`border rounded-lg p-4 ${error.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(error.severity)}>
                        {getSeverityIcon(error.severity)}
                        <span className="ml-1">{error.severity.toUpperCase()}</span>
                      </Badge>
                      {error.resolved && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolvido
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Erro:</span>
                      <p className="text-sm text-gray-700">{error.error_type}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Mensagem:</span>
                      <p className="text-sm text-gray-600">{error.error_message}</p>
                    </div>
                    
                    {error.component_name && (
                      <div>
                        <span className="font-medium text-sm">Componente:</span>
                        <span className="text-sm text-gray-600 ml-2">{error.component_name}</span>
                      </div>
                    )}
                    
                    {error.url && (
                      <div>
                        <span className="font-medium text-sm">URL:</span>
                        <span className="text-sm text-gray-600 ml-2 break-all">{error.url}</span>
                      </div>
                    )}
                    
                    {error.user_id && (
                      <div>
                        <span className="font-medium text-sm">Usuário ID:</span>
                        <span className="text-sm text-gray-600 ml-2">{error.user_id.substring(0, 8)}...</span>
                      </div>
                    )}
                  </div>
                  
                  {!error.resolved && (
                    <div className="mt-3 pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onMarkResolved(error.id)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Resolvido
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ErrorLogsTable;
