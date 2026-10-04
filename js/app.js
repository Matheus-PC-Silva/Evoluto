// Orquestra o catálogo: carregamento AJAX, busca/filtro, modal de detalhes e histórico do navegador.
import { criarApi, criarSimulador } from './api.js';
import {
  filtrar, validarId, lerEstadoDaUrl, montarBusca, descreverResultado, descreverVazio, periodoDoDia,
} from './estado.js';
import {
  criarCard, criarEsqueletos, criarAviso, criarOpcoesEixos,
  criarCarregandoDetalhe, criarMetaDetalhe, criarConteudoDetalhe,
} from './ui.js';

const ESPERA_DIGITACAO = 250;
const RECUPERAVEIS = ['rede', 'tempo', 'servidor'];

const api = criarApi({ simulador: criarSimulador(location.search) }); // ACAD-04
const estado = {
  itens: [], eixos: [], texto: '', eixo: '', catalogoCarregado: false,
  controleDetalhe: null, botaoOrigem: null, modalCriouHistorico: false, hashCriado: '', modalAberto: false, modalAbrindo: false,
};

const $ = (seletor) => document.querySelector(seletor);
const campoBusca = $('#busca');
const campoEixo = $('#filtro-eixo');
const grade = $('#grade');
const status = $('#status');
const avisoCatalogo = $('#aviso-catalogo');
const elementoModal = $('#modal-detalhe');
const modal = bootstrap.Modal.getOrCreateInstance(elementoModal);
const tituloDetalhe = $('#detalhe-titulo');
const metaDetalhe = $('#detalhe-meta');
const corpoDetalhe = $('#detalhe-corpo');

const eixoPorId = (id) => estado.eixos.find((e) => e.id === id);

// ---------- Catálogo ----------

// focarResultado: depois de "Tentar novamente", o botão clicado some; o foco vai para o primeiro card.
async function carregarCatalogo({ focarResultado = false } = {}) {
  grade.setAttribute('aria-busy', 'true');
  grade.replaceChildren(...criarEsqueletos(6));
  avisoCatalogo.replaceChildren();
  status.textContent = 'Carregando catálogo…';
  try {
    const dados = await api.carregarCatalogo();
    estado.itens = dados.itens;
    estado.eixos = dados.eixos;
    estado.catalogoCarregado = true;
    campoEixo.replaceChildren(...criarOpcoesEixos(estado.eixos));

    const daUrl = lerEstadoDaUrl(location.search, location.hash, estado.eixos);
    estado.texto = daUrl.texto;
    estado.eixo = daUrl.eixo;
    campoBusca.value = estado.texto;
    campoEixo.value = estado.eixo;
    renderizarCatalogo();
    if (focarResultado) (grade.querySelector('[data-produto]') ?? campoBusca).focus();
    if (daUrl.produto !== null) abrirDetalhe(daUrl.produto, { veioDaUrl: true });
  } catch (erro) {
    grade.replaceChildren();
    grade.setAttribute('aria-busy', 'false');
    status.textContent = '';
    avisoCatalogo.replaceChildren(criarAviso({
      tipo: 'erro',
      titulo: 'Não foi possível carregar o catálogo.',
      mensagem: erro.message,
      detalhe: erro.detalhe,
      acao: { texto: 'Tentar novamente', aoClicar: () => carregarCatalogo({ focarResultado: true }) },
    }));
  }
}

function renderizarCatalogo() {
  const filtro = { texto: estado.texto, eixoNome: eixoPorId(estado.eixo)?.nome ?? '' };
  const encontrados = filtrar(estado.itens, estado.eixos, { texto: estado.texto, eixo: estado.eixo });
  grade.replaceChildren(...encontrados.map((item) => criarCard(item, eixoPorId(item.categoria))));
  grade.setAttribute('aria-busy', 'false');

  if (encontrados.length === 0) {
    status.textContent = descreverVazio(filtro);
    avisoCatalogo.replaceChildren(criarAviso({
      tipo: 'vazio',
      titulo: descreverVazio(filtro),
      mensagem: 'Tente outro termo ou veja todos os eixos.',
      acao: { texto: 'Limpar busca', aoClicar: limparBusca },
    }));
  } else {
    status.textContent = descreverResultado(encontrados.length, filtro);
    avisoCatalogo.replaceChildren();
  }
}

function aplicarFiltro() {
  estado.texto = campoBusca.value;
  estado.eixo = campoEixo.value;
  const busca = montarBusca(location.search, estado);
  history.replaceState(history.state, '', `${location.pathname}${busca}${location.hash}`);
  // Enquanto o catálogo carrega ou está em erro, o filtro só fica guardado (na URL) e é aplicado
  // quando os dados chegarem; assim o esqueleto e o aviso de erro não são trocados por um falso "vazio".
  if (estado.catalogoCarregado) renderizarCatalogo();
}

function limparBusca() {
  campoBusca.value = '';
  campoEixo.value = '';
  aplicarFiltro();
  campoBusca.focus();
}

let temporizador;
campoBusca.addEventListener('input', () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(aplicarFiltro, ESPERA_DIGITACAO);
});
campoEixo.addEventListener('change', aplicarFiltro);
$('#limpar').addEventListener('click', limparBusca);
$('#form-busca').addEventListener('submit', (evento) => {
  evento.preventDefault(); // busca sem recarregar a página
  clearTimeout(temporizador);
  aplicarFiltro();
});

grade.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-produto]');
  if (botao) abrirDetalhe(botao.dataset.produto, { botao });
});

// ---------- Detalhes (nova requisição a cada abertura) ----------

function abrirDetalhe(id, { botao = null, veioDaUrl = false } = {}) {
  // Sem botão de origem (link direto ou navegação), o foco volta ao botão do produto no catálogo ao fechar.
  estado.botaoOrigem = botao ?? [...grade.querySelectorAll('[data-produto]')].find((b) => b.dataset.produto === id) ?? null;
  const hashDoProduto = `#produto-${id}`;
  if (!veioDaUrl && location.hash !== hashDoProduto) {
    history.pushState({ produto: id }, '', `${location.pathname}${location.search}${hashDoProduto}`);
    estado.modalCriouHistorico = true;
    estado.hashCriado = hashDoProduto;
  }
  if (!estado.modalAberto) {
    estado.modalAberto = true;
    estado.modalAbrindo = true;
    modal.show();
  }

  if (!validarId(id, estado.itens)) {
    estado.controleDetalhe?.abort(); // uma análise ainda carregando não pode aparecer aqui
    tituloDetalhe.textContent = 'Produto não encontrado';
    metaDetalhe.replaceChildren();
    corpoDetalhe.replaceChildren(criarAviso({
      tipo: 'erro',
      titulo: 'Produto não encontrado.',
      mensagem: 'O link pode estar errado ou o produto saiu do catálogo.',
      acao: { texto: 'Voltar ao catálogo', aoClicar: fecharModal },
    }));
    return;
  }
  carregarDetalhe(estado.itens.find((item) => item.id === id));
}

async function carregarDetalhe(item) {
  estado.controleDetalhe?.abort(); // descarta a resposta de uma abertura anterior
  const controle = new AbortController();
  estado.controleDetalhe = controle;

  tituloDetalhe.textContent = item.titulo;
  metaDetalhe.replaceChildren();
  corpoDetalhe.replaceChildren(criarCarregandoDetalhe());

  try {
    const detalhe = await api.carregarDetalhe(item.id, controle.signal);
    if (controle.signal.aborted) return;
    metaDetalhe.replaceChildren(criarMetaDetalhe(item, eixoPorId(item.categoria), detalhe));
    corpoDetalhe.replaceChildren(criarConteudoDetalhe(item, detalhe));
  } catch (erro) {
    if (erro.tipo === 'cancelado' || controle.signal.aborted) return;
    const recuperavel = RECUPERAVEIS.includes(erro.tipo);
    const titulo = {
      'nao-encontrado': 'Análise não encontrada.',
      dados: 'Os dados deste produto estão com problema.',
    }[erro.tipo] ?? 'Não foi possível carregar a análise.';
    corpoDetalhe.replaceChildren(criarAviso({
      tipo: 'erro',
      titulo,
      mensagem: recuperavel ? erro.message : 'Volte ao catálogo e escolha outro produto.',
      detalhe: erro.detalhe,
      acao: recuperavel
        ? { texto: 'Tentar novamente', aoClicar: () => carregarDetalhe(item) }
        : { texto: 'Voltar ao catálogo', aoClicar: fecharModal },
    }));
  }
}

// O Bootstrap ignora hide() durante a animação de abertura; nesse caso, fecha assim que ela terminar.
function fecharModal() {
  if (estado.modalAbrindo) {
    elementoModal.addEventListener('shown.bs.modal', () => modal.hide(), { once: true });
  } else {
    modal.hide();
  }
}

elementoModal.addEventListener('shown.bs.modal', () => { estado.modalAbrindo = false; });

elementoModal.addEventListener('hidden.bs.modal', () => {
  estado.modalAberto = false;
  estado.controleDetalhe?.abort();
  // Só volta no histórico se a entrada atual for a que o modal criou; se o endereço mudou
  // depois (outro produto digitado na URL), voltar reabriria o produto anterior.
  const voltar = estado.modalCriouHistorico && location.hash === estado.hashCriado;
  estado.modalCriouHistorico = false;
  if (voltar) {
    history.back(); // o botão Voltar e o X têm o mesmo efeito
  } else if (location.hash.startsWith('#produto-')) {
    history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  }
  estado.botaoOrigem?.focus();
});

window.addEventListener('popstate', () => {
  const { produto } = lerEstadoDaUrl(location.search, location.hash, estado.eixos);
  if (produto === null && estado.modalAberto) {
    estado.modalCriouHistorico = false;
    fecharModal();
  } else if (produto !== null && estado.itens.length) { // também troca o produto se o modal já estiver aberto
    abrirDetalhe(produto, { veioDaUrl: true });
  }
});

// ---------- Página ----------

$('.hero').dataset.periodo = periodoDoDia(new Date().getHours());

// No celular, o menu fecha depois de escolher um link.
const menu = $('#menu');
menu.addEventListener('click', (evento) => {
  if (evento.target.closest('.nav-link') && menu.classList.contains('show')) {
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }
});

carregarCatalogo();
