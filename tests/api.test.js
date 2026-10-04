import { buscarJSON, ErroRequisicao, criarSimulador, criarApi } from '../js/api.js';

const { expect } = chai;

const resposta = (status, corpo) => () => Promise.resolve(new Response(corpo, { status }));

async function erroDe(promessa) {
  try { await promessa; } catch (erro) { return erro; }
  throw new Error('era esperado um erro');
}

describe('T-04 buscarJSON', () => {
  it('retorna o JSON em caso de sucesso', async () => {
    const dados = await buscarJSON('x', { fetchFn: resposta(200, '{"ok":true}') });
    expect(dados).to.deep.equal({ ok: true });
  });
  it('404 vira "nao-encontrado"', async () => {
    const erro = await erroDe(buscarJSON('x', { fetchFn: resposta(404, '') }));
    expect(erro).to.be.instanceOf(ErroRequisicao);
    expect(erro.tipo).to.equal('nao-encontrado');
    expect(erro.detalhe).to.equal('HTTP 404');
  });
  it('500 vira "servidor"', async () => {
    const erro = await erroDe(buscarJSON('x', { fetchFn: resposta(500, '') }));
    expect(erro.tipo).to.equal('servidor');
    expect(erro.detalhe).to.equal('HTTP 500');
  });
  it('falha de rede vira "rede"', async () => {
    const erro = await erroDe(buscarJSON('x', { fetchFn: () => Promise.reject(new TypeError('Failed to fetch')) }));
    expect(erro.tipo).to.equal('rede');
  });
  it('JSON inválido vira "dados"', async () => {
    const erro = await erroDe(buscarJSON('x', { fetchFn: resposta(200, '{quebrado') }));
    expect(erro.tipo).to.equal('dados');
  });
  const nuncaResponde = (_url, { signal }) => new Promise((_, rejeitar) => {
    signal.addEventListener('abort', () => rejeitar(signal.reason));
  });
  it('tempo esgotado vira "tempo"', async () => {
    const erro = await erroDe(buscarJSON('x', { fetchFn: nuncaResponde, timeout: 30 }));
    expect(erro.tipo).to.equal('tempo');
  });
  it('cancelamento pelo chamador vira "cancelado"', async () => {
    const controle = new AbortController();
    const promessa = buscarJSON('x', { fetchFn: nuncaResponde, signal: controle.signal });
    controle.abort();
    const erro = await erroDe(promessa);
    expect(erro.tipo).to.equal('cancelado');
  });
});

describe('T-05 simulação (ACAD-04)', () => {
  it('?simular=erro falha só na primeira tentativa da lista', async () => {
    const simulador = criarSimulador('?simular=erro');
    const erro = await erroDe(simulador.antes('lista'));
    expect(erro.tipo).to.equal('servidor');
    await simulador.antes('lista');   // segunda tentativa passa
    await simulador.antes('detalhe'); // detalhe não é afetado
  });
  it('?simular=erro-detalhe falha só na primeira tentativa do detalhe', async () => {
    const simulador = criarSimulador('?simular=erro-detalhe');
    await simulador.antes('lista');
    const erro = await erroDe(simulador.antes('detalhe'));
    expect(erro.tipo).to.equal('servidor');
    await simulador.antes('detalhe');
  });
  it('?simular=lento atrasa', async () => {
    const simulador = criarSimulador('?simular=lento', { atraso: 40 });
    const inicio = performance.now();
    await simulador.antes('lista');
    expect(performance.now() - inicio).to.be.at.least(35);
  });
  it('sem parâmetro não faz nada', async () => {
    expect(criarSimulador('').modo).to.equal('');
  });
  it('criarApi monta as URLs de listagem e detalhe', async () => {
    const pedidas = [];
    const fetchFn = (url) => { pedidas.push(url); return Promise.resolve(new Response('{}')); };
    const api = criarApi({ fetchFn, base: '../' });
    await api.carregarCatalogo();
    await api.carregarDetalhe('robo-aspirador-lidar');
    expect(pedidas).to.deep.equal(['../data/itens.json', '../data/detalhes/robo-aspirador-lidar.json']);
  });
});
