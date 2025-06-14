
import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const RedefinirPinFinanceiroPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Redefinir PIN Financeiro"
          description="Redefina seu PIN de acesso ao módulo financeiro."
          pageIcon={<Lock />}
        />

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Novo PIN Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPin">Novo PIN (4 dígitos)</Label>
                <Input
                  id="newPin"
                  type="password"
                  maxLength={4}
                  placeholder="****"
                />
              </div>

              <div>
                <Label htmlFor="confirmPin">Confirmar PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  maxLength={4}
                  placeholder="****"
                />
              </div>

              <Button className="w-full">
                Redefinir PIN
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default RedefinirPinFinanceiroPage;
