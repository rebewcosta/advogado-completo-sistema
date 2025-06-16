
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Info } from 'lucide-react';

interface SecurityAdvancedSettingsProps {
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
}

const SecurityAdvancedSettings = ({
  securitySettings,
  setSecuritySettings
}: SecurityAdvancedSettingsProps) => {
  return (
    <div className="opacity-60 pointer-events-none">
        <Separator className="my-6" />
        <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-500">Configurações Avançadas (Em Breve)</h3>
        </div>
        <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="space-y-0.5">
                <Label htmlFor="twoFactorSwitch_config_sec" className="font-medium text-gray-600">Autenticação em Dois Fatores</Label>
                <p className="text-xs text-gray-500">
                Adicione uma camada extra de segurança à sua conta.
                </p>
            </div>
            <Switch
                id="twoFactorSwitch_config_sec"
                checked={securitySettings.pref_seguranca_dois_fatores}
                onCheckedChange={(checked) =>
                setSecuritySettings(prev => ({...prev, pref_seguranca_dois_fatores: !!checked}))
                }
                disabled
            />
            </div>

            <div className="space-y-1.5 p-4 border border-gray-200 rounded-md bg-gray-50">
            <Label htmlFor="sessionTimeout_config_sec" className="text-sm font-medium text-gray-600">Tempo de Sessão (minutos)</Label>
            <p className="text-xs text-gray-500 mb-2">
                Defina por quanto tempo sua sessão permanecerá ativa sem atividade.
            </p>
            <Input
                id="sessionTimeout_config_sec"
                type="number"
                min="5"
                max="120"
                value={securitySettings.pref_seguranca_tempo_sessao_min}
                onChange={(e) => setSecuritySettings(prev => ({...prev, pref_seguranca_tempo_sessao_min: e.target.value}))}
                disabled
                className="border-gray-300 w-24"
            />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="space-y-0.5">
                <Label htmlFor="ipRestrictionSwitch_config_sec" className="font-medium text-gray-600">Restrição de IP</Label>
                <p className="text-xs text-gray-500">
                Limite o acesso a endereços IP específicos.
                </p>
            </div>
            <Switch
                id="ipRestrictionSwitch_config_sec"
                checked={securitySettings.pref_seguranca_restricao_ip}
                onCheckedChange={(checked) =>
                setSecuritySettings(prev => ({...prev, pref_seguranca_restricao_ip: !!checked}))
                }
                disabled
            />
            </div>
        </div>
    </div>
  );
};

export default SecurityAdvancedSettings;
