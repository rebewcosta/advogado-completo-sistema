
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="py-16 bg-lawyer-dark text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para transformar a gestão do seu escritório?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Junte-se a milhares de advogados que já otimizaram seus escritórios com o JusGestão.
        </p>
        <div className="flex justify-center">
          <Link to="/cadastro" className="btn-primary">
            Comece agora <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
