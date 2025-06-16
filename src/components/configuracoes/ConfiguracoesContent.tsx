
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Settings as SettingsPageIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import ConfiguracoesTabsList from './ConfiguracoesTabsList';
import PerfilTab from './PerfilTab';
import EscritorioTab from './EscritorioTab';
import NotificacoesTab from './NotificacoesTab';
import SegurancaTab from './SegurancaTab';
import ConfiguracoesTabs from './ConfiguracoesTabs';
import { useConfiguracoesState } from '@/hooks/useConfiguracoesState';

interface ConfiguracoesContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ConfiguracoesContent = ({ activeTab, setActiveTab }: ConfiguracoesContentProps) => {
  const {
    user,
    isSaving,
    isLoadingPageData,
    isLoadingPinStatus,
    hasFinancePin,
    profileSettings,
    setProfileSettings,
    officeSettings,
    setOfficeSettings,
    notificationSettings,
    setNotificationSettings,
    securitySettings,
    setSecuritySettings,
    handleSaveAllSettings,
    handleChangeFinanceiroPin,
    refreshSession,
  } = useConfiguracoesState();

  if (isLoadingPageData || isLoadingPinStatus) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Configurações da Conta"
          description="Personalize suas informações e preferências do sistema."
          pageIcon={<SettingsPageIcon />}
          showActionButton={true}
          actionButtonText={isSaving ? "Salvando..." : "Salvar Alterações"}
          onActionButtonClick={handleSaveAllSettings}
          isLoading={isSaving}
          actionButtonDisabled={isSaving}
        />
        <div className="mt-6 md:mt-8 flex justify-center items-center h-[calc(100vh-300px)]">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
      <SharedPageHeader
        title="Configurações da Conta"
        description="Personalize suas informações e preferências do sistema."
        pageIcon={<SettingsPageIcon />}
        showActionButton={true}
        actionButtonText={isSaving ? "Salvando..." : "Salvar Alterações"}
        onActionButtonClick={handleSaveAllSettings}
        isLoading={isSaving}
        actionButtonDisabled={isSaving}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6 md:mt-8">
        <ConfiguracoesTabsList activeTab={activeTab} />

        <TabsContent value="perfil">
          <PerfilTab
            profileSettings={profileSettings}
            setProfileSettings={setProfileSettings}
          />
        </TabsContent>
        
        <TabsContent value="escritorio">
          <EscritorioTab
            officeSettings={officeSettings}
            setOfficeSettings={setOfficeSettings}
            currentLogoUrl={officeSettings.logo_url}
            onLogoUpdate={async () => {
              await refreshSession(); 
              if (user?.user_metadata?.logo_url) {
                setOfficeSettings(prev => ({...prev, logo_url: user.user_metadata.logo_url as string}));
              }
            }}
          />
        </TabsContent>
        
        <TabsContent value="assinatura">
          <ConfiguracoesTabs activeTabValue="assinatura" />
        </TabsContent>
        
        <TabsContent value="aplicativo">
          <ConfiguracoesTabs activeTabValue="aplicativo" />
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <NotificacoesTab
            notificationSettings={notificationSettings}
            setNotificationSettings={setNotificationSettings}
          />
        </TabsContent>
        
        <TabsContent value="seguranca">
          <SegurancaTab
            securitySettings={securitySettings}
            setSecuritySettings={setSecuritySettings}
            hasFinancePin={hasFinancePin}  
            onChangeFinanceiroPin={handleChangeFinanceiroPin}  
            isSavingPin={isSaving} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesContent;
