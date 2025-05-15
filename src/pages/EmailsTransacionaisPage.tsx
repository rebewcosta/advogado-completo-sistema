
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailsTransacionaisPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Emails Transacionais</h1>
          <Link 
            to="/configuracoes" 
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para Configurações
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Aqui estão todos os emails transacionais que o sistema envia automaticamente aos usuários. 
            Esses emails ajudam a manter seus clientes informados sobre o status de suas assinaturas e contas.
          </p>

          <Tabs defaultValue="assinatura">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
              <TabsTrigger value="conta">Conta</TabsTrigger>
              <TabsTrigger value="sistema">Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="assinatura">
              <div className="space-y-8">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Confirmação de Assinatura</h3>
                  <p className="text-gray-600 mb-2">Enviado quando um usuário assina o plano com sucesso.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Assinatura JusGestão Confirmada</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Sua assinatura do JusGestão foi confirmada com sucesso!</p>
                      <br />
                      <p>Detalhes da assinatura:</p>
                      <p>- Plano: JusGestão Mensal</p>
                      <p>- Valor: R$ 127,00/mês</p>
                      <p>- Data de início: [Data atual]</p>
                      <p>- Próxima cobrança: [Data + 30 dias]</p>
                      <br />
                      <p>Você já pode acessar todos os recursos premium da plataforma.</p>
                      <p>Para gerenciar sua assinatura, acesse a área "Perfil" no seu painel.</p>
                      <br />
                      <p>Obrigado por escolher o JusGestão!</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Lembrete de Renovação</h3>
                  <p className="text-gray-600 mb-2">Enviado 3 dias antes da renovação automática da assinatura.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Sua assinatura JusGestão será renovada em breve</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Este é um lembrete de que sua assinatura do JusGestão será renovada automaticamente em 3 dias.</p>
                      <br />
                      <p>Detalhes da renovação:</p>
                      <p>- Plano: JusGestão Mensal</p>
                      <p>- Valor: R$ 127,00</p>
                      <p>- Data da renovação: [Data da renovação]</p>
                      <br />
                      <p>Caso deseje cancelar ou modificar sua assinatura, acesse a área "Perfil" no seu painel antes da data de renovação.</p>
                      <br />
                      <p>Obrigado por continuar com o JusGestão!</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Problema no Pagamento</h3>
                  <p className="text-gray-600 mb-2">Enviado quando ocorre uma falha na cobrança da assinatura.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Ação necessária: Problema com o pagamento da sua assinatura</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Identificamos um problema com o pagamento da sua assinatura do JusGestão.</p>
                      <br />
                      <p>Detalhes do problema:</p>
                      <p>- Plano: JusGestão Mensal</p>
                      <p>- Valor: R$ 127,00</p>
                      <p>- Data da tentativa: [Data atual]</p>
                      <br />
                      <p>Para manter o acesso ininterrupto ao sistema, por favor, atualize suas informações de pagamento o quanto antes no portal do cliente.</p>
                      <p>Tentaremos uma nova cobrança em 48 horas.</p>
                      <br />
                      <p>Se precisar de ajuda, entre em contato com nosso suporte.</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Confirmação de Cancelamento</h3>
                  <p className="text-gray-600 mb-2">Enviado quando um usuário cancela sua assinatura.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Cancelamento da assinatura JusGestão confirmado</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Confirmamos o cancelamento da sua assinatura do JusGestão.</p>
                      <br />
                      <p>Você continuará tendo acesso a todos os recursos do sistema até [Data fim do período].</p>
                      <p>Após esta data, sua conta permanecerá ativa, mas com acesso limitado.</p>
                      <br />
                      <p>Se você mudou de ideia ou cancelou por engano, você pode reativar sua assinatura a qualquer momento antes do término do período atual.</p>
                      <br />
                      <p>Gostaríamos muito de saber o motivo do cancelamento para melhorarmos nossos serviços. Por favor, responda este email com seus comentários.</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conta">
              <div className="space-y-8">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Confirmação de Cadastro</h3>
                  <p className="text-gray-600 mb-2">Enviado quando um usuário cria uma conta no sistema.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Bem-vindo ao JusGestão!</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Bem-vindo(a) ao JusGestão! Sua conta foi criada com sucesso.</p>
                      <br />
                      <p>Para começar a usar todas as funcionalidades do sistema, complete seu cadastro e assine um plano.</p>
                      <br />
                      <p>Seus dados de acesso:</p>
                      <p>- Email: [Email do usuário]</p>
                      <p>- Senha: A senha que você definiu no cadastro</p>
                      <br />
                      <p>Se tiver qualquer dúvida, nossa equipe de suporte está à disposição.</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Recuperação de Senha</h3>
                  <p className="text-gray-600 mb-2">Enviado quando um usuário solicita redefinição de senha.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Redefinição de senha JusGestão</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá,</p>
                      <br />
                      <p>Recebemos uma solicitação para redefinir a senha da sua conta JusGestão.</p>
                      <p>Clique no link abaixo para criar uma nova senha:</p>
                      <p>[Link de redefinição]</p>
                      <br />
                      <p>Este link é válido por 24 horas.</p>
                      <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail ou entre em contato com nosso suporte.</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sistema">
              <div className="space-y-8">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Alerta de Limite de Armazenamento</h3>
                  <p className="text-gray-600 mb-2">Enviado quando o usuário atinge 80% do espaço de armazenamento.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Seu armazenamento no JusGestão está quase cheio</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Você está utilizando mais de 80% do seu espaço de armazenamento no JusGestão.</p>
                      <br />
                      <p>Detalhes do uso:</p>
                      <p>- Espaço utilizado: [Espaço usado] de 25MB</p>
                      <p>- Porcentagem: [Porcentagem]%</p>
                      <br />
                      <p>Para evitar problemas ao salvar novos documentos, recomendamos que você:</p>
                      <p>1. Revise e exclua arquivos desnecessários</p>
                      <p>2. Compacte documentos grandes</p>
                      <p>3. Entre em contato com o suporte caso necessite de mais espaço</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">Notificação de Manutenção</h3>
                  <p className="text-gray-600 mb-2">Enviado antes de manutenções programadas no sistema.</p>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <p className="font-semibold">Assunto: Manutenção Programada do JusGestão</p>
                    <div className="mt-2 border-l-4 border-lawyer-primary pl-3">
                      <p>Olá [Nome do Cliente],</p>
                      <br />
                      <p>Informamos que realizaremos uma manutenção programada no sistema JusGestão.</p>
                      <br />
                      <p>Detalhes da manutenção:</p>
                      <p>- Data: [Data da manutenção]</p>
                      <p>- Horário: [Hora inicial] às [Hora final]</p>
                      <p>- Duração estimada: [Duração] horas</p>
                      <br />
                      <p>Durante este período, o sistema ficará temporariamente indisponível.</p>
                      <p>Esta manutenção é necessária para implementar melhorias e garantir a estabilidade do serviço.</p>
                      <br />
                      <p>Pedimos desculpas pelo inconveniente e agradecemos sua compreensão.</p>
                      <br />
                      <p>Atenciosamente,</p>
                      <p>Equipe JusGestão</p>
                      <p>suporte@sisjusgestao.com.br</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailsTransacionaisPage;
