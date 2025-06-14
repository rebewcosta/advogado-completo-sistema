
-- Limpar fontes existentes e adicionar fontes completas de todos os estados
DELETE FROM public.fontes_diarios;

-- Inserir fontes de diários oficiais de todos os estados brasileiros
INSERT INTO public.fontes_diarios (nome, estado, url_base, tipo_fonte, seletor_css, ativo) VALUES
-- Região Norte
('Diário Oficial do Estado do Acre', 'AC', 'https://diario.ac.gov.br/', 'html', '.publicacao, .materia', true),
('Diário Oficial do Estado do Amapá', 'AP', 'https://sead.portal.ap.gov.br/diario_oficial', 'html', '.conteudo-diario', true),
('Diário Oficial do Estado do Amazonas', 'AM', 'https://diario.am.gov.br/', 'html', '.item-diario', true),
('Diário Oficial do Estado do Pará', 'PA', 'https://www.ioepa.com.br/', 'html', '.publicacao', true),
('Diário Oficial de Rondônia', 'RO', 'https://diof.ro.gov.br/', 'html', '.materia-diario', true),
('Diário Oficial de Roraima', 'RR', 'https://imprensaoficial.rr.gov.br/', 'html', '.item-publicacao', true),
('Diário Oficial do Estado do Tocantins', 'TO', 'https://diariooficial.to.gov.br/', 'html', '.conteudo-publicacao', true),

-- Região Nordeste
('Diário Oficial do Estado de Alagoas', 'AL', 'https://www.imprensaoficialalal.com.br/', 'html', '.publicacao', true),
('Diário Oficial do Estado da Bahia', 'BA', 'https://www.egba.ba.gov.br/', 'html', '.item-diario', true),
('Diário Oficial do Estado do Ceará', 'CE', 'https://www.ioce.com.br/', 'html', '.materia', true),
('Diário Oficial do Estado do Maranhão', 'MA', 'https://www.diariooficial.ma.gov.br/', 'html', '.publicacao-item', true),
('Diário Oficial da Paraíba', 'PB', 'https://auniao.pb.gov.br/', 'html', '.conteudo-diario', true),
('Diário Oficial do Estado de Pernambuco', 'PE', 'https://www.cepe.com.br/', 'html', '.item-publicacao', true),
('Diário Oficial do Estado do Piauí', 'PI', 'https://www.diariooficial.pi.gov.br/', 'html', '.materia-diario', true),
('Diário Oficial do Estado do Rio Grande do Norte', 'RN', 'https://diariooficial.rn.gov.br/', 'html', '.publicacao', true),
('Diário Oficial do Estado de Sergipe', 'SE', 'https://www.diariooficial.se.gov.br/', 'html', '.item-diario', true),

-- Região Centro-Oeste
('Diário Oficial do Distrito Federal', 'DF', 'https://www.dodf.df.gov.br/', 'html', '.publicacao', true),
('Diário Oficial do Estado de Goiás', 'GO', 'https://www.dio.go.gov.br/', 'html', '.materia', true),
('Diário Oficial do Estado de Mato Grosso', 'MT', 'https://www.iomat.mt.gov.br/', 'html', '.item-publicacao', true),
('Diário Oficial do Estado de Mato Grosso do Sul', 'MS', 'https://www.spdo.ms.gov.br/', 'html', '.conteudo-diario', true),

-- Região Sudeste
('Diário Oficial do Estado do Espírito Santo', 'ES', 'https://dio.es.gov.br/', 'html', '.publicacao-item', true),
('Diário Oficial do Estado de Minas Gerais', 'MG', 'https://www.jornalminasgerais.mg.gov.br/', 'html', '.item-diario', true),
('Diário Oficial do Estado do Rio de Janeiro', 'RJ', 'https://www.ioerj.com.br/', 'html', '.materia', true),
('Diário Oficial do Estado de São Paulo', 'SP', 'https://www.imprensaoficial.com.br/', 'html', '.publicacao', true),

-- Região Sul
('Diário Oficial do Estado do Paraná', 'PR', 'https://www.aen.pr.gov.br/', 'html', '.item-publicacao', true),
('Diário Oficial do Estado do Rio Grande do Sul', 'RS', 'https://www.corag.com.br/', 'html', '.conteudo-diario', true),
('Diário Oficial do Estado de Santa Catarina', 'SC', 'https://www.ioesc.com.br/', 'html', '.materia-diario', true),

-- Diários da Justiça (Tribunais)
('Diário da Justiça Eletrônico - TJ-SP', 'SP', 'https://www.djsp.jus.br/', 'html', '.publicacao-judicial', true),
('Diário da Justiça - TJ-RJ', 'RJ', 'https://www3.tjrj.jus.br/consultadje/', 'html', '.item-dje', true),
('Diário da Justiça - TJ-MG', 'MG', 'https://www.tjmg.jus.br/portal-tjmg/jurisprudencia/diario-da-justica/', 'html', '.item-diario', true),
('Diário da Justiça - TJ-RS', 'RS', 'https://www.tjrs.jus.br/site/imprensa/diario_da_justica/', 'html', '.noticia', true);

-- Atualizar última verificação
UPDATE public.fontes_diarios SET ultima_verificacao = now();
