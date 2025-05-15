
import React from 'react';
import { Users, FileText, Calendar, DollarSign, BarChart2, Archive } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users className="feature-icon" />,
      title: "Gestão de Clientes",
      description: "Cadastre e gerencie todos os seus clientes em um só lugar.",
      link: "/clientes"
    },
    {
      icon: <FileText className="feature-icon" />,
      title: "Processos Jurídicos",
      description: "Acompanhe todos os processos e seus andamentos.",
      link: "/processos"
    },
    {
      icon: <Calendar className="feature-icon" />,
      title: "Agenda & Compromissos",
      description: "Organize sua agenda e nunca perca um compromisso.",
      link: "/agenda"
    },
    {
      icon: <DollarSign className="feature-icon" />,
      title: "Controle Financeiro",
      description: "Gerencie receitas, despesas e honorários.",
      link: "/financeiro"
    },
    {
      icon: <BarChart2 className="feature-icon" />,
      title: "Relatórios",
      description: "Gere relatórios detalhados sobre seu escritório.",
      link: "/relatorios"
    },
    {
      icon: <Archive className="feature-icon" />,
      title: "Documentos",
      description: "Armazene e organize documentos importantes.",
      link: "/documentos"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Funcionalidades Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              link={feature.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
