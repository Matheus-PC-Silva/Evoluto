// Funções puras do catálogo: sem DOM e sem rede, por isso podem ser testadas isoladamente.

export const FORMATO_ID = /^[a-z0-9-]+$/;

const NOMES_FAIXA = { 1: 'baixa', 2: 'média', 3: 'alta' };

export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Todas as palavras digitadas precisam aparecer no título, no resumo ou no nome do eixo.
export function filtrar(itens, eixos, { texto = '', eixo = '' } = {}) {
  const palavras = normalizarTexto(texto).split(' ').filter(Boolean);
  const nomePorEixo = new Map(eixos.map((e) => [e.id, e.nome]));
  return itens.filter((item) => {
    if (eixo && item.categoria !== eixo) return false;
    const alvo = normalizarTexto(`${item.titulo} ${item.resumo} ${nomePorEixo.get(item.categoria) ?? ''}`);
    return palavras.every((palavra) => alvo.includes(palavra));
  });
}

// O id vem da URL (entrada do usuário): só é aceito se tiver o formato certo e existir no catálogo.
export function validarId(id, itens) {
  return typeof id === 'string' && FORMATO_ID.test(id) && itens.some((item) => item.id === id);
}

export function formatarFaixaPreco(faixa) {
  if (!Number.isInteger(faixa) || !NOMES_FAIXA[faixa]) return null;
  return { simbolo: '$'.repeat(faixa), texto: `Faixa de preço: ${NOMES_FAIXA[faixa]}` };
}

// Divide o texto em vez de usar Date para não sofrer com fuso horário.
export function formatarData(iso) {
  const [ano, mes, dia] = String(iso).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function lerEstadoDaUrl(search, hash, eixos) {
  const parametros = new URLSearchParams(search);
  const eixo = parametros.get('eixo') ?? '';
  const encontrado = /^#produto-(.+)$/.exec(hash ?? '');
  let produto = null;
  if (encontrado) {
    try {
      produto = decodeURIComponent(encontrado[1]);
    } catch {
      produto = encontrado[1]; // malformado: segue adiante e falha na validação do id
    }
  }
  return {
    texto: parametros.get('q') ?? '',
    eixo: eixos.some((e) => e.id === eixo) ? eixo : '',
    produto,
  };
}

// Preserva parâmetros que não são da busca (ex.: ?simular=) e remove os vazios.
export function montarBusca(search, { texto, eixo }) {
  const parametros = new URLSearchParams(search);
  const termo = (texto ?? '').trim();
  if (termo) parametros.set('q', termo); else parametros.delete('q');
  if (eixo) parametros.set('eixo', eixo); else parametros.delete('eixo');
  const resultado = parametros.toString();
  return resultado ? `?${resultado}` : '';
}

function complemento({ texto = '', eixoNome = '' }) {
  const partes = [];
  if (eixoNome) partes.push(`em ${eixoNome}`);
  if (texto.trim()) partes.push(`para “${texto.trim()}”`);
  return partes.length ? ` ${partes.join(' ')}` : '';
}

export function descreverResultado(quantidade, filtro = {}) {
  const base = quantidade === 1 ? '1 produto' : `${quantidade} produtos`;
  return `${base}${complemento(filtro)}`;
}

export function descreverVazio(filtro = {}) {
  return `Nenhum produto encontrado${complemento(filtro)}.`;
}

export function periodoDoDia(hora) {
  if (hora >= 5 && hora < 9) return 'manha';
  if (hora >= 9 && hora < 17) return 'dia';
  if (hora >= 17 && hora < 19) return 'tarde';
  return 'noite';
}
