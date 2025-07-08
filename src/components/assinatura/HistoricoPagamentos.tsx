
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Download, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PagamentoHistorico {
  id: string;
  data: string;
  valor: number;
  status: 'paid' | 'pending' | 'failed';
  metodo: string;
  periodo: string;
  invoice_url?: string;
}

const HistoricoPagamentos: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pagamentos, setPagamentos] = useState<PagamentoHistorico[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistoricoPagamentos = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buscar-historico-pagamentos');
      
      if (error) throw error;
      
      if (data?.pagamentos) {
        setPagamentos(data.pagamentos);
      }
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de pagamentos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricoPagamentos();
  }, [user]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando histórico...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Pagamentos
            </CardTitle>
            <CardDescription>
              Visualize todos os seus pagamentos e faturas
            </CardDescription>
          </div>
          <Button
            onClick={fetchHistoricoPagamentos}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {pagamentos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum pagamento encontrado</p>
            <p className="text-sm mt-2">
              Seu histórico de pagamentos aparecerá aqui após a primeira cobrança
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagamentos.map((pagamento) => (
              <div
                key={pagamento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {formatarValor(pagamento.valor)}
                      </p>
                      {getStatusBadge(pagamento.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatarData(pagamento.data)} • {pagamento.metodo}
                    </p>
                    <p className="text-xs text-gray-400">
                      Período: {pagamento.periodo}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {pagamento.invoice_url && (
                    <Button
                      onClick={() => handleDownloadInvoice(pagamento.invoice_url!)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Fatura
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoPagamentos;
