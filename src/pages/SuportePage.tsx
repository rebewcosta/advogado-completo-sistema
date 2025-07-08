
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Send, Phone, Mail, HelpCircle, Instagram as InstagramIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuportePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Suporte ao Cliente</h1>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                <Mail className="h-6 w-6 text-lawyer-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Envie sua dúvida para nossa equipe</p>
              <a href="mailto:suporte@sisjusgestao.com.br" className="text-lawyer-primary hover:underline">suporte@sisjusgestao.com.br</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-green-50 p-3 rounded-full mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Telefone</h3>
              <p className="text-gray-600 mb-4">Atendimento em horário comercial</p>
              <a href="tel:+5588999981618" className="text-lawyer-primary hover:underline">(88) 9.9998-1618</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-pink-50 p-3 rounded-full mb-4">
                <InstagramIcon className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instagram</h3>
              <p className="text-gray-600 mb-4">Siga-nos e mande um direct</p>
              <a href="https://www.instagram.com/sisjusgestao/" target="_blank" rel="noopener noreferrer" className="text-lawyer-primary hover:underline">@sisjusgestao</a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <HelpCircle className="h-6 w-6 mr-2 text-lawyer-primary" />
              Perguntas Frequentes (FAQ)
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>O que é o JusGestão?</AccordionTrigger>
                <AccordionContent>
                  JusGestão é uma plataforma completa de gestão para escritórios de advocacia, que permite 
                  gerenciar processos, clientes, agenda, documentos, financeiro e muito mais. Desenvolvido 
                  especificamente para as necessidades do profissional jurídico brasileiro, inclui recursos 
                  como controle de prazos, relatórios financeiros, gestão de equipe, consulta DataJud CNJ 
                  e integração com ferramentas essenciais para advogados.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Quanto custa a assinatura do JusGestão?</AccordionTrigger>
                <AccordionContent>
                  A assinatura do JusGestão custa R$ 37,00 por mês, com acesso completo a todas as funcionalidades. 
                  Não há taxas de configuração, custos ocultos ou limitações de uso. O pagamento é mensal via cartão 
                  de crédito e você pode cancelar a qualquer momento sem multa ou fidelidade. Oferecemos 7 dias de 
                  teste gratuito SEM CARTÃO DE CRÉDITO para você conhecer todas as funcionalidades.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Como funciona o teste gratuito?</AccordionTrigger>
                <AccordionContent>
                  Oferecemos 7 dias de teste gratuito com acesso completo a todas as funcionalidades, 
                  SEM NECESSIDADE DE CARTÃO DE CRÉDITO! Basta se cadastrar e começar a usar imediatamente. 
                  Durante o período de teste, você pode cadastrar clientes, processos, usar todas as ferramentas 
                  e explorar o sistema completamente. Após os 7 dias, você pode escolher assinar para continuar usando.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Como posso cancelar minha assinatura?</AccordionTrigger>
                <AccordionContent>
                  Para cancelar sua assinatura, acesse a seção "Configurações" no menu lateral, depois clique na 
                  aba "Assinatura" e em seguida no botão "Portal do Cliente". Você será redirecionado para o portal 
                  seguro do Stripe onde poderá cancelar sua assinatura. O acesso permanecerá disponível até o final 
                  do período já pago. Não há multa ou taxa de cancelamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>O sistema é compatível com dispositivos móveis?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão é totalmente responsivo e funciona perfeitamente em computadores, tablets e 
                  smartphones. Você pode instalar como um aplicativo (PWA) diretamente no seu dispositivo móvel 
                  para ter acesso rápido. Todas as funcionalidades estão disponíveis em qualquer dispositivo, 
                  permitindo que você gerencie seu escritório de qualquer lugar, a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Quanto espaço de armazenamento tenho?</AccordionTrigger>
                <AccordionContent>
                  Cada conta possui 25MB de armazenamento inicial para documentos, suficiente para milhares de 
                  arquivos PDF, imagens e documentos do escritório. O sistema monitora seu uso e exibe alertas 
                  quando necessário. Caso necessite de mais espaço, entre em contato conosco para discutir 
                  opções de armazenamento adicional personalizado para seu escritório.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>Como funciona a consulta DataJud CNJ?</AccordionTrigger>
                <AccordionContent>
                  O JusGestão integra com a API oficial do DataJud CNJ, permitindo consultar processos judiciais 
                  diretamente dos tribunais brasileiros. Você pode buscar por número de processo, CPF/CNPJ das partes, 
                  nome dos advogados e acompanhar movimentações processuais em tempo real. É uma ferramenta poderosa 
                  para acompanhamento processual e pesquisa jurisprudencial.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger>O sistema possui controle financeiro?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão possui um módulo financeiro completo e seguro. Você pode registrar receitas, 
                  despesas, honorários, associar transações a clientes e processos específicos. O sistema gera 
                  relatórios detalhados, gráficos de desempenho financeiro e possui proteção por PIN para 
                  informações sensíveis. Todos os dados são criptografados e seguros.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-9">
                <AccordionTrigger>Posso gerenciar múltiplos colaboradores?</AccordionTrigger>
                <AccordionContent>
                  Sim! O JusGestão possui um sistema completo de gestão de equipe. Você pode cadastrar membros 
                  da equipe, delegar tarefas, acompanhar produtividade e definir níveis de acesso. Cada membro 
                  pode ter suas próprias responsabilidades e o sistema mantém registro de todas as atividades 
                  para controle e relatórios de produtividade.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-10">
                <AccordionTrigger>Quais ferramentas jurídicas estão disponíveis?</AccordionTrigger>
                <AccordionContent>
                  O sistema inclui diversas ferramentas: consulta de CEP pelos Correios, consulta de CNPJs e CPFs, 
                  calculadoras de prazos processuais, gerador de QR Code, conversor de documentos, gerador de 
                  assinatura eletrônica, consulta de feriados forenses e muito mais. Também temos integrações 
                  com sistemas de pagamento e estamos constantemente desenvolvendo novas ferramentas.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-11">
                <AccordionTrigger>Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent>
                  Absolutamente! O JusGestão utiliza criptografia de ponta a ponta, servidores seguros na nuvem, 
                  backups automáticos diários e proteção por PIN para dados financeiros. Seguimos as melhores 
                  práticas de segurança da indústria e estamos em conformidade com a LGPD. Seus dados nunca são 
                  compartilhados com terceiros e você tem controle total sobre suas informações.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-12">
                <AccordionTrigger>Como solicitar novas funcionalidades?</AccordionTrigger>
                <AccordionContent>
                  Valorizamos muito o feedback dos nossos usuários! Entre em contato pelo email 
                  suporte@sisjusgestao.com.br com suas sugestões e necessidades específicas. Nossa equipe 
                  avalia todas as solicitações e as inclui no roadmap de desenvolvimento. Muitas funcionalidades 
                  atuais foram criadas baseadas em sugestões dos nossos usuários.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="bg-lawyer-primary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center text-lawyer-dark">Não encontrou o que procurava?</h2>
            <p className="text-center mb-6 text-gray-700">Entre em contato diretamente com nossa equipe através do formulário abaixo.</p>
            
            <form action="https://formsubmit.co/suporte@sisjusgestao.com.br" method="POST" className="max-w-md mx-auto">
               {/* Configurações do FormSubmit */}
              <input type="hidden" name="_captcha" value="false" /> 
              <input type="hidden" name="_next" value="https://sisjusgestao.com.br/suporte?email_enviado=true" />
              <input type="hidden" name="_subject" value="Nova Mensagem de Contato - Suporte JusGestão" />
              <input type="hidden" name="_template" value="table" />

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="name_suporte_form">
                    Nome
                  </label>
                  <input
                    id="name_suporte_form"
                    type="text" name="name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-lawyer-primary focus:border-lawyer-primary"
                    placeholder="Seu nome" required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="email_suporte_form">
                    Email
                  </label>
                  <input
                    id="email_suporte_form"
                    type="email" name="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-lawyer-primary focus:border-lawyer-primary"
                    placeholder="seu.email@exemplo.com" required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="message_suporte_form">
                    Mensagem
                  </label>
                  <textarea
                    id="message_suporte_form" name="message"
                    className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-lawyer-primary focus:border-lawyer-primary"
                    placeholder="Descreva sua dúvida em detalhes" required
                  ></textarea>
                </div>
                
                <Button className="w-full bg-lawyer-primary hover:bg-lawyer-primary/90" type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuportePage;
