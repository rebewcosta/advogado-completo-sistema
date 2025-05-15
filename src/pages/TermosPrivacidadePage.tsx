
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermosPrivacidadePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Termos e Privacidade</h1>
          <div className="flex space-x-4 mb-6">
            <Button asChild variant="outline">
              <Link to="/">Voltar para a página inicial</Link>
            </Button>
          </div>

          <Tabs defaultValue="privacidade" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="privacidade">Política de Privacidade</TabsTrigger>
              <TabsTrigger value="termos">Termos de Uso</TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacidade" className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Política de Privacidade</h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Informações Coletadas</h3>
                  <p className="text-gray-700">
                    A JusGestão coleta informações que você fornece diretamente, como nome, endereço de e-mail, 
                    informações de contato e dados profissionais necessários para a prestação dos nossos serviços.
                    Também coletamos dados sobre o uso do sistema, incluindo registros de acesso, atividades 
                    realizadas e preferências de usuário.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Uso das Informações</h3>
                  <p className="text-gray-700">
                    Usamos suas informações para fornecer e melhorar nossos serviços, personalizar sua experiência, 
                    processar pagamentos, enviar notificações relacionadas à sua conta, e comunicar atualizações ou 
                    ofertas que possam ser de seu interesse.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Proteção de Dados</h3>
                  <p className="text-gray-700">
                    Implementamos medidas de segurança para proteger suas informações contra acesso, alteração, 
                    divulgação ou destruição não autorizados. Todos os dados são armazenados com criptografia e 
                    seguindo os mais altos padrões de segurança digital.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Compartilhamento de Dados</h3>
                  <p className="text-gray-700">
                    Não vendemos, comercializamos ou transferimos suas informações pessoais para terceiros. 
                    Podemos compartilhar dados com parceiros de confiança que nos ajudam em operações, serviços 
                    e atendimento ao cliente, sempre com obrigações contratuais de confidencialidade.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Seus Direitos</h3>
                  <p className="text-gray-700">
                    Você tem direito de acessar, corrigir, atualizar ou solicitar a exclusão de seus dados pessoais. 
                    Pode também solicitar a portabilidade de seus dados e expressar objeções quanto ao processamento 
                    de informações.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">6. Contato</h3>
                  <p className="text-gray-700">
                    Se você tiver dúvidas sobre nossa Política de Privacidade, entre em contato conosco através 
                    do e-mail suporte@sisjusgestao.com.br ou pelo telefone (88) 9.9998.1618.
                  </p>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="termos" className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Termos de Uso</h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-2">1. Aceitação dos Termos</h3>
                  <p className="text-gray-700">
                    Ao acessar ou utilizar o Sistema JusGestão, você concorda com estes Termos de Uso. 
                    Se não concordar com qualquer parte destes termos, não poderá acessar ou utilizar 
                    nossos serviços.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Licença de Uso</h3>
                  <p className="text-gray-700">
                    Concedemos uma licença limitada, não exclusiva e não transferível para utilizar o 
                    sistema de acordo com o plano contratado. Esta licença está condicionada ao pagamento 
                    das taxas aplicáveis e ao cumprimento destes Termos de Uso.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Responsabilidades do Usuário</h3>
                  <p className="text-gray-700">
                    Você é responsável por manter a confidencialidade de suas credenciais de acesso, 
                    por todas as atividades realizadas em sua conta e pela precisão dos dados inseridos 
                    no sistema. Compromete-se a não utilizar o serviço para qualquer finalidade ilegal 
                    ou não autorizada.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Pagamentos e Renovação</h3>
                  <p className="text-gray-700">
                    O uso do sistema está sujeito ao pagamento das taxas conforme o plano escolhido. 
                    A assinatura será renovada automaticamente ao final de cada período, a menos que 
                    seja cancelada com antecedência. Não há reembolsos para períodos parciais de serviço.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Propriedade Intelectual</h3>
                  <p className="text-gray-700">
                    O sistema JusGestão, incluindo código, design, funcionalidades e documentação, é 
                    propriedade exclusiva da empresa. Nenhuma parte do sistema pode ser copiada, modificada, 
                    distribuída ou reproduzida sem autorização expressa.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">6. Atualizações dos Termos</h3>
                  <p className="text-gray-700">
                    Estes termos podem ser atualizados periodicamente. Notificaremos sobre mudanças 
                    significativas, mas é sua responsabilidade revisar regularmente nossos Termos de Uso. 
                    O uso contínuo do sistema após alterações constitui aceitação dos novos termos.
                  </p>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosPrivacidadePage;
