// Requisições AJAX (Fetch API) com classificação de erros para a interface.

export const MENSAGENS = {
  rede: 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
  tempo: 'A resposta demorou demais. Tente novamente em instantes.',
  'nao-encontrado': 'Não encontramos estes dados.',
  servidor: 'O servidor respondeu com erro. Tente novamente em instantes.',
  dados: 'Os dados recebidos estão com problema.',
  cancelado: 'Requisição cancelada.',
};

export class ErroRequisicao extends Error {
  constructor(tipo, detalhe = '') {
    super(MENSAGENS[tipo]);
    this.name = 'ErroRequisicao';
    this.tipo = tipo;
    this.detalhe = detalhe;
  }
}

export async function buscarJSON(url, { fetchFn = (...args) => fetch(...args), timeout = 8000, signal } = {}) {
  const sinalTempo = AbortSignal.timeout(timeout);
  const sinal = signal ? AbortSignal.any([signal, sinalTempo]) : sinalTempo;

  let resposta;
  try {
    resposta = await fetchFn(url, { signal: sinal });
  } catch (erro) {
    if (signal?.aborted) throw new ErroRequisicao('cancelado');
    if (sinalTempo.aborted) throw new ErroRequisicao('tempo');
    throw new ErroRequisicao('rede', erro.message);
  }

  if (resposta.status === 404) throw new ErroRequisicao('nao-encontrado', 'HTTP 404');
  if (!resposta.ok) throw new ErroRequisicao('servidor', `HTTP ${resposta.status}`);

  try {
    return await resposta.json();
  } catch (erro) {
    throw new ErroRequisicao('dados', erro.message);
  }
}

// ACAD-04: permite ao professor ver carregamento e erro, já que o JSON local carrega instantaneamente.
// "erro" e "erro-detalhe" falham só na 1ª tentativa, para o "Tentar novamente" funcionar na demonstração.
export function criarSimulador(search, { atraso = 1500 } = {}) {
  const modo = new URLSearchParams(search).get('simular') ?? '';
  const alvoDoErro = { erro: 'lista', 'erro-detalhe': 'detalhe' }[modo];
  const jaFalhou = new Set();

  return {
    modo,
    async antes(recurso) {
      if (modo === 'lento') await new Promise((resolver) => setTimeout(resolver, atraso));
      if (alvoDoErro === recurso && !jaFalhou.has(recurso)) {
        jaFalhou.add(recurso);
        throw new ErroRequisicao('servidor', `Erro simulado (?simular=${modo})`);
      }
    },
  };
}

export function criarApi({ fetchFn, simulador = criarSimulador(''), timeout = 8000, base = '' } = {}) {
  const opcoes = (signal) => ({ fetchFn, timeout, signal });
  return {
    async carregarCatalogo(signal) {
      await simulador.antes('lista');
      return buscarJSON(`${base}data/itens.json`, opcoes(signal));
    },
    async carregarDetalhe(id, signal) {
      await simulador.antes('detalhe');
      return buscarJSON(`${base}data/detalhes/${encodeURIComponent(id)}.json`, opcoes(signal));
    },
  };
}
