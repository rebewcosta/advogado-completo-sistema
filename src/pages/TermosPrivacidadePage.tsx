
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
                  <p className="text-gray-700 mt-2">
                    Para utilizar nossos serviços, podemos solicitar:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Dados pessoais como nome, email, telefone e endereço</li>
                    <li>Dados profissionais como OAB e especialidades jurídicas</li>
                    <li>Informações para faturamento e pagamento</li>
                    <li>Dados dos seus clientes para gestão de processos</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Uso das Informações</h3>
                  <p className="text-gray-700">
                    Usamos suas informações para fornecer e melhorar nossos serviços, personalizar sua experiência, 
                    processar pagamentos, enviar notificações relacionadas à sua conta, e comunicar atualizações ou 
                    ofertas que possam ser de seu interesse.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Especificamente, utilizamos seus dados para:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Autenticar seu acesso ao sistema</li>
                    <li>Processar pagamentos de assinatura</li>
                    <li>Enviar comunicações importantes sobre sua conta</li>
                    <li>Fornecer suporte técnico e atendimento ao cliente</li>
                    <li>Melhorar nossos serviços com base no feedback e uso</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Proteção de Dados</h3>
                  <p className="text-gray-700">
                    Implementamos medidas de segurança para proteger suas informações contra acesso, alteração, 
                    divulgação ou destruição não autorizados. Todos os dados são armazenados com criptografia e 
                    seguindo os mais altos padrões de segurança digital.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Nossas medidas de proteção incluem:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Criptografia de dados em trânsito e em repouso</li>
                    <li>Controles de acesso rigorosos para funcionários</li>
                    <li>Monitoramento contínuo para detecção de ameaças</li>
                    <li>Backups regulares para prevenir perda de dados</li>
                    <li>Atualizações de segurança constantes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Compartilhamento de Dados</h3>
                  <p className="text-gray-700">
                    Não vendemos, comercializamos ou transferimos suas informações pessoais para terceiros. 
                    Podemos compartilhar dados com parceiros de confiança que nos ajudam em operações, serviços 
                    e atendimento ao cliente, sempre com obrigações contratuais de confidencialidade.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Compartilhamos informações apenas nas seguintes circunstâncias:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Com fornecedores de serviços que nos ajudam a operar (processadores de pagamento, serviços de hospedagem)</li>
                    <li>Quando exigido por lei ou ordem judicial</li>
                    <li>Para proteger nossos direitos, propriedade ou segurança</li>
                    <li>Com seu consentimento explícito e prévio</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Seus Direitos</h3>
                  <p className="text-gray-700">
                    Você tem direito de acessar, corrigir, atualizar ou solicitar a exclusão de seus dados pessoais. 
                    Pode também solicitar a portabilidade de seus dados e expressar objeções quanto ao processamento 
                    de informações.
                  </p>
                  <p className="text-gray-700 mt-2">
                    De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem os seguintes direitos:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Confirmação da existência de tratamento de dados</li>
                    <li>Acesso aos dados</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos</li>
                    <li>Portabilidade dos dados</li>
                    <li>Revogação do consentimento</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">6. Contato</h3>
                  <p className="text-gray-700">
                    Se você tiver dúvidas sobre nossa Política de Privacidade, entre em contato conosco através 
                    do e-mail suporte@sisjusgestao.com.br ou pelo telefone (88) 9.9998.1618.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">7. Cookies e Tecnologias Semelhantes</h3>
                  <p className="text-gray-700">
                    Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, analisar o tráfego e personalizar o conteúdo.
                    Ao utilizar nosso site e serviços, você concorda com o uso destas tecnologias.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Tipos de cookies que utilizamos:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Essenciais: necessários para o funcionamento do site</li>
                    <li>Funcionais: permitem recursos avançados e preferências</li>
                    <li>Analíticos: nos ajudam a entender como você usa o serviço</li>
                    <li>De autenticação: mantêm você conectado durante sua sessão</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold mb-2">8. Atualizações desta Política</h3>
                  <p className="text-gray-700">
                    Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos sobre mudanças 
                    significativas através de um aviso em nosso site ou por e-mail. Recomendamos revisar esta página 
                    regularmente para estar ciente de quaisquer alterações.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Última atualização: 15 de Maio de 2025
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
                  <p className="text-gray-700 mt-2">
                    O acesso e uso do JusGestão são regidos por estes Termos de Uso, bem como todas as leis e 
                    regulamentos aplicáveis. A continuidade do uso após qualquer modificação dos termos constituirá 
                    sua aceitação das alterações.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">2. Licença de Uso</h3>
                  <p className="text-gray-700">
                    Concedemos uma licença limitada, não exclusiva e não transferível para utilizar o 
                    sistema de acordo com o plano contratado. Esta licença está condicionada ao pagamento 
                    das taxas aplicáveis e ao cumprimento destes Termos de Uso.
                  </p>
                  <p className="text-gray-700 mt-2">
                    A licença permite:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Acesso e uso do software JusGestão através de um navegador web</li>
                    <li>Armazenamento de dados dentro dos limites do plano contratado</li>
                    <li>Utilização das funcionalidades do sistema para fins legítimos relacionados à gestão de escritório de advocacia</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">3. Responsabilidades do Usuário</h3>
                  <p className="text-gray-700">
                    Você é responsável por manter a confidencialidade de suas credenciais de acesso, 
                    por todas as atividades realizadas em sua conta e pela precisão dos dados inseridos 
                    no sistema. Compromete-se a não utilizar o serviço para qualquer finalidade ilegal 
                    ou não autorizada.
                  </p>
                  <p className="text-gray-700 mt-2">
                    O usuário concorda em:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Fornecer informações verdadeiras, precisas e completas</li>
                    <li>Manter e atualizar prontamente suas informações</li>
                    <li>Não compartilhar suas credenciais de acesso</li>
                    <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
                    <li>Não usar o serviço para fins ilegais ou que violem direitos de terceiros</li>
                    <li>Não tentar acessar, modificar ou interferir em áreas do sistema que não sejam explicitamente autorizadas</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">4. Pagamentos e Renovação</h3>
                  <p className="text-gray-700">
                    O uso do sistema está sujeito ao pagamento das taxas conforme o plano escolhido. 
                    A assinatura será renovada automaticamente ao final de cada período, a menos que 
                    seja cancelada com antecedência. Não há reembolsos para períodos parciais de serviço.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Detalhes importantes sobre pagamentos:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>O valor da mensalidade é cobrado antecipadamente</li>
                    <li>Para cancelamentos, não há reembolso proporcional do período já iniciado</li>
                    <li>A renovação automática ocorre na data de aniversário da assinatura</li>
                    <li>Em caso de falha no pagamento, o acesso ao sistema poderá ser suspenso após 5 dias</li>
                    <li>Após 30 dias de inadimplência, a conta poderá ser desativada</li>
                    <li>Reservamo-nos o direito de alterar os preços mediante aviso prévio de 30 dias</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">5. Propriedade Intelectual</h3>
                  <p className="text-gray-700">
                    O sistema JusGestão, incluindo código, design, funcionalidades e documentação, é 
                    propriedade exclusiva da empresa. Nenhuma parte do sistema pode ser copiada, modificada, 
                    distribuída ou reproduzida sem autorização expressa.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Isso inclui, mas não se limita a:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-700">
                    <li>Código-fonte e código objeto</li>
                    <li>Design visual e interface do usuário</li>
                    <li>Logotipos e marcas registradas</li>
                    <li>Documentação, tutoriais e materiais de treinamento</li>
                    <li>Estruturas de banco de dados e modelos de dados</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Os dados inseridos pelo usuário permanecem de propriedade do usuário, com o direito de exportá-los a qualquer momento.
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
                
                <section>
                  <h3 className="text-xl font-semibold mb-2">7. Disponibilidade e Suporte</h3>
                  <p className="text-gray-700">
                    Nos esforçamos para manter o JusGestão disponível 24 horas por dia, 7 dias por semana, 
                    exceto durante manutenções programadas. O suporte técnico está disponível em horário 
                    comercial através dos canais oficiais de atendimento.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Embora nos esforcemos para manter o sistema sempre operacional, não podemos garantir 100% de 
                    disponibilidade ininterrupta. Manutenções programadas serão notificadas com antecedência 
                    sempre que possível.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">8. Limitação de Responsabilidade</h3>
                  <p className="text-gray-700">
                    O JusGestão é fornecido "como está" e "como disponível". Não oferecemos garantias de qualquer 
                    tipo, expressas ou implícitas, sobre a precisão, confiabilidade ou adequação do sistema 
                    para um propósito específico.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, 
                    incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar o 
                    sistema, mesmo se avisados sobre a possibilidade de tais danos.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">9. Rescisão</h3>
                  <p className="text-gray-700">
                    Podemos encerrar ou suspender seu acesso ao JusGestão imediatamente, sem aviso prévio ou 
                    responsabilidade, por qualquer motivo, incluindo, sem limitação, a violação dos Termos de Uso.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Você pode cancelar sua assinatura a qualquer momento através da área do cliente. 
                    Após a rescisão, seu direito de usar o sistema cessará imediatamente. Todas as disposições 
                    dos Termos que, por sua natureza, devam sobreviver à rescisão, sobreviverão.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-2">10. Legislação Aplicável</h3>
                  <p className="text-gray-700">
                    Estes termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil, 
                    independentemente dos princípios de conflitos de leis.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Qualquer disputa decorrente ou relacionada a estes termos será submetida à jurisdição 
                    exclusiva dos tribunais da Comarca de Iguatu, Ceará.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Última atualização: 15 de Maio de 2025
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
