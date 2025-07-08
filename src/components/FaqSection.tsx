
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
                  como controle de prazos, relatórios financeiros, gestão de equipe, consulta DataJud CNJ 
                  e integração com ferramentas essenciais para advogados.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Quanto custa a assinatura do JusGestão?</AccordionTrigger>
                <AccordionContent>
                  A assinatura do JusGestão custa R$ 37,00 por mês, com acesso completo a todas as funcionalidades. 
                  Não há taxas de configuração, custos ocultos ou limitações de uso. O pagamento é mensal via cartão 
                  de crédito e você pode cancelar a qualquer momento sem multa ou fidelidade. Oferecemos 7 dias de 
                  teste gratuito SEM CARTÃO DE CRÉDITO para você conhecer todas as funcionalidades.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">Como funciona o teste gratuito?</AccordionTrigger>
                <AccordionContent>
                  Oferecemos 7 dias de teste gratuito com acesso completo a todas as funcionalidades, 
                  SEM NECESSIDADE DE CARTÃO DE CRÉDITO! Basta se cadastrar e começar a usar imediatamente. 
                  Durante o período de teste, você pode cadastrar clientes, processos, usar todas as ferramentas 
                  e explorar o sistema completamente. Após os 7 dias, você pode escolher assinar para continuar usando.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Como posso cancelar minha assinatura?</AccordionTrigger>
                <AccordionContent>
                  Para cancelar sua assinatura, acesse a seção "Configurações" no menu lateral, depois clique na 
                  aba "Assinatura" e em seguida no botão "Portal do Cliente". Você será redirecionado para o portal 
                  seguro do Stripe onde poderá cancelar sua assinatura. O acesso permanecerá disponível até o final 
                  do período já pago. Não há multa ou taxa de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">O sistema é compatível com dispositivos móveis?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão é totalmente responsivo e funciona perfeitamente em computadores, tablets e 
                  smartphones. Você pode instalar como um aplicativo (PWA) diretamente no seu dispositivo móvel 
                  para ter acesso rápido. Todas as funcionalidades estão disponíveis em qualquer dispositivo, 
                  permitindo que você gerencie seu escritório de qualquer lugar, a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">Quanto espaço de armazenamento tenho?</AccordionTrigger>
                <AccordionContent>
                  Cada conta possui 25MB de armazenamento inicial para documentos, suficiente para milhares de 
                  arquivos PDF, imagens e documentos do escritório. O sistema monitora seu uso e exibe alertas 
                  quando necessário. Caso necessite de mais espaço, entre em contato conosco para discutir 
                  opções de armazenamento adicional personalizado para seu escritório.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">Como funciona a consulta DataJud CNJ?</AccordionTrigger>
                <AccordionContent>
                  O JusGestão integra com a API oficial do DataJud CNJ, permitindo consultar processos judiciais 
                  diretamente dos tribunais brasileiros. Você pode buscar por número de processo, CPF/CNPJ das partes, 
                  nome dos advogados e acompanhar movimentações processuais em tempo real. É uma ferramenta poderosa 
                  para acompanhamento processual e pesquisa jurisprudencial.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">O sistema possui controle financeiro?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão possui um módulo financeiro completo e seguro. Você pode registrar receitas, 
                  despesas, honorários, associar transações a clientes e processos específicos. O sistema gera 
                  relatórios detalhados, gráficos de desempenho financeiro e possui proteção por PIN para 
                  informações sensíveis. Todos os dados são criptografados e seguros.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">Posso gerenciar múltiplos colaboradores?</AccordionTrigger>
                <AccordionContent>
                  Sim! O JusGestão possui um sistema completo de gestão de equipe. Você pode cadastrar membros 
                  da equipe, delegar tarefas, acompanhar produtividade e definir níveis de acesso. Cada membro 
                  pode ter suas próprias responsabilidades e o sistema mantém registro de todas as atividades 
                  para controle e relatórios de produtividade.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">Quais ferramentas jurídicas estão disponíveis?</AccordionTrigger>
                <AccordionContent>
                  O sistema inclui diversas ferramentas: consulta de CEP pelos Correios, consulta de CNPJs e CPFs, 
                  calculadoras de prazos processuais, gerador de QR Code, conversor de documentos, gerador de 
                  assinatura eletrônica, consulta de feriados forenses e muito mais. Também temos integrações 
                  com sistemas de pagamento e estamos constantemente desenvolvendo novas ferramentas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent>
                  Absolutamente! O JusGestão utiliza criptografia de ponta a ponta, servidores seguros na nuvem, 
                  backups automáticos diários e proteção por PIN para dados financeiros. Seguimos as melhores 
                  práticas de segurança da indústria e estamos em conformidade com a LGPD. Seus dados nunca são 
                  compartilhados com terceiros e você tem controle total sobre suas informações.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">Como solicitar novas funcionalidades?</AccordionTrigger>
                <AccordionContent>
                  Valorizamos muito o feedback dos nossos usuários! Entre em contato pelo email 
                  suporte@sisjusgestao.com.br com suas sugestões e necessidades específicas. Nossa equipe 
                  avalia todas as solicitações e as inclui no roadmap de desenvolvimento. Muitas funcionalidades 
                  atuais foram criadas baseadas em sugestões dos nossos usuários.
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
