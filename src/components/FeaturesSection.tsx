import React from 'react';
import { Users, FileText, Calendar, DollarSign, BarChart2, Archive, CheckSquare, BookOpen, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gestão de Clientes",
      description: "Cadastre e gerencie todos os seus clientes com informações completas e organizadas.",
      link: "/clientes"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Processos Jurídicos",
      description: "Acompanhe todos os processos, prazos e seus andamentos em tempo real.",
      link: "/processos"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Agenda & Compromissos",
      description: "Organize sua agenda inteligente e nunca perca um compromisso importante.",
      link: "/agenda"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Controle Financeiro",
      description: "Gerencie receitas, despesas e honorários com relatórios detalhados.",
      link: "/financeiro"
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: "Relatórios Avançados",
      description: "Gere relatórios inteligentes e dashboards sobre seu escritório.",
      link: "/relatorios"
    },
    {
      icon: <Archive className="h-8 w-8" />,
      title: "Documentos na Nuvem",
      description: "Armazene e organize documentos importantes com segurança total.",
      link: "/documentos"
    },
    {
      icon: <CheckSquare className="h-8 w-8" />,
      title: "Gestão de Tarefas",
      description: "Organize e acompanhe todas as suas tarefas e atividades diárias.",
      link: "/tarefas",
      highlight: "Novo"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Publicações Oficiais",
      description: "Monitore automaticamente publicações nos diários oficiais.",
      link: "/publicacoes",
      highlight: "Popular"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Configurações Avançadas",
      description: "Personalize o sistema conforme suas necessidades específicas.",
      link: "/configuracoes"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Funcionalidades Completas
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Tudo que você precisa em
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> um só lugar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nossa plataforma oferece todas as ferramentas essenciais para modernizar e otimizar a gestão do seu escritório de advocacia.
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group relative bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  {feature.highlight && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs font-semibold">
                      {feature.highlight}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Link 
                  to={feature.link} 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-semibold text-sm transition-all duration-300 group-hover:gap-3"
                >
                  Explorar funcionalidade
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
