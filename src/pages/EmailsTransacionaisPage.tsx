// src/pages/EmailsTransacionaisPage.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { MailOpen } from 'lucide-react'; // MailOpen para o header
import SharedPageHeader from '@/components/shared/SharedPageHeader'; // <<< IMPORTAR
import { supabase } from '@/integrations/supabase/client'; // Necessário para buscar os emails
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface EmailLog {
  id: string;
  created_at: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | string; // string para cobrir outros status possíveis
  error_message?: string | null;
  content_preview?: string | null; // Adicionado para um possível preview
}

const EmailsTransacionaisPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!user) {
        setIsLoadingEmails(false);
        return;
      }
      // Somente admin pode ver
      const isAdminUser = user.email === 'webercostag@gmail.com' || user.user_metadata?.isAdmin === true;
      if (!isAdminUser) {
        setIsLoadingEmails(false);
        return;
      }

      setIsLoadingEmails(true);
      setError(null);
      try {
        // ATENÇÃO: Presumindo que você tenha uma tabela chamada 'transactional_email_logs' ou similar.
        // Ajuste o nome da tabela e as colunas conforme sua estrutura real.
        const { data, error: dbError } = await supabase
          .from('transactional_email_logs') // <<< SUBSTITUA PELO NOME CORRETO DA SUA TABELA DE LOGS DE EMAIL
          .select('id, created_at, recipient, subject, status, error_message, content_preview')
          .order('created_at', { ascending: false })
          .limit(100); // Limitar para performance

        if (dbError) throw dbError;
        setEmails(data || []);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar logs de email.");
        console.error("Erro ao buscar logs de email:", err);
      } finally {
        setIsLoadingEmails(false);
      }
    };

    if (!authLoading) { // Só busca emails depois que a autenticação carregar
      fetchEmails();
    }
  }, [user, authLoading]);

  if (authLoading || isLoadingEmails) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <SharedPageHeader
            title="Logs de Emails Transacionais"
            description="Acompanhe os emails enviados pelo sistema."
            pageIcon={<MailOpen />}
            showActionButton={false}
          />
          <div className="mt-6 flex justify-center items-center h-64">
            <Spinner size="lg" />
            <p className="ml-2">Carregando logs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const isAdminUser = user?.email === 'webercostag@gmail.com' || user?.user_metadata?.isAdmin === true;
  if (!isAdminUser && !authLoading) { // Se não for admin e a auth já carregou
    return <Navigate to="/dashboard" replace />;
  }


  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    if (status === 'sent') return 'default'; // Verde (shadcn default é primário, mas pode ser ajustado com classes)
    if (status === 'failed') return 'destructive';
    if (status === 'pending') return 'outline'; // Amarelo/Laranja (shadcn outline é cinza)
    return 'secondary';
  };


  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Logs de Emails Transacionais"
          description="Acompanhe os emails enviados pelo sistema."
          pageIcon={<MailOpen />}
          showActionButton={false} // Sem botão de ação principal
        />

        <div className="mt-6 md:mt-8">
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>Últimos 100 emails registrados.</CardDescription>
            </CardHeader>
            <CardContent>
              {emails.length === 0 && !isLoadingEmails && !error ? (
                <p className="text-center text-gray-500 py-8">Nenhum log de email encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Destinatário</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {format(parseISO(email.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-xs">{email.recipient}</TableCell>
                          <TableCell className="text-xs">{email.subject}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusBadgeVariant(email.status)}
                              className={cn(
                                "text-xs capitalize",
                                email.status === 'sent' && "bg-green-100 text-green-700 border-green-200",
                                email.status === 'pending' && "bg-yellow-100 text-yellow-700 border-yellow-200"
                              )}
                            >
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-red-500 hidden md:table-cell truncate max-w-xs" title={email.error_message || ''}>
                            {email.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailsTransacionaisPage;