import {
  criarCard, criarEsqueletos, criarAviso, criarOpcoesEixos,
  criarConteudoDetalhe, criarLinkLoja, criarMetaDetalhe,
} from '../js/ui.js';

const { expect } = chai;

const eixo = { id: 'sono', nome: 'Sono', icone: 'moon-stars' };
const item = {
  id: 'lampadas-circadianas', titulo: 'Kit <b>lâmpadas</b>', categoria: 'sono', resumo: 'Resumo.',
  imagem: { src: 'img/produtos/lampadas-circadianas.webp', alt: 'Quarto com luz âmbar', credito: { autor: 'Ana', url: 'https://unsplash.com/photos/x' } },
  primeiroPasso: true, faixaPreco: 2,
};
const detalhe = {
  id: item.id, tipoAnalise: 'pesquisa', atualizadoEm: '2026-10-04', veredito: 'V', beneficio: 'B',
  paraQuem: ['a'], naoParaQuem: ['b'], pros: ['p'], contras: ['c'], comoEscolher: ['e'], exemplos: ['X', 'Y'],
  evidencias: [{ texto: 'T', fonte: 'F', url: 'https://exemplo.org' }],
  avisoSaude: 'Cuidado.',
  lojas: [{ nome: 'Amazon', url: 'https://www.amazon.com.br/s?k=x', afiliado: false }],
};

describe('T-08 renderização', () => {
  it('card: article com h3, imagem com alt, selo de primeiro passo e botão com nome acessível', () => {
    const col = criarCard(item, eixo);
    const artigo = col.querySelector('article.card');
    expect(artigo.classList.contains('primeiro')).to.equal(true);
    expect(artigo.querySelector('h3').textContent).to.equal('Kit <b>lâmpadas</b>'); // texto, não HTML
    expect(artigo.querySelector('h3 b')).to.equal(null);
    const img = artigo.querySelector('img');
    expect(img.getAttribute('alt')).to.equal('Quarto com luz âmbar');
    expect(img.getAttribute('loading')).to.equal('lazy');
    expect(artigo.textContent).to.include('Primeiro passo evoluto');
    expect(artigo.textContent).to.include('Imagem ilustrativa');
    const botao = artigo.querySelector('button[data-produto="lampadas-circadianas"]');
    expect(botao.textContent).to.equal('Ver análise: Kit <b>lâmpadas</b>');
    expect(artigo.querySelector('.faixa [aria-hidden="true"]').textContent).to.equal('$$');
    expect(artigo.textContent).to.include('Faixa de preço: média');
  });
  it('card sem primeiro passo não tem o selo', () => {
    const artigo = criarCard({ ...item, primeiroPasso: false }, eixo).querySelector('article');
    expect(artigo.classList.contains('primeiro')).to.equal(false);
    expect(artigo.textContent).not.to.include('Primeiro passo');
  });
  it('esqueletos ficam ocultos de leitores de tela', () => {
    const lista = criarEsqueletos(3);
    expect(lista).to.have.length(3);
    lista.forEach((col) => expect(col.querySelector('.card').getAttribute('aria-hidden')).to.equal('true'));
  });
  it('aviso de erro tem role=alert, detalhe e botão que chama a ação', () => {
    let chamou = false;
    const aviso = criarAviso({ tipo: 'erro', titulo: 'Falhou.', mensagem: 'Tente.', detalhe: 'HTTP 500', acao: { texto: 'Tentar novamente', aoClicar: () => { chamou = true; } } });
    expect(aviso.getAttribute('role')).to.equal('alert');
    expect(aviso.textContent).to.include('HTTP 500');
    aviso.querySelector('button').click();
    expect(chamou).to.equal(true);
  });
  it('aviso de vazio não usa role=alert', () => {
    expect(criarAviso({ tipo: 'vazio', titulo: 'Nada.', mensagem: '' }).getAttribute('role')).to.equal(null);
  });
  it('opções de eixo: lista nova a cada chamada, com "Todos os eixos" primeiro', () => {
    const opcoes = criarOpcoesEixos([eixo]);
    expect(opcoes.map((o) => [o.value, o.textContent])).to.deep.equal([['', 'Todos os eixos'], ['sono', 'Sono']]);
    expect(criarOpcoesEixos([eixo])[0]).not.to.equal(opcoes[0]);
  });
  it('link de loja: sem afiliado não tem sponsored e diz "Link externo"', () => {
    const p = criarLinkLoja(detalhe.lojas[0]);
    const a = p.querySelector('a');
    expect(a.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(a.getAttribute('target')).to.equal('_blank');
    expect(a.textContent).to.equal('Ver na Amazon (abre em nova aba)');
    expect(p.textContent).to.include('Link externo');
  });
  it('link de loja: com afiliado tem sponsored e diz "Link de afiliado" (ACAD-20)', () => {
    const p = criarLinkLoja({ nome: 'Mercado Livre', url: 'https://x.org', afiliado: true });
    expect(p.querySelector('a').getAttribute('rel')).to.equal('sponsored noopener noreferrer');
    expect(p.querySelector('a').textContent).to.equal('Ver no Mercado Livre (abre em nova aba)');
    expect(p.textContent).to.include('Link de afiliado');
  });
  it('detalhe: seções na ordem, listas, cite, aviso de saúde e crédito da imagem', () => {
    const area = document.getElementById('area-dom');
    area.replaceChildren(criarConteudoDetalhe(item, detalhe));
    const titulos = [...area.querySelectorAll('h3')].map((h) => h.textContent);
    expect(titulos).to.deep.equal(['Benefício evoluto', 'Para quem é', 'Para quem não é', 'Prós', 'Contras',
      'Como escolher', 'Exemplos no mercado', 'O que diz a evidência', 'Onde encontrar']);
    expect(area.querySelector('cite a').getAttribute('href')).to.equal('https://exemplo.org');
    expect(area.querySelector('.alert-warning').textContent).to.include('Cuidado.');
    expect(area.textContent).to.include('Ana');
  });
  it('detalhe sem evidências mostra nota honesta e sem aviso de saúde não mostra alerta', () => {
    const area = document.getElementById('area-dom');
    area.replaceChildren(criarConteudoDetalhe(item, { ...detalhe, evidencias: [], avisoSaude: null }));
    expect(area.textContent).to.include('Ainda não citamos um estudo específico');
    expect(area.querySelector('.alert-warning')).to.equal(null);
  });
  it('meta do detalhe: selo de pesquisa e data em <time>', () => {
    const area = document.getElementById('area-dom');
    area.replaceChildren(criarMetaDetalhe(item, eixo, detalhe));
    expect(area.textContent).to.include('Análise baseada em pesquisa e evidências');
    expect(area.querySelector('time').getAttribute('datetime')).to.equal('2026-10-04');
    expect(area.querySelector('time').textContent).to.equal('04/10/2026');
  });
});
