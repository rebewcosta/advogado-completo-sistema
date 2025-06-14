
export class BaseScraper {
  protected readonly timeoutMs = 10000; // 10 segundos timeout

  protected limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '') // Remove caracteres especiais
      .trim()
      .substring(0, 1000); // Limita tamanho
  }

  protected async fetchWithTimeout(url: string): Promise<Response> {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(this.timeoutMs)
    });
  }

  protected buscarNomesNoHtml(html: string, nomes: string[], estadoSigla: string, estadoNome: string, url: string) {
    const publicacoes: any[] = [];
    
    for (const nome of nomes) {
      if (html.toLowerCase().includes(nome.toLowerCase())) {
        const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
        const matches = html.match(regex);
        
        if (matches) {
          for (const match of matches) {
            publicacoes.push({
              nome_advogado: nome,
              titulo_publicacao: `Publicação no Diário Oficial ${estadoSigla}`,
              conteudo_publicacao: this.limparTexto(match),
              data_publicacao: new Date().toISOString().split('T')[0],
              diario_oficial: `Diário Oficial do Estado ${estadoNome}`,
              estado: estadoSigla,
              url_publicacao: url
            });
          }
        }
      }
    }
    
    return publicacoes;
  }
}
