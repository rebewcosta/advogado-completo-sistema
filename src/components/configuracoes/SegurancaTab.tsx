
import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import FinancePinForm from './FinancePinForm';
import SecurityAdvancedSettings from './SecurityAdvancedSettings';

interface SegurancaTabProps {
  securitySettings: {
    pref_seguranca_dois_fatores: boolean;
    pref_seguranca_tempo_sessao_min: string;
    pref_seguranca_restricao_ip: boolean;
  };
  setSecuritySettings: React.Dispatch<React.SetStateAction<{
    pref_seguranca_dois_fatores: boolean;
    pref_seguranca_tempo_sessao_min: string;
    pref_seguranca_restricao_ip: boolean;
  }>>;
  hasFinancePin: boolean;
  onChangeFinanceiroPin: (currentPin: string | null, newPin: string) => Promise<boolean>;
  isSavingPin: boolean;
}

const SegurancaTab = ({
  securitySettings,
  setSecuritySettings,
  hasFinancePin,
  onChangeFinanceiroPin,
  isSavingPin
}: SegurancaTabProps) => {
  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6 text-lawyer-primary" />
          Segurança da Conta
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 pt-1">
          Gerencie suas senhas, PIN de acesso e outras configurações de segurança.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        <PasswordChangeForm />
        
        <FinancePinForm
          hasFinancePin={hasFinancePin}
          onChangeFinanceiroPin={onChangeFinanceiroPin}
          isSavingPin={isSavingPin}
        />
        
        <SecurityAdvancedSettings
          securitySettings={securitySettings}
          setSecuritySettings={setSecuritySettings}
        />
      </CardContent>
    </Card>
  );
};

export default SegurancaTab;
