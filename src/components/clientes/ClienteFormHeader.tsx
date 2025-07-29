
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Info, Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ClienteFormHeaderProps {
  isEdit: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Processos', path: '/processos' },
  { label: 'Agenda', path: '/agenda' },
  { label: 'Tarefas', path: '/tarefas' },
  { label: 'Financeiro', path: '/financeiro' },
  { label: 'Documentos', path: '/documentos' },
  { label: 'Equipe', path: '/equipe' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Configurações', path: '/configuracoes' },
];

const ClienteFormHeader: React.FC<ClienteFormHeaderProps> = ({ isEdit, onClose }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onClose(); // Fecha o formulário
    navigate(path); // Navega para a página
    setIsMenuOpen(false); // Fecha o menu
  };

  return (
    <div className="p-6">
      <TooltipProvider>
        <div className="flex flex-row items-center justify-between">
          {/* Botão de Menu - apenas no mobile */}
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 -ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-6">Menu de Navegação</h3>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        className="w-full justify-start text-left"
                        onClick={() => handleNavigate(item.path)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="flex items-center gap-2 flex-1 justify-center">
            <h2 className="text-white text-xl font-semibold">
              {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-200 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  {isEdit 
                    ? "Atualize as informações do cliente. Campos com * são obrigatórios."
                    : "Cadastre um novo cliente preenchendo todos os campos obrigatórios."}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 -mr-2 -mt-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ClienteFormHeader;
