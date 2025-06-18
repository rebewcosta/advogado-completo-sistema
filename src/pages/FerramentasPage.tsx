import React from 'react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Wrench, Calculator, MapPin, DollarSign, Calendar, Shield, FileText, QrCode, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrazosCalculadora } from '@/components/prazos/PrazosCalculadora';
import { ConsultaCep } from '@/components/correios/ConsultaCep';
import { CalculadoraCorrecao } from '@/components/ferramentas/CalculadoraCorrecao';
import { ConsultaFeriados } from '@/components/ferramentas/ConsultaFeriados';
import { ValidadorCpfCnpj } from '@/components/ferramentas/ValidadorCpfCnpj';
import { GeradorPeticoes } from '@/components/ferramentas/GeradorPeticoes';
import { GeradorQrCode } from '@/components/ferramentas/GeradorQrCode';
import { GeradorAssinatura } from '@/components/ferramentas/GeradorAssinatura';

const FerramentasPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = React.useState<string | null>(null);

  const tools = [
    {
      id: 'prazos',
      title: 'Calculadora de Prazos',
      description: 'Calcule prazos processuais com precisão',
      icon: Calculator,
      component: PrazosCalculadora,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'cep',
      title: 'Consulta de CEP',
      description: 'Busque endereços pelo código postal',
      icon: MapPin,
      component: ConsultaCep,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'correcao',
      title: 'Correção Monetária',
      description: 'Calcule correções e juros',
      icon: DollarSign,
      component: CalculadoraCorrecao,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'feriados',
      title: 'Consulta de Feriados',
      description: 'Verifique feriados nacionais e locais',
      icon: Calendar,
      component: ConsultaFeriados,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'validador',
      title: 'Validador CPF/CNPJ',
      description: 'Valide documentos CPF e CNPJ',
      icon: Shield,
      component: ValidadorCpfCnpj,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'peticoes',
      title: 'Gerador de Petições',
      description: 'Crie petições com modelos predefinidos',
      icon: FileText,
      component: GeradorPeticoes,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'qrcode',
      title: 'Gerador QR Code',
      description: 'Crie QR Codes para WhatsApp, Wi-Fi, e-mails, contatos e muito mais',
      icon: QrCode,
      component: GeradorQrCode,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'assinatura',
      title: 'Gerador de Assinatura de E-mail',
      description: 'Crie assinaturas profissionais para seus e-mails',
      icon: Mail,
      component: GeradorAssinatura,
      color: 'from-teal-500 to-teal-600'
    }
  ];

  if (selectedTool) {
    const tool = tools.find(t => t.id === selectedTool);
    if (tool) {
      const ToolComponent = tool.component;
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setSelectedTool(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
              >
                ← Voltar para Ferramentas
              </button>
              <SharedPageHeader 
                title={tool.title}
                description={tool.description}
                pageIcon={<tool.icon />}
              />
            </div>
            <ToolComponent />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <SharedPageHeader 
          title="Ferramentas" 
          description="Acesse todas as ferramentas disponíveis para otimizar seu trabalho jurídico"
          pageIcon={<Wrench />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm"
              onClick={() => setSelectedTool(tool.id)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                  Abrir ferramenta
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Otimize seu trabalho jurídico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Ferramentas de Cálculo</h4>
              <ul className="space-y-1">
                <li>• Prazos processuais automatizados</li>
                <li>• Correção monetária precisa</li>
                <li>• Validação de documentos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Ferramentas de Produtividade</h4>
              <ul className="space-y-1">
                <li>• Geração de QR Codes profissionais</li>
                <li>• Consultas rápidas de CEP</li>
                <li>• Modelos de petições padronizados</li>
                <li>• Assinaturas de e-mail personalizadas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FerramentasPage;
