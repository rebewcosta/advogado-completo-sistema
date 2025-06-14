
export interface PublicacaoMock {
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
}

export class MockDataService {
  private readonly mockPublicacoes: PublicacaoMock[] = [
    {
      nome_advogado: "Pollyanna Silva Guimarães",
      titulo_publicacao: "Audiência de Conciliação - Processo 1234567-12.2024.8.26.0001",
      conteudo_publicacao: "Fica intimada a advogada Pollyanna Silva Guimarães, OAB/SP 123456, para comparecer à audiência de conciliação designada para o dia 20/06/2024, às 14h00, na sala de audiências do 1º Juizado Especial Cível da Comarca de São Paulo. O não comparecimento implicará em revelia.",
      data_publicacao: new Date().toISOString().split('T')[0],
      diario_oficial: "Diário da Justiça Eletrônico - TJ-SP",
      estado: "SP",
      comarca: "São Paulo",
      numero_processo: "1234567-12.2024.8.26.0001",
      tipo_publicacao: "Intimação",
      url_publicacao: "https://dje.tjsp.jus.br/cdje/consultaSimples.do?cdVolume=10&nuDiario=2024"
    },
    {
      nome_advogado: "Pollyanna Silva Guimarães",
      titulo_publicacao: "Sentença Proferida - Ação de Indenização",
      conteudo_publicacao: "Vistos. Trata-se de ação de indenização por danos morais e materiais proposta por Maria da Silva contra João Santos, sendo a requerente representada pela advogada Pollyanna Silva Guimarães. Após análise dos autos, JULGO PROCEDENTE o pedido inicial, condenando o réu ao pagamento de R$ 15.000,00 a título de danos morais. Publique-se. Registre-se. Intimem-se.",
      data_publicacao: new Date(Date.now() - 86400000).toISOString().split('T')[0], // ontem
      diario_oficial: "Diário Oficial da Justiça - TJ-RJ",
      estado: "RJ",
      comarca: "Rio de Janeiro",
      numero_processo: "0987654-21.2024.8.19.0001",
      tipo_publicacao: "Sentença",
      url_publicacao: "https://www3.tjrj.jus.br/dje/"
    },
    {
      nome_advogado: "Pollyanna Silva Guimarães",
      titulo_publicacao: "Despacho - Pedido de Tutela Antecipada",
      conteudo_publicacao: "Defiro o pedido de tutela antecipada formulado pela requerente, através de sua advogada Pollyanna Silva Guimarães, determinando que a requerida se abstenha de realizar cobranças indevidas até o julgamento final da demanda. Intime-se com urgência.",
      data_publicacao: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 dias atrás
      diario_oficial: "DJe - Tribunal de Justiça de Minas Gerais",
      estado: "MG",
      comarca: "Belo Horizonte",
      numero_processo: "5555444-33.2024.8.13.0001",
      tipo_publicacao: "Despacho",
      url_publicacao: "https://www8.tjmg.jus.br/dje/"
    }
  ];

  async gerarPublicacoesMock(nomes: string[]): Promise<PublicacaoMock[]> {
    // Filtra publicações que correspondem aos nomes buscados
    const publicacoesFiltradas = this.mockPublicacoes.filter(pub => 
      nomes.some(nome => 
        nome.toLowerCase().includes(pub.nome_advogado.toLowerCase()) ||
        pub.nome_advogado.toLowerCase().includes(nome.toLowerCase())
      )
    );

    console.log(`📄 Mock: Gerando ${publicacoesFiltradas.length} publicações de exemplo para demonstração`);
    
    return publicacoesFiltradas;
  }

  async verificarStatusApis(): Promise<{ status: string; detalhes: string[] }> {
    const detalhes = [
      "🔴 TJ-SP: API requer autenticação paga (HTTP 404)",
      "🔴 TJ-RJ: Acesso negado (HTTP 403)", 
      "🔴 TJ-RS: Timeout de conexão (30s)",
      "🔴 TJ-CE: Timeout de conexão (30s)",
      "🟡 CNJ: API oficial indisponível (HTTP 404)",
      "🔴 Jusbrasil: Endpoint não encontrado (HTTP 404)",
      "⚠️  A maioria das APIs dos tribunais não são públicas ou requerem credenciamento"
    ];

    return {
      status: "APIs_INDISPONIVEIS_PUBLICAMENTE",
      detalhes
    };
  }
}
