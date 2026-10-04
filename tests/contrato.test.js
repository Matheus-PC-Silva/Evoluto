import { criarApi } from '../js/api.js';
import { FORMATO_ID } from '../js/estado.js';

const { expect } = chai;
const api = criarApi({ base: '../' });
const TIPOS_DE_LOJA = ['nome', 'url', 'afiliado'];

describe('T-09 contrato dos dados', function () {
  let catalogo;
  before(async () => { catalogo = await api.carregarCatalogo(); });

  it('tem metadados e eixos válidos', () => {
    expect(catalogo.versao).to.equal(1);
    expect(catalogo.atualizadoEm).to.match(/^\d{4}-\d{2}-\d{2}$/);
    expect(catalogo.eixos).to.have.length(8);
    catalogo.eixos.forEach((e) => expect(e).to.include.keys('id', 'nome', 'titulo', 'icone'));
  });

  it('tem 8 itens ou mais (PDF §3a), com id, título, categoria e resumo', () => {
    expect(catalogo.itens.length).to.be.at.least(8);
    catalogo.itens.forEach((item) => {
      expect(item.id, item.id).to.match(FORMATO_ID);
      ['titulo', 'categoria', 'resumo'].forEach((campo) => expect(item[campo], `${item.id}.${campo}`).to.be.a('string').and.not.empty);
      expect([1, 2, 3], `${item.id}.faixaPreco`).to.include(item.faixaPreco);
      expect(item.imagem.alt, `${item.id}.alt`).to.be.a('string').and.not.empty;
      expect(item.imagem.src, `${item.id}.src`).to.match(/^img\/produtos\/[a-z0-9-]+\.webp$/);
    });
  });

  it('ids únicos, categorias existentes e um "primeiro passo" por eixo', () => {
    const ids = catalogo.itens.map((i) => i.id);
    expect(new Set(ids).size).to.equal(ids.length);
    const idsEixo = catalogo.eixos.map((e) => e.id);
    catalogo.itens.forEach((i) => expect(idsEixo, i.id).to.include(i.categoria));
    idsEixo.forEach((eixo) => {
      const primeiros = catalogo.itens.filter((i) => i.categoria === eixo && i.primeiroPasso === true);
      expect(primeiros, eixo).to.have.length(1);
    });
  });

  it('todo item tem um arquivo de detalhes completo', async () => {
    for (const item of catalogo.itens) {
      const d = await api.carregarDetalhe(item.id);
      expect(d.id, item.id).to.equal(item.id);
      expect(['pesquisa', 'testado']).to.include(d.tipoAnalise);
      expect(d.atualizadoEm).to.match(/^\d{4}-\d{2}-\d{2}$/);
      ['veredito', 'beneficio'].forEach((c) => expect(d[c], `${item.id}.${c}`).to.be.a('string').and.not.empty);
      ['paraQuem', 'naoParaQuem', 'pros', 'contras', 'comoEscolher', 'exemplos']
        .forEach((c) => expect(d[c], `${item.id}.${c}`).to.be.an('array').that.is.not.empty);
      expect(d.evidencias, `${item.id}.evidencias`).to.be.an('array');
      d.evidencias.forEach((ev) => {
        expect(ev.texto).to.be.a('string').and.not.empty;
        expect(ev.fonte).to.be.a('string').and.not.empty;
        expect(ev.url).to.match(/^https:\/\//);
      });
      expect(d.avisoSaude === null || typeof d.avisoSaude === 'string', `${item.id}.avisoSaude`).to.equal(true);
      expect(d.lojas, `${item.id}.lojas`).to.be.an('array').that.is.not.empty;
      d.lojas.forEach((loja) => {
        expect(loja).to.have.all.keys(...TIPOS_DE_LOJA);
        expect(loja.afiliado, `${item.id}.afiliado`).to.be.a('boolean');
        expect(loja.url).to.match(/^https:\/\//);
      });
      expect(d, `${item.id} não deve repetir dados da listagem`).not.to.have.any.keys('titulo', 'resumo', 'imagem');
    }
  });

  it('saúde nunca promete diagnosticar ou prevenir', async () => {
    const proibidas = /diagn[oó]stic|previn|preven[çc]|\bcura\b|\bcurar\b/i;
    for (const item of catalogo.itens) {
      const d = await api.carregarDetalhe(item.id);
      const texto = [d.veredito, d.beneficio, ...d.pros, item.resumo].join(' ');
      expect(texto, item.id).not.to.match(proibidas);
    }
  });
});
