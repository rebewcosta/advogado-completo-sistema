import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

const ConfirmacaoEmailPage = () => {
  const { toast } = useToast();
  const { resendConfirmationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [lastResendTime, setLastResendTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos para reenvio
  
  // Pegar dados do localStorage ou URL params
  const email = localStorage.getItem('pendingConfirmationEmail') || '';
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleResendEmail = async () => {
    const now = Date.now();
    if (now - lastResendTime < 60000) { // 1 minuto mínimo entre tentativas
      toast({
        title: "Aguarde um momento",
        description: "Você pode reenviar o email apenas a cada 1 minuto.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    setLastResendTime(now);
    
    try {
      await resendConfirmationEmail(email);
      toast({
        title: "✅ Email reenviado!",
        description: "Verificamos sua caixa de entrada e pasta de spam.",
        variant: "default",
      });
      setTimeLeft(300); // Reset timer para 5 minutos
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative min-h-screen">
        {/* Header */}
        <div className="relative z-10 pt-6 pb-8">
          <div className="container mx-auto px-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-white/70 hover:text-white transition-colors duration-300 mb-8 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a home
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  
                  {/* Success Icon */}
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      🎉 Cadastro Realizado com Sucesso!
                    </h1>
                    <p className="text-lg text-gray-600">
                      Sua conta foi criada e você já pode começar seu teste gratuito
                    </p>
                  </div>

                  {/* Email Confirmation Section */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      📧 Confirme seu email para ativar a conta
                    </h2>
                    
                    <div className="text-gray-700 space-y-2 mb-4">
                      <p className="font-medium">Enviamos um email de confirmação para:</p>
                      <p className="text-blue-600 font-semibold text-lg">{email}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-left">
                      <h3 className="font-semibold text-gray-800 mb-2">📋 Instruções:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        <li>Verifique sua <strong>caixa de entrada</strong></li>
                        <li>Procure também na <strong>pasta de SPAM</strong></li>
                        <li>Clique no link de confirmação no email</li>
                        <li>Pronto! Sua conta estará ativada</li>
                      </ol>
                    </div>
                  </div>

                  {/* Trial Info */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
                    <div className="flex items-center justify-center mb-3">
                      <Clock className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-green-800">
                        🆓 Seu teste gratuito já começou!
                      </h3>
                    </div>
                    <p className="text-green-700 mb-2">
                      Você tem <strong>7 dias completos</strong> para testar todas as funcionalidades
                    </p>
                    <p className="text-sm text-green-600">
                      Tempo restante: <span className="font-mono font-bold">{formatTime(timeLeft)}</span> para primeiro acesso
                    </p>
                  </div>

                  {/* Resend Email Section */}
                  <div className="border-t pt-6">
                    <p className="text-gray-600 mb-4">
                      Não recebeu o email? Verifique sua pasta de spam primeiro.
                    </p>
                    
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending || (timeLeft > 240)} // Permitir reenvio após 1 minuto
                      variant="outline"
                      className="mb-4"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Reenviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Reenviar email de confirmação
                        </>
                      )}
                    </Button>

                    {timeLeft > 240 && (
                      <p className="text-sm text-gray-500">
                        Aguarde {formatTime(timeLeft - 240)} para reenviar novamente
                      </p>
                    )}
                  </div>

                  {/* Help Section */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">💡 Problemas para receber o email?</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Verifique se o email está correto: <strong>{email}</strong></p>
                      <p>• Procure na pasta de spam/lixo eletrônico</p>
                      <p>• Adicione noreply@supabase.co à sua lista de contatos</p>
                      <p>• Entre em contato conosco se o problema persistir</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Fazer Login
                      </Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button variant="default" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                        Voltar ao Início
                      </Button>
                    </Link>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoEmailPage;