
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
                  gerenciar processos, clientes, agenda, documentos, financeiro e muito mais. O sistema inclui 
                  Dashboard para visão geral, Ferramentas jurídicas, gestão de Meus Processos, cadastro de Clientes, 
                  controle de Equipe, Agenda de compromissos, controle de Prazos, gestão de Tarefas, módulo Financeiro, 
                  armazenamento de Documentos, Relatórios detalhados e Configurações personalizáveis.
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
                  Durante o período de teste, você pode usar o Dashboard, cadastrar clientes e processos, 
                  usar todas as Ferramentas, gerenciar sua Agenda, controlar Prazos e Tarefas, explorar 
                  o módulo Financeiro, armazenar Documentos e gerar Relatórios.
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
                  para ter acesso rápido. Todas as funcionalidades estão disponíveis em qualquer dispositivo: 
                  Dashboard, Processos, Clientes, Agenda, Prazos, Tarefas, Financeiro, Documentos e Relatórios.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">Quanto espaço de armazenamento tenho?</AccordionTrigger>
                <AccordionContent>
                  Cada conta possui 10MB de armazenamento inicial para documentos, suficiente para centenas de 
                  arquivos PDF, imagens e documentos do escritório. O sistema monitora seu uso na seção Documentos 
                  e exibe alertas quando necessário. Caso necessite de mais espaço, entre em contato conosco para 
                  discutir opções de armazenamento adicional personalizado para seu escritório.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">Como funciona o módulo Financeiro?</AccordionTrigger>
                <AccordionContent>
                  O módulo Financeiro do JusGestão é completo e seguro. Você pode registrar receitas, despesas, 
                  honorários, associar transações a clientes e processos específicos. O sistema gera relatórios 
                  detalhados, gráficos de desempenho financeiro e possui proteção por PIN para informações sensíveis. 
                  Todos os dados são criptografados e seguros, accessible através do menu Financeiro.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">Posso gerenciar múltiplos colaboradores?</AccordionTrigger>
                <AccordionContent>
                  Sim! O JusGestão possui um sistema completo de gestão de equipe através do menu Equipe. Você pode 
                  cadastrar membros da equipe, delegar tarefas, acompanhar produtividade e definir níveis de acesso. 
                  Cada membro pode ter suas próprias responsabilidades e o sistema mantém registro de todas as atividades 
                  para controle e relatórios de produtividade.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left">Quais ferramentas jurídicas estão disponíveis?</AccordionTrigger>
                <AccordionContent>
                  O sistema inclui diversas ferramentas acessíveis pelo menu Ferramentas: consulta de CEP pelos 
                  Correios, consulta de CNPJs e CPFs, calculadoras de prazos processuais, gerador de QR Code, 
                  conversor de documentos, gerador de assinatura eletrônica, consulta de feriados forenses e muito mais. 
                  Também temos integrações com sistemas de pagamento e estamos constantemente desenvolvendo novas ferramentas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left">Como funciona o controle de Prazos e Agenda?</AccordionTrigger>
                <AccordionContent>
                  O JusGestão possui módulos dedicados para Prazos e Agenda. No menu Prazos, você pode configurar 
                  alertas automáticos, calcular prazos processuais e receber notificações antecipadas. A Agenda 
                  permite agendar compromissos, audiências, reuniões com clientes e associá-los a processos específicos. 
                  Ambos os módulos são integrados e ajudam a nunca perder um prazo importante.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger className="text-left">Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent>
                  Absolutamente! O JusGestão utiliza criptografia de ponta a ponta, servidores seguros na nuvem, 
                  backups automáticos diários e proteção por PIN para dados financeiros. Seguimos as melhores 
                  práticas de segurança da indústria e estamos em conformidade com a LGPD. Seus dados nunca são 
                  compartilhados com terceiros e você tem controle total sobre suas informações através das Configurações.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger className="text-left">Como gerar relatórios do meu escritório?</AccordionTrigger>
                <AccordionContent>
                  O menu Relatórios oferece uma visão completa do seu escritório com relatórios de produtividade, 
                  financeiros, de processos, clientes ativos, tarefas concluídas e muito mais. Os relatórios podem 
                  ser filtrados por período, cliente, tipo de processo e outros critérios. Você pode visualizar 
                  gráficos interativos e exportar dados para análises mais detalhadas.
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
