// Criação de elementos da interface. Todo texto entra por textContent (nunca innerHTML),
// o que impede que dados do JSON sejam interpretados como HTML.
import { formatarFaixaPreco, formatarData } from './estado.js';

const PREPOSICAO_LOJA = { Amazon: 'na', Shopee: 'na', 'Mercado Livre': 'no', Magalu: 'no', Bitwarden: 'no' };

function el(tag, { classe, texto, atributos } = {}, filhos = []) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined) no.textContent = texto;
  for (const [nome, valor] of Object.entries(atributos ?? {})) no.setAttribute(nome, valor);
  no.append(...filhos);
  return no;
}

const oculto = (texto) => el('span', { classe: 'visually-hidden', texto });
const icone = (nome) => el('i', { classe: `bi bi-${nome}`, atributos: { 'aria-hidden': 'true' } });

function seloEixo(eixo, categoria) {
  return el('span', { classe: 'badge badge-eixo' }, [icone(eixo?.icone ?? 'grid'), ` ${eixo?.nome ?? categoria}`]);
}

export function criarCard(item, eixo) {
  const faixa = formatarFaixaPreco(item.faixaPreco);

  const midia = el('div', { classe: 'card-midia' }, [
    el('img', {
      classe: 'card-img-top',
      atributos: { src: item.imagem.src, alt: item.imagem.alt, width: '640', height: '360', loading: 'lazy', decoding: 'async' },
    }),
    el('span', { classe: 'legenda-ilustrativa', texto: 'Imagem ilustrativa' }), // ACAD-10
  ]);

  const selos = el('p', { classe: 'card-selos mb-2' }, [seloEixo(eixo, item.categoria)]);
  if (item.primeiroPasso) selos.append(' ', el('span', { classe: 'badge badge-primeiro', texto: 'Primeiro passo evoluto' }));

  const rodape = el('div', { classe: 'mt-auto' });
  if (faixa) {
    rodape.append(el('p', { classe: 'faixa mb-3' }, [el('span', { texto: faixa.simbolo, atributos: { 'aria-hidden': 'true' } }), oculto(faixa.texto)]));
  }
  rodape.append(el('button', {
    classe: 'btn btn-azul w-100',
    atributos: { type: 'button', 'data-produto': item.id },
  }, ['Ver análise', oculto(`: ${item.titulo}`)]));

  const corpo = el('div', { classe: 'card-body d-flex flex-column' }, [
    selos,
    el('h3', { classe: 'card-title', texto: item.titulo }),
    el('p', { classe: 'card-text', texto: item.resumo }),
    rodape,
  ]);

  return el('div', { classe: 'col' }, [
    el('article', { classe: `card h-100${item.primeiroPasso ? ' primeiro' : ''}` }, [midia, corpo]),
  ]);
}

export function criarEsqueletos(quantidade) {
  return Array.from({ length: quantidade }, () => el('div', { classe: 'col' }, [
    el('div', { classe: 'card h-100 esqueleto', atributos: { 'aria-hidden': 'true' } }, [
      el('div', { classe: 'placeholder-glow' }, [el('span', { classe: 'placeholder w-100 esqueleto-midia' })]),
      el('div', { classe: 'card-body placeholder-glow' }, [
        el('span', { classe: 'placeholder col-4 mb-3 d-block' }),
        el('span', { classe: 'placeholder col-9 mb-2 d-block placeholder-lg' }),
        el('span', { classe: 'placeholder col-12 d-block' }),
        el('span', { classe: 'placeholder col-10 mb-3 d-block' }),
        el('span', { classe: 'placeholder col-12 btn disabled' }),
      ]),
    ]),
  ]));
}

export function criarAviso({ tipo, titulo, mensagem, detalhe, acao }) {
  const ehErro = tipo === 'erro';
  const caixa = el('div', {
    classe: ehErro ? 'alert alert-danger' : 'alert alert-light border',
    atributos: ehErro ? { role: 'alert' } : {},
  }, [el('strong', { texto: titulo }), mensagem ? ` ${mensagem}` : '']);
  if (detalhe) caixa.append(el('small', { classe: 'd-block mt-1', texto: `Detalhe técnico: ${detalhe}` }));
  if (acao) {
    const botao = el('button', { classe: `btn btn-sm mt-2 ${ehErro ? 'btn-danger' : 'btn-azul'}`, texto: acao.texto, atributos: { type: 'button' } });
    botao.addEventListener('click', acao.aoClicar);
    caixa.append(el('div', {}, [botao]));
  }
  return caixa;
}

export function criarOpcoesEixos(eixos) {
  return [
    el('option', { texto: 'Todos os eixos', atributos: { value: '' } }),
    ...eixos.map((eixo) => el('option', { texto: eixo.nome, atributos: { value: eixo.id } })),
  ];
}

export function criarCarregandoDetalhe() {
  return el('div', { classe: 'd-flex align-items-center gap-3 py-4' }, [
    el('div', { classe: 'spinner-border text-primary', atributos: { 'aria-hidden': 'true' } }),
    el('p', { classe: 'mb-0', texto: 'Carregando análise…', atributos: { role: 'status' } }),
  ]);
}

export function criarMetaDetalhe(item, eixo, detalhe) {
  const fragmento = document.createDocumentFragment();
  const selo = detalhe.tipoAnalise === 'testado' ? 'Testado pelo Evoluto' : 'Análise baseada em pesquisa e evidências'; // ACAD-09
  fragmento.append(
    seloEixo(eixo, item.categoria), ' ',
    el('span', { classe: 'badge selo-pesquisa', texto: selo }), ' ',
    el('span', {}, ['Atualizado em ', el('time', { texto: formatarData(detalhe.atualizadoEm), atributos: { datetime: detalhe.atualizadoEm } })]),
  );
  return fragmento;
}

export function criarLinkLoja(loja) {
  const rel = loja.afiliado ? 'sponsored noopener noreferrer' : 'noopener noreferrer'; // ACAD-20
  const preposicao = PREPOSICAO_LOJA[loja.nome] ?? 'em';
  return el('p', { classe: 'd-flex flex-wrap align-items-center gap-2' }, [
    el('a', { classe: 'btn btn-ambar', atributos: { href: loja.url, target: '_blank', rel } },
      [`Ver ${preposicao} ${loja.nome}`, oculto(' (abre em nova aba)')]),
    el('span', { classe: 'badge selo-link', texto: loja.afiliado ? 'Link de afiliado' : 'Link externo' }),
  ]);
}

function secao(titulo, ...conteudo) {
  return el('section', { classe: 'mb-4' }, [el('h3', { texto: titulo }), ...conteudo]);
}

function lista(textos, classe = '') {
  return el('ul', { classe }, textos.map((texto) => el('li', { texto })));
}

function colunas(...blocos) {
  return el('div', { classe: 'row g-3' }, blocos.map((bloco) => el('div', { classe: 'col-md-6' }, [bloco])));
}

export function criarConteudoDetalhe(item, detalhe) {
  const fragmento = document.createDocumentFragment();

  const evidencias = detalhe.evidencias.length
    ? detalhe.evidencias.map((ev) => el('p', {}, [`${ev.texto} `, el('cite', {}, [
      el('a', { texto: ev.fonte, atributos: { href: ev.url, target: '_blank', rel: 'noopener noreferrer' } }),
      oculto(' (abre em nova aba)'),
    ])]))
    : [el('p', { texto: 'Ainda não citamos um estudo específico para este produto. A análise se baseia em especificações e na experiência relatada por usuários.' })];

  fragmento.append(
    el('p', { classe: 'veredito' }, [el('strong', { texto: 'Veredito: ' }), detalhe.veredito]),
    secao('Benefício evoluto', el('p', { texto: detalhe.beneficio })),
    colunas(secao('Para quem é', lista(detalhe.paraQuem)), secao('Para quem não é', lista(detalhe.naoParaQuem))),
    colunas(secao('Prós', lista(detalhe.pros, 'lista-pros')), secao('Contras', lista(detalhe.contras, 'lista-contras'))),
    secao('Como escolher', lista(detalhe.comoEscolher)),
    secao('Exemplos no mercado', el('p', { texto: `${detalhe.exemplos.join(', ')}. Confira o modelo e a ficha técnica na loja.` })),
    secao('O que diz a evidência', ...evidencias),
  );

  if (detalhe.avisoSaude) {
    fragmento.append(el('div', { classe: 'alert alert-warning' }, [el('strong', { texto: 'Aviso de saúde: ' }), detalhe.avisoSaude]));
  }

  fragmento.append(secao('Onde encontrar', ...detalhe.lojas.map(criarLinkLoja)));

  const credito = item.imagem.credito;
  if (credito) {
    fragmento.append(el('p', { classe: 'small text-body-secondary mb-0' }, [
      'Imagem ilustrativa: foto de ',
      el('a', { texto: credito.autor, atributos: { href: credito.url, target: '_blank', rel: 'noopener noreferrer' } }),
      ' no Unsplash.',
    ]));
  }
  return fragmento;
}
