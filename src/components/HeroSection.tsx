import React, { useState } from 'react';
import { ArrowRight, DownloadCloud, X as CloseIcon, Share2, Shield, Zap, Users, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface HeroSectionProps {
  showPWAInstallBanner?: boolean;
  canInstallPWA?: boolean;
  isIOS?: boolean;
  isStandalone?: boolean;
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
  
  // Só mostra o banner se showPWAInstallBanner for true E se nao estiver rodando como app instalado
  const displayBanner = showPWAInstallBanner && !isStandalone;

  return (
    <div className="relative overflow-hidden">
      {/* Background com gradiente moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative pt-8 pb-20 md:pt-16 md:pb-32">
        <div className="container mx-auto px-4">
          
          {displayBanner && (
            <div 
              className="mb-8 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 text-center sm:text-left shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
              role="alertdialog"
              aria-labelledby="pwa-install-banner-title-hero"
              aria-describedby="pwa-install-banner-description-hero"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative">
                  <img src="/icons/icon-192x192.png" alt="JusGestão" className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl shadow-lg" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="min-w-0 text-left"> 
                  <h3 id="pwa-install-banner-title-hero" className="text-base sm:text-lg font-bold text-white">
                    {isIOS ? "Acesso Rápido ao JusGestão" : "Instale o App JusGestão"}
                  </h3>
                  <p id="pwa-install-banner-description-hero" className="text-sm text-blue-200">
                    {isIOS 
                      ? <>Toque em <Share2 className="inline h-3 w-3 align-baseline mx-0.5"/> e 'Adicionar à Tela de Início'.</>
                      : "Tenha na sua tela inicial para acesso rápido e fácil!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isIOS && canInstallPWA && onInstallPWA && (
                  <Button 
                    onClick={onInstallPWA} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" /> Instalar App
                  </Button>
                )}
                {onDismissInstallBanner && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDismissInstallBanner}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    aria-label="Dispensar"
                  >
                    <CloseIcon className="h-4 w-4 md:hidden" />
                    <span className="hidden md:inline">Mais Tarde</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className={`lg:w-7/12 text-center lg:text-left ${user ? 'lg:w-full' : ''}`}>
              {/* Badge moderno */}
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/30 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
                <Award className="h-4 w-4 text-blue-300" />
                <span className="text-blue-200 text-sm font-medium">Sistema #1 para Advogados</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="text-white">Gerencie seu</span><br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                  escritório de advocacia
                </span><br />
                <span className="text-white">com eficiência</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                O JusGestão é um sistema completo para advogados que simplifica a gestão de clientes, 
                processos, documentos e finanças em uma única plataforma moderna e intuitiva.
              </p>

              {/* Stats modernos */}
              <div className="grid grid-cols-3 gap-6 mb-10 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">98%</div>
                  <div className="text-blue-300 text-sm">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">5k+</div>
                  <div className="text-blue-300 text-sm">Advogados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-blue-300 text-sm">Suporte</div>
                </div>
              </div>

              {user && (
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link to="/dashboard" className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:from-green-500 hover:to-emerald-500">
                    <Zap className="h-5 w-5" />
                    Ir para o Dashboard 
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              )}

              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-blue-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Setup em 5min</span>
                </div>
              </div>
            </div>
            
            {!user && (
              <div className="lg:w-5/12 flex justify-center">
                <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso ao Sistema</h2>
                      <p className="text-gray-600">Entre na sua conta para continuar</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="email-hero" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </Label>
                        <Input
                          id="email-hero"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-gray-800 placeholder:text-gray-400"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password-hero" className="block text-sm font-semibold text-gray-700 mb-2">
                          Senha
                        </Label>
                        <Input
                          id="password-hero"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-gray-800"
                          placeholder="••••••••"
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
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label htmlFor="remember-me-hero" className="ml-2 text-gray-600">
                            Lembrar de mim
                          </Label>
                        </div>
                        <div>
                          <Link to="/recuperar-senha" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            Esqueceu sua senha?
                          </Link>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Entrando...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-5 w-5" />
                            Entrar no Sistema
                          </>
                        )}
                      </Button>
                      <div className="text-center text-sm pt-4 border-t border-gray-200">
                        <span className="text-gray-600">Não tem uma conta? </span>
                        <Link to="/cadastro" className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
                          Cadastre-se gratuitamente
                        </Link>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
