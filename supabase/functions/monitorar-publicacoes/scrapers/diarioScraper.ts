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

  async buscarPublicacoesES(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Espírito Santo...');
      
      const url = 'https://www.dio.es.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial ES',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Espírito Santo',
                  estado: 'ES',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de ES:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesDF(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Distrito Federal...');
      
      const url = 'http://www.buriti.df.gov.br/ftp/diariooficial/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial DF',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Distrito Federal',
                  estado: 'DF',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do DF:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesMT(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Mato Grosso...');
      
      const url = 'https://www.iomat.mt.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial MT',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Mato Grosso',
                  estado: 'MT',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MT:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesMS(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Mato Grosso do Sul...');
      
      const url = 'https://www.spdo.ms.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial MS',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Mato Grosso do Sul',
                  estado: 'MS',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MS:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesPA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Pará...');
      
      const url = 'https://www.ioepa.com.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial PA',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Pará',
                  estado: 'PA',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PA:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesAM(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Amazonas...');
      
      const url = 'http://www.imprensaoficial.am.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial AM',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Amazonas',
                  estado: 'AM',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AM:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesRO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Rondônia...');
      
      const url = 'http://www.diof.ro.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial RO',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Rondônia',
                  estado: 'RO',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de RO:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesAC(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Acre...');
      
      const url = 'http://www.diario.ac.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial AC',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Acre',
                  estado: 'AC',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AC:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesRR(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Roraima...');
      
      const url = 'https://doe.rr.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial RR',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Roraima',
                  estado: 'RR',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de RR:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesAP(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Amapá...');
      
      const url = 'https://www.diap.ap.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial AP',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Amapá',
                  estado: 'AP',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AP:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesTO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Tocantins...');
      
      const url = 'https://diariooficial.to.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial TO',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Tocantins',
                  estado: 'TO',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de TO:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesMA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Maranhão...');
      
      const url = 'http://www.diariooficial.ma.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial MA',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Maranhão',
                  estado: 'MA',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do MA:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesPI(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Piauí...');
      
      const url = 'http://www.diariooficial.pi.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial PI',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Piauí',
                  estado: 'PI',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PI:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesAL(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Alagoas...');
      
      const url = 'http://www.imprensaoficialalagoas.com.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial AL',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Alagoas',
                  estado: 'AL',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de AL:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesSE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial de Sergipe...');
      
      const url = 'https://doe.se.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial SE',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado de Sergipe',
                  estado: 'SE',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SE:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesPB(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial da Paraíba...');
      
      const url = 'http://www.paraiba.pb.gov.br/diariooficial/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial PB',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado da Paraíba',
                  estado: 'PB',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário da PB:', error);
    }
    
    return publicacoes;
  }

  async buscarPublicacoesRN(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio Grande do Norte...');
      
      const url = 'http://diariooficial.rn.gov.br/';
      
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
                  titulo_publicacao: 'Publicação no Diário Oficial RN',
                  conteudo_publicacao: this.limparTexto(match),
                  data_publicacao: new Date().toISOString().split('T')[0],
                  diario_oficial: 'Diário Oficial do Estado do Rio Grande do Norte',
                  estado: 'RN',
                  url_publicacao: url
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RN:', error);
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
      { estado: 'PE', scraper: () => this.buscarPublicacoesPE(nomes) },
      { estado: 'ES', scraper: () => this.buscarPublicacoesES(nomes) },
      { estado: 'DF', scraper: () => this.buscarPublicacoesDF(nomes) },
      { estado: 'MT', scraper: () => this.buscarPublicacoesMT(nomes) },
      { estado: 'MS', scraper: () => this.buscarPublicacoesMS(nomes) },
      { estado: 'PA', scraper: () => this.buscarPublicacoesPA(nomes) },
      { estado: 'AM', scraper: () => this.buscarPublicacoesAM(nomes) },
      { estado: 'RO', scraper: () => this.buscarPublicacoesRO(nomes) },
      { estado: 'AC', scraper: () => this.buscarPublicacoesAC(nomes) },
      { estado: 'RR', scraper: () => this.buscarPublicacoesRR(nomes) },
      { estado: 'AP', scraper: () => this.buscarPublicacoesAP(nomes) },
      { estado: 'TO', scraper: () => this.buscarPublicacoesTO(nomes) },
      { estado: 'MA', scraper: () => this.buscarPublicacoesMA(nomes) },
      { estado: 'PI', scraper: () => this.buscarPublicacoesPI(nomes) },
      { estado: 'AL', scraper: () => this.buscarPublicacoesAL(nomes) },
      { estado: 'SE', scraper: () => this.buscarPublicacoesSE(nomes) },
      { estado: 'PB', scraper: () => this.buscarPublicacoesPB(nomes) },
      { estado: 'RN', scraper: () => this.buscarPublicacoesRN(nomes) }
    ];

    // Filtrar por estados se especificado, senão busca em todos os 27 estados
    const scrapersParaExecutar = estadosFiltro.length > 0 
      ? scrapers.filter(s => estadosFiltro.includes(s.estado))
      : scrapers;

    console.log(`🌍 🇧🇷 EXECUTANDO BUSCA NACIONAL EM ${scrapersParaExecutar.length} ESTADOS: ${scrapersParaExecutar.map(s => s.estado).join(', ')}`);

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

    console.log(`🎯 🇧🇷 TOTAL DE PUBLICAÇÕES ENCONTRADAS EM TODO O BRASIL: ${todasPublicacoes.length}`);
    return todasPublicacoes;
  }
}
