
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Send, Phone, Mail, HelpCircle } from 'lucide-react';
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
              <a href="tel:+5588999981618" className="text-lawyer-primary hover:underline">(88) 9.9998.1618</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-purple-50 p-3 rounded-full mb-4">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Documentação</h3>
              <p className="text-gray-600 mb-4">Acesse nossos tutoriais</p>
              <Link to="/suporte/documentacao" className="text-lawyer-primary hover:underline">Ver tutoriais</Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>O que é o JusGestão?</AccordionTrigger>
                <AccordionContent>
                  JusGestão é uma plataforma completa para gestão de escritórios de advocacia, que permite 
                  gerenciar processos, clientes, agenda, documentos, financeiro e muito mais. Desenvolvido 
                  especificamente para as necessidades do profissional jurídico brasileiro.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Quanto custa a assinatura do JusGestão?</AccordionTrigger>
                <AccordionContent>
                  A assinatura do JusGestão custa R$ 127,00 por mês, com acesso completo a todas as funcionalidades. 
                  Não há taxas de configuração ou custos ocultos. O pagamento é mensal e você pode cancelar a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Como posso cancelar minha assinatura?</AccordionTrigger>
                <AccordionContent>
                  Para cancelar sua assinatura, acesse a seção "Perfil" em seu painel, e depois clique em "Gerenciar Assinatura". 
                  Você será redirecionado para o portal do cliente onde poderá cancelar a assinatura. O acesso permanecerá 
                  disponível até o final do período já pago.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>O sistema é compatível com dispositivos móveis?</AccordionTrigger>
                <AccordionContent>
                  Sim, o JusGestão é totalmente responsivo e funciona em computadores, tablets e smartphones, 
                  permitindo que você gerencie seu escritório de qualquer lugar, a qualquer momento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Quanto espaço de armazenamento eu tenho?</AccordionTrigger>
                <AccordionContent>
                  Cada conta possui 25MB de armazenamento para documentos. Caso necessite de mais espaço, 
                  entre em contato conosco para discutir opções de armazenamento adicional.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Como faço para solicitar novas funcionalidades?</AccordionTrigger>
                <AccordionContent>
                  Valorizamos o feedback dos nossos usuários! Entre em contato pelo email suporte@sisjusgestao.com.br 
                  com suas sugestões. Nossa equipe avalia todas as solicitações para inclusão em futuras atualizações.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>É possível integrar o JusGestão com outros sistemas?</AccordionTrigger>
                <AccordionContent>
                  Atualmente trabalhamos para desenvolver integrações com sistemas judiciais e plataformas populares. 
                  Se você precisa de uma integração específica, entre em contato conosco para verificarmos a viabilidade.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="bg-lawyer-primary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Não encontrou o que procurava?</h2>
            <p className="text-center mb-6">Entre em contato diretamente com nossa equipe</p>
            
            <form className="max-w-md mx-auto">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="message">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    className="w-full p-2 border rounded-md h-32"
                    placeholder="Descreva sua dúvida em detalhes"
                  ></textarea>
                </div>
                
                <Button className="w-full" type="submit">
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
