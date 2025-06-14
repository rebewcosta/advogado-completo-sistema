
import React from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const EmailsTransacionaisPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Emails Transacionais"
          description="Gerencie templates e configurações de emails automáticos."
          pageIcon={<Mail />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações de Prazo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Configure emails de lembrete para prazos processuais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmações de Reunião</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Templates para confirmações automáticas de reuniões e audiências.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atualizações de Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Notifique clientes sobre mudanças no status dos processos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default EmailsTransacionaisPage;
