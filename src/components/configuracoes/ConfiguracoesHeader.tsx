
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, LogOut } from "lucide-react";

interface ConfiguracoesHeaderProps {
  saving: boolean;
  loggingOut: boolean;
  onSave: () => void;
  onSignOut: () => void;
}

const ConfiguracoesHeader = ({ 
  saving, 
  loggingOut, 
  onSave, 
  onSignOut 
}: ConfiguracoesHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-left">Configurações</h1>
        <div className="text-sm text-gray-600 text-left">
          <span className="block sm:inline">Personalize o sistema de acordo</span>
          <span className="block sm:inline sm:ml-1">com suas necessidades</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar alterações
        </Button>
        <Button 
          variant="destructive" 
          onClick={onSignOut} 
          disabled={loggingOut}
        >
          {loggingOut ? (
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sair
        </Button>
      </div>
    </div>
  );
};

export default ConfiguracoesHeader;
