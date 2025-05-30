// src/components/HeroSection.tsx
import React, { useState } from 'react';
import { ArrowRight, DownloadCloud, X as CloseIcon, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input

interface HeroSectionProps {
  showPWAInstallBanner?: boolean;
  canInstallPWA?: boolean;
  isIOS?: boolean;
  isStandalone?: boolean; // Adicionado para saber se já está instalado
  onInstallPWA?: () => void;
  onDismissInstallBanner?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  showPWAInstallBanner,
  canInstallPWA,
  isIOS,
  isStandalone,
  onInstallPWA,
  onDismissInstallBanner
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e senha.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false);
    }
  };
  
  // Só mostra o banner se showPWAInstallBanner for true E se não estiver rodando como app instalado
  const displayBanner = showPWAInstallBanner && !isStandalone;

  return (
    <div className="bg-lawyer-dark text-white pt-8 pb-16 md:pt-12 md:pb-24 relative">
      <div className="container mx-auto px-4">
        
        {displayBanner && ( // Usando a variável displayBanner
          <div 
            className="mb-8 p-3 bg-slate-700/80 backdrop-blur-sm rounded-lg border border-slate-600 text-center sm:text-left shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
            role="alertdialog"
            aria-labelledby="pwa-install-banner-title-hero"
            aria-describedby="pwa-install-banner-description-hero"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img src="/icons/icon-192x192.png" alt="JusGestão" className="h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0" />
              <div className="min-w-0">
                <h3 id="pwa-install-banner-title-hero" className="text-sm sm:text-base font-semibold text-white truncate">
                  {isIOS ? "Acesso Rápido ao JusGestão" : "Instale o App JusGestão"}
                </h3>
                <p id="pwa-install-banner-description-hero" className="text-xs sm:text-sm text-slate-300 truncate">
                  {isIOS 
                    ? <>Toque em <Share2 className="inline h-3 w-3 align-baseline mx-0.5"/> e 'Adicionar à Tela de Início'.</>
                    : "Tenha na sua tela inicial para acesso rápido e fácil!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {!isIOS && canInstallPWA && onInstallPWA && (
                <Button 
                  onClick={onInstallPWA} 
                  size="sm" 
                  className="bg-lawyer-primary hover:bg-lawyer-primary/80 text-white text-xs sm:text-sm px-3 py-1.5 h-auto"
                >
                  <DownloadCloud className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Instalar
                </Button>
              )}
              {onDismissInstallBanner && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismissInstallBanner}
                  className="text-slate-400 hover:text-white hover:bg-slate-600/50 h-auto px-2 py-1.5 text-xs"
                  aria-label="Dispensar"
                >
                  <CloseIcon className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Agora Não</span>
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className={`md:w-1/2 mb-8 md:mb-0 ${user ? 'md:w-full text-center' : ''}`}>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Gerencie seu escritório de advocacia com eficiência
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              O JusGestão é um sistema completo para advogados que simplifica a gestão de clientes, 
              processos, documentos e finanças em uma única plataforma.
            </p>
            {user ? (
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/dashboard" className="btn-primary">
                  Ir para o Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <Link to="/cadastro" className="btn-primary">
                Cadastrar Agora <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
          
          {!user && (
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-lawyer-primary/10 p-8 rounded-lg border border-lawyer-primary/30 shadow-lg shadow-lawyer-primary/20 w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Acesso ao Sistema</h2>
                  <div>
                    <Label htmlFor="email-hero" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </Label>
                    <Input
                      id="email-hero"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-hero" className="block text-sm font-medium text-gray-300 mb-1">
                      Senha
                    </Label>
                    <Input
                      id="password-hero"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input
                        id="remember-me-hero"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary border-gray-700 rounded"
                      />
                      <Label htmlFor="remember-me-hero" className="ml-2 block text-gray-300">
                        Lembrar de mim
                      </Label>
                    </div>
                    <div>
                      <Link to="/recuperar-senha" className="font-medium text-lawyer-accent hover:text-lawyer-accent/90">
                        Esqueceu sua senha?
                      </Link>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-lawyer-primary text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Entrando...
                      </>
                    ) : 'Entrar'}
                  </Button>
                  <div className="text-center text-sm mt-4">
                    <span className="text-gray-300">Não tem uma conta? </span>
                    <Link to="/cadastro" className="text-lawyer-accent hover:underline">Cadastre-se</Link>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;