
// src/pages/EmailsTransacionaisPage.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { MailOpen } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface EmailLog {
  id: string;
  created_at: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | string;
  error_message?: string | null;
  content_preview?: string | null;
}

const EmailsTransacionaisPage: React.FC = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      if (!user) {
        setIsLoadingEmails(false);
        return;
      }
      const isAdminUser = user.email === 'webercostag@gmail.com' || user.user_metadata?.isAdmin === true;
      if (!isAdminUser) {
        setIsLoadingEmails(false);
        return;
      }

      setIsLoadingEmails(true);
      setError(null);
      try {
        const mockEmails: EmailLog[] = [
          {
            id: '1',
            created_at: new Date().toISOString(),
            recipient: 'usuario@exemplo.com',
            subject: 'Bem-vindo ao JusGestão',
            status: 'sent',
            error_message: null,
            content_preview: 'Sua conta foi criada com sucesso...'
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            recipient: 'cliente@exemplo.com',
            subject: 'Lembrete de Prazo',
            status: 'sent',
            error_message: null,
            content_preview: 'Você tem um prazo se aproximando...'
          }
        ];
        
        setEmails(mockEmails);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar logs de email.");
        console.error("Erro ao buscar logs de email:", err);
      } finally {
        setIsLoadingEmails(false);
      }
    };

    fetchEmails();
  }, [user]);

  if (isLoadingEmails) {
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
  if (!isAdminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Logs de Emails Transacionais"
          description="Acompanhe os emails enviados pelo sistema."
          pageIcon={<MailOpen />}
          showActionButton={false}
        />

        <div className="mt-6 md:mt-8">
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>Emails enviados pelo sistema (dados de exemplo).</CardDescription>
            </CardHeader>
            <CardContent>
              {emails.length === 0 && !isLoadingEmails && !error ? (
                <p className="text-center text-gray-500 py-8">Nenhum log de email encontrado.</p>
              ) : (
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div key={email.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{email.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          email.status === 'sent' ? 'bg-green-100 text-green-700' :
                          email.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {email.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Para: {email.recipient}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(email.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
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
