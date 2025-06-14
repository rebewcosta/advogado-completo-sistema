
import React from 'react';
import { ArrowRight, CheckCircle, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CtaSection = () => {
  const benefits = [
    "Setup completo em menos de 5 minutos",
    "Suporte especializado 24/7 incluído",
    "Backup automático e segurança avançada",
    "Atualizações gratuitas sempre",
    "Integração com sistemas existentes"
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background com gradiente avançado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M30%2030c0-11%209-20%2020-20s20%209%2020%2020-9%2020-20%2020-20-9-20-20zm10%200c0-5.5%204.5-10%2010-10s10%204.5%2010%2010-4.5%2010-10%2010-10-4.5-10-10z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white mb-2">5.000+</div>
                <div className="text-blue-200 flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Advogados Ativos
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  4.9 <Star className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
                <div className="text-blue-200">Avaliação Média</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-blue-200 flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Disponibilidade
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main CTA content */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Pronto para <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">revolucionar</span><br />
              seu escritório?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed">
              Junte-se a milhares de advogados que já transformaram seus escritórios com o JusGestão. 
              Comece sua jornada digital hoje mesmo.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-blue-100">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  Começar Gratuitamente
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/demo">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-semibold backdrop-blur-lg transition-all duration-300 hover:scale-105 flex items-center gap-3">
                  Agendar Demonstração
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-blue-300 text-sm mt-6">
              Teste grátis por 30 dias • Sem compromisso • Suporte incluído
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CtaSection;
