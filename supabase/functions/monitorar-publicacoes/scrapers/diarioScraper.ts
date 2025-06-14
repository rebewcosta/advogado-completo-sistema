export interface PublicacaoEncontrada {
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

export class DiarioScraper {
  private readonly timeoutMs = 10000; // 10 segundos timeout

  async buscarPublicacoesSP(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de São Paulo...');
      
      const url = 'https://www.imprensaoficial.com.br/DO/BuscaDO2001Resultado_11_3.aspx';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      for (const nome of nomes) {
        if (html.toLowerCase().includes(nome.toLowerCase())) {
          const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
          const matches = html.match(regex);
          
          if (matches) {
            for (const match of matches) {
              publicacoes.push({
                nome_advogado: nome,
                titulo_publicacao: 'Publicação no Diário Oficial SP',
                conteudo_publicacao: this.limparTexto(match),
                data_publicacao: new Date().toISOString().split('T')[0],
                diario_oficial: 'Diário Oficial do Estado de São Paulo',
                estado: 'SP',
                url_publicacao: url
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SP:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesRJ(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio de Janeiro...');
      
      const url = 'http://www.ioerj.com.br/portal/modules/conteudoonline/mostra_edicao.php';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial RJ',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Rio de Janeiro',
                  estado: 'RJ',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RJ:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesMG(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Minas Gerais...');
      
      const url = 'https://www.jornalminasgerais.mg.gov.br/';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial MG',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Minas Gerais',
                  estado: 'MG',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MG:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesRS(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio Grande do Sul...');
      
      const url = 'https://www.corag.com.br/doe';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial RS',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Rio Grande do Sul',
                  estado: 'RS',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RS:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesCE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Ceará...');
      
      const url = 'https://www.doe.seplag.ce.gov.br/';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial CE',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Ceará',
                  estado: 'CE',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do CE:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesPR(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Paraná...');
      
      const url = 'https://www.aen.pr.gov.br/Diario';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial PR',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Paraná',
                  estado: 'PR',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PR:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesSC(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Santa Catarina...');
      
      const url = 'https://doe.sea.sc.gov.br/';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial SC',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Santa Catarina',
                  estado: 'SC',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SC:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesBA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial da Bahia...');
      
      const url = 'http://www.egba.ba.gov.br/';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial BA',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado da Bahia',
                  estado: 'BA',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário da BA:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesGO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Goiás...');
      
      const url = 'https://www.dio.go.gov.br/';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial GO',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Goiás',
                  estado: 'GO',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de GO:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesPE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Pernambuco...');
      
      const url = 'https://www.cepe.com.br/diario-oficial';
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        const html = await response.text();
        
        for (const nome of nomes) {
          if (html.toLowerCase().includes(nome.toLowerCase())) {
            const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
            const matches = html.match(regex);
            
            if (matches) {
              for (const match of matches) {
                publicacoes.push({
                  nome_advogado: nome,
                  titulo_publicacao: 'Publicação no Diário Oficial PE',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Pernambuco',
                  estado: 'PE',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de PE:', error);
    }
    
    return publicacoes;
  }

  private limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '') // Remove caracteres especiais
      .trim()
      .substring(0, 1000); // Limita tamanho
  }

  async buscarEmTodosEstados(nomes: string[], estadosFiltro: string[] = []): Promise<PublicacaoEncontrada[]> {
    const todasPublicacoes: PublicacaoEncontrada[] = [];
    
    const scrapers = [
      { estado: 'SP', scraper: () => this.buscarPublicacoesSP(nomes) },
      { estado: 'RJ', scraper: () => this.buscarPublicacoesRJ(nomes) },
      { estado: 'CE', scraper: () => this.buscarPublicacoesCE(nomes) },
      { estado: 'MG', scraper: () => this.buscarPublicacoesMG(nomes) },
      { estado: 'PR', scraper: () => this.buscarPublicacoesPR(nomes) },
      { estado: 'RS', scraper: () => this.buscarPublicacoesRS(nomes) },
      { estado: 'SC', scraper: () => this.buscarPublicacoesSC(nomes) },
      { estado: 'BA', scraper: () => this.buscarPublicacoesBA(nomes) },
      { estado: 'GO', scraper: () => this.buscarPublicacoesGO(nomes) },
      { estado: 'PE', scraper: () => this.buscarPublicacoesPE(nomes) }
    ];

    // Filtrar por estados se especificado, senão busca em todos
    const scrapersParaExecutar = estadosFiltro.length > 0 
      ? scrapers.filter(s => estadosFiltro.includes(s.estado))
      : scrapers;

    console.log(`🌍 Executando busca em ${scrapersParaExecutar.length} estados: ${scrapersParaExecutar.map(s => s.estado).join(', ')}`);

    // Executar scrapers em paralelo com limite de concorrência
    const promises = scrapersParaExecutar.map(async ({ estado, scraper }) => {
      try {
        console.log(`🔄 Iniciando busca no estado: ${estado}`);
        const resultado = await scraper();
        console.log(`✅ Estado ${estado}: ${resultado.length} publicações encontradas`);
        return resultado;
      } catch (error) {
        console.error(`❌ Erro no scraper do estado ${estado}:`, error);
        return [];
      }
    });

    const resultados = await Promise.allSettled(promises);
    
    resultados.forEach((resultado, index) => {
      const estado = scrapersParaExecutar[index].estado;
      if (resultado.status === 'fulfilled') {
        todasPublicacoes.push(...resultado.value);
        console.log(`📊 Estado ${estado}: ${resultado.value.length} publicações adicionadas`);
      } else {
        console.error(`💥 Falha total no estado ${estado}:`, resultado.reason);
      }
    });

    console.log(`🎯 Total de publicações encontradas em todos os estados: ${todasPublicacoes.length}`);
    return todasPublicacoes;
  }
}
