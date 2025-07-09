
import React from 'react';
import { AlertTriangle, RefreshCw, CreditCard, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PaginaErroAmigavelProps {
  tipo: 'payment_failed' | 'subscription_expired' | 'system_error' | 'trial_expired';
  onTentarNovamente?: () => void;
  onContatos?: () => void;
}

const PaginaErroAmigavel: React.FC<PaginaErroAmigavelProps> = ({ 
  tipo, 
  onTentarNovamente, 
  onContatos 
}) => {
  const navigate = useNavigate();

  const configuracoes = {
    payment_failed: {
      icon: CreditCard,
      titulo: "Problema com o Pagamento",
      descricao: "Identificamos um problema com seu método de pagamento. Não se preocupe, é fácil resolver!",
      cor: "text-yellow-600",
      bgCor: "bg-yellow-50 border-yellow-200",
      solucoes: [
        "Verifique se seu cartão não está vencido ou bloqueado",
        "Confira se há saldo suficiente na conta",
        "Tente usar outro método de pagamento",
        "Entre em contato com seu banco se necessário"
      ],
      acaoPrincipal: "Atualizar Pagamento",
      acaoSecundaria: "Portal do Cliente"
    },
    subscription_expired: {
      icon: AlertTriangle,
      titulo: "Assinatura Expirada",
      descricao: "Sua assinatura expirou, mas você pode reativá-la facilmente!",
      cor: "text-red-600",
      bgCor: "bg-red-50 border-red-200",
      solucoes: [
        "Renove sua assinatura para continuar usando o sistema",
        "Todos os seus dados estão seguros e preservados",
        "Você pode escolher um novo plano se desejar",
        "O processo de renovação é rápido e seguro"
      ],
      acaoPrincipal: "Renovar Assinatura",
      acaoSecundaria: "Ver Planos"
    },
    trial_expired: {
      icon: AlertTriangle,
      titulo: "Período de Teste Expirado",
      descricao: "Seus 7 dias de teste gratuito chegaram ao fim. Que tal assinar para continuar?",
      cor: "text-blue-600",
      bgCor: "bg-blue-50 border-blue-200",
      solucoes: [
        "Você testou o JusGestão por 7 dias gratuitamente",
        "Para continuar, escolha um de nossos planos",
        "Seus dados estão salvos e seguros",
        "A assinatura é mensal e pode ser cancelada a qualquer momento"
      ],
      acaoPrincipal: "Assinar Agora",
      acaoSecundaria: "Ver Benefícios"
    },
    system_error: {
      icon: AlertTriangle,
      titulo: "Erro Temporário do Sistema",
      descricao: "Estamos enfrentando um problema temporário. Nossa equipe já foi notificada!",
      cor: "text-gray-600",
      bgCor: "bg-gray-50 border-gray-200",
      solucoes: [
        "Este é um problema temporário do sistema",
        "Nossa equipe técnica já foi notificada automaticamente",
        "Tente novamente em alguns minutos",
        "Se o problema persistir, entre em contato conosco"
      ],
      acaoPrincipal: "Tentar Novamente",
      acaoSecundaria: "Contatar Suporte"
    }
  };

  const config = configuracoes[tipo];
  const IconComponent = config.icon;

  const handleAcaoPrincipal = () => {
    switch (tipo) {
      case 'payment_failed':
      case 'subscription_expired':
        navigate('/perfil'); // Portal do cliente
        break;
      case 'trial_expired':
        navigate('/pagamento'); // Página de assinatura
        break;
      case 'system_error':
        if (onTentarNovamente) onTentarNovamente();
        break;
    }
  };

  const handleAcaoSecundaria = () => {
    switch (tipo) {
      case 'payment_failed':
        navigate('/perfil'); // Portal do cliente
        break;
      case 'subscription_expired':
      case 'trial_expired':
        navigate('/'); // Ver planos na home
        break;
      case 'system_error':
        window.open('mailto:suporte@sisjusgestao.com.br', '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`max-w-2xl w-full ${config.bgCor}`}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-white shadow-sm">
            <IconComponent className={`h-8 w-8 ${config.cor}`} />
          </div>
          <CardTitle className={`text-2xl font-bold ${config.cor}`}>
            {config.titulo}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {config.descricao}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Soluções */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Como resolver:</h3>
            <ul className="space-y-2">
              {config.solucoes.map((solucao, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5">•</span>
                  {solucao}
                </li>
              ))}
            </ul>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleAcaoPrincipal}
              className="flex-1 h-12 text-white font-semibold"
            >
              {config.acaoPrincipal}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAcaoSecundaria}
              className="flex-1 h-12"
            >
              {config.acaoSecundaria}
            </Button>
          </div>

          {/* Informações de contato */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-800">Precisa de ajuda?</span>
            </div>
            <p className="text-sm text-gray-600">
              📧 <strong>suporte@sisjusgestao.com.br</strong><br />
              🕐 Respondemos em até 24 horas<br />
              💬 Ou responda qualquer email automático que receber
            </p>
          </div>

          {/* Botão voltar */}
          <div className="text-center pt-4 border-t">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaginaErroAmigavel;
