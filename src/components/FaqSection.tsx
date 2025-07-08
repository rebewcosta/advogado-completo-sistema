
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FaqSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-lawyer-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Perguntas Frequentes
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre respostas para as principais dúvidas sobre o JusGestão
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">O que é o JusGestão?</AccordionTrigger>
                <AccordionContent>
                  JusGestão é uma plataforma completa de gestão para escritórios de advocacia, que permite 
                  gerenciar processos, clientes, agenda, documentos, financeiro e muito mais. Desenvolvido 
                  especificamente para as necessidades do profissional jurídico brasileiro, inclui recursos 
                  como monitoramento de publicações, controle de prazos, relatórios financeiros, gestão de equipe 
                  e integração com ferramentas essenciais para advogados.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Quanto custa a assinatura do JusGestão?</AccordionTrigger>
                <AccordionContent>
                  A assinatura do JusGestão custa R$ 37,00 por mês, com acesso completo a todas as funcionalidades. 
                  Não há taxas de configuração, custos ocultos ou limitações de uso. O pagamento é mensal via cartão 
                  de crédito e você pode cancelar a qualquer momento sem multa ou fidelidade. Oferecemos 7 dias de 
                  teste gratuito para você conhecer todas as funcionalidades.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">Como posso cancelar minha assinatura?</AccordionTrigger>
                <AccordionContent>
                  Para cancelar sua assinatura, acesse a seção "Configurações" no menu lateral, depois clique na 
                  aba "Assinatura" e em seguida no botão "Portal do Cliente". Você será redirecionado para o portal 
                  seguro do Stripe onde poderá cancelar sua assinatura. O acesso permanecerá disponível até o final 
                  do período já pago. Não há multa ou taxa de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">O sistema é compatível com dispositivos móveis?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão é totalmente responsivo e funciona perfeitamente em computadores, tablets e 
                  smartphones. Você pode instalar como um aplicativo (PWA) diretamente no seu dispositivo móvel 
                  para ter acesso rápido. Todas as funcionalidades estão disponíveis em qualquer dispositivo, 
                  permitindo que você gerencie seu escritório de qualquer lugar, a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">Como funciona o monitoramento de publicações?</AccordionTrigger>
                <AccordionContent>
                  O sistema monitora automaticamente diários oficiais de todo o Brasil em busca de publicações 
                  relacionadas aos seus casos. Você configura nomes de advogados, números OAB, nomes de escritório 
                  e palavras-chave, e o sistema busca diariamente por coincidências. Quando encontra algo relevante, 
                  você recebe alertas automáticos e pode marcar publicações como importantes ou já lidas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">O sistema possui controle financeiro?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão possui um módulo financeiro completo e seguro. Você pode registrar receitas, 
                  despesas, honorários, associar transações a clientes e processos específicos. O sistema gera 
                  relatórios detalhados, gráficos de desempenho financeiro e possui proteção por PIN para 
                  informações sensíveis. Todos os dados são criptografados e seguros.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">Posso testar o sistema antes de assinar?</AccordionTrigger>
                <AccordionContent>
                  Sim! Oferecemos 7 dias de teste gratuito com acesso completo a todas as funcionalidades. 
                  Durante o período de teste, você pode cadastrar clientes, processos, usar todas as ferramentas 
                  e explorar o sistema completamente. Não é necessário cartão de crédito para iniciar o teste 
                  e você pode cancelar a qualquer momento sem cobrança.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent>
                  Absolutamente! O JusGestão utiliza criptografia de ponta a ponta, servidores seguros na nuvem, 
                  backups automáticos diários e proteção por PIN para dados financeiros. Seguimos as melhores 
                  práticas de segurança da indústria e estamos em conformidade com a LGPD. Seus dados nunca são 
                  compartilhados com terceiros e você tem controle total sobre suas informações.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
