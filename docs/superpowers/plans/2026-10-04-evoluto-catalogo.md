# Evoluto: catálogo AJAX (MVP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site Evoluto, um catálogo de tecnologias para qualidade de vida com listagem e detalhes por AJAX, busca/filtro, estados de interface e testes, cumprindo 100% do PDF da avaliação.

**Architecture:** Página única estática (`index.html`) com ES modules. Três camadas sem dependência circular: `estado.js` (funções puras), `api.js` (requisições e erros), `ui.js` (criação de DOM com `createElement`/`textContent`). `app.js` orquestra eventos, histórico e Bootstrap. Dados em `data/itens.json` (listagem) e `data/detalhes/{id}.json` (detalhes).

**Tech Stack:** HTML5, CSS, JavaScript (ES2022 modules), Bootstrap 5.3.3 + Bootstrap Icons 1.11.3 (jsDelivr com SRI), Mocha 10.7.3 + Chai 4.5.0 no navegador, `python -m http.server`.

**Spec:** `docs/superpowers/specs/2026-10-04-evoluto-catalogo-design.md` (leia junto com `.claude/skills/requisitos-avaliacao-web/SKILL.md` e `docs/REGISTRO-FASE-2.md`).

## Global Constraints

- Sem frameworks JS (Vue/React/Angular proibidos). Sem npm no projeto.
- Dados **somente** em JSON local via HTTP. Nunca depender de `file://`.
- Conteúdo dinâmico **só** com `createElement`/`textContent`/`setAttribute`. Proibido `innerHTML` com dados.
- CDNs com SRI (valores verificados em 04/10/2026):
  - `bootstrap@5.3.3/dist/css/bootstrap.min.css` → `sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH`
  - `bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js` → `sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz`
  - `bootstrap-icons@1.11.3/font/bootstrap-icons.min.css` → `sha384-XGjxtQfXaH2tnPFa9x+ruJTuLE3Aa6LhHSWRr1XeTyhezb4abCG4ccI5AkVDxqC+`
  - `mocha@10.7.3/mocha.js` → `sha384-/VN8rpycQqBMCmUxbGhQCidoDumfohYmUaVaBSZdSgV5RCzVXR61v7C1UlcLyx32`
  - `mocha@10.7.3/mocha.css` → `sha384-jZ2RCYAvI2kvHAe2cnaMATvQZRTkY8tVfgGA19oHJXeHgqo0vrl1HyPp0qn//ntj`
  - `chai@4.5.0/chai.js` → `sha384-UGsk7wGXPmT8Rkjs3dQqHbtUCl3FrC28XkDrUzNcoxApimrcDelIzifDRfFQp9en`
- Paleta: Grafite `#1E2A33`, Céu `#F3F7FA`, Névoa `#DCE4EA`, Âmbar `#E8A33D`, Azul `#2D5BA8`, Verde `#2F7D62`. Contraste WCAG AA.
- Fontes: Schibsted Grotesk 600/700 (títulos/interface) + Literata 400/600/itálico (texto).
- Textos em pt-BR, com "você", voz ativa e frases curtas. Saúde: "monitorar/alertar", nunca "diagnosticar/prevenir".
- Todo trecho criado por exigência acadêmica leva comentário `ACAD-xx` (ver registro).
- Commits pequenos, com a linha final `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Servidor: `python -m http.server 8000` na raiz. Testes: `http://localhost:8000/tests/`.

## Review Focus

1. **Hash malformado ou id hostil** (`#produto-%E0`, `#produto-../x`) → o modal mostra "Produto não encontrado", sem exceção no console. Teste em Task 2 (`lerEstadoDaUrl`) e Task 2 (`validarId`).
2. **"Tentar novamente" depois de erro no catálogo** → o `<select>` não duplica eixos. Teste em Task 5 (`criarOpcoesEixos` retorna lista nova) + passo manual em Task 7.
3. **Abrir A e logo depois B** → o modal mostra B. A resposta atrasada de A é descartada. Teste em Task 3 (`cancelado`) + manual em Task 7.
4. **Busca só com espaços ou com acentos/maiúsculas** → trata como vazia / encontra sem acento. Teste em Task 2.
5. **`?q=` com caracteres especiais e `?simular=` preservado ao filtrar** → a URL continua válida e mantém `simular`. Teste em Task 2 (`montarBusca`).

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura semântica, metadados, modal, accordion |
| `css/style.css` | Tokens, componentes, apresentação por horário |
| `js/estado.js` | Funções puras (texto, filtro, id, formatação, URL, período) |
| `js/api.js` | `buscarJSON`, `ErroRequisicao`, simulação (ACAD-04), `criarApi` |
| `js/ui.js` | Criação de nós: card, esqueleto, aviso, opções de eixo, detalhe, link de loja |
| `js/app.js` | Eventos, histórico, Bootstrap, orquestração |
| `data/itens.json`, `data/detalhes/*.json` | Conteúdo |
| `img/produtos/*.webp`, `img/marca/*` | Imagens |
| `tests/index.html`, `tests/*.test.js` | Testes (Mocha + Chai) |
| `README.md` | Entrega |

**Como rodar os testes sem abrir o navegador (verificação do executor):**
```bash
python -m http.server 8000 &   # na raiz do projeto
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu \
  --virtual-time-budget=20000 --dump-dom http://localhost:8000/tests/ \
  | grep -oE '(passes|failures)[^0-9]*<em>[0-9]+</em>'
```
Saída esperada: `passes…<em>N</em>` e `failures…<em>0</em>`.

---

### Task 1: Estrutura de testes no navegador

**Files:**
- Create: `tests/index.html`, `tests/fumaca.test.js`

**Interfaces:**
- Produces: página de testes que importa `tests/*.test.js` como módulos e roda o Mocha (globais `describe`, `it`, `chai`).

- [ ] **Step 1: Criar `tests/index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Testes: Evoluto</title>
  <!-- ACAD-11: testes executáveis pelo professor sem instalar nada -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mocha@10.7.3/mocha.css"
        integrity="sha384-jZ2RCYAvI2kvHAe2cnaMATvQZRTkY8tVfgGA19oHJXeHgqo0vrl1HyPp0qn//ntj" crossorigin="anonymous">
</head>
<body>
  <h1>Testes automatizados do Evoluto</h1>
  <p>Requer o servidor local (<code>python -m http.server 8000</code>). Verde = passou.</p>
  <div id="mocha"></div>
  <div id="area-dom" hidden></div>
  <script src="https://cdn.jsdelivr.net/npm/mocha@10.7.3/mocha.js"
          integrity="sha384-/VN8rpycQqBMCmUxbGhQCidoDumfohYmUaVaBSZdSgV5RCzVXR61v7C1UlcLyx32" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/chai@4.5.0/chai.js"
          integrity="sha384-UGsk7wGXPmT8Rkjs3dQqHbtUCl3FrC28XkDrUzNcoxApimrcDelIzifDRfFQp9en" crossorigin="anonymous"></script>
  <script>mocha.setup({ ui: 'bdd', timeout: 10000 });</script>
  <script type="module">
    await import('./fumaca.test.js');
    mocha.run();
  </script>
</body>
</html>
```

- [ ] **Step 2: Criar `tests/fumaca.test.js`**

```js
const { expect } = chai;

describe('Ambiente de testes', () => {
  it('carrega Mocha e Chai', () => {
    expect(typeof describe).to.equal('function');
  });
});
```

- [ ] **Step 3: Rodar** (comando headless do Mapa de arquivos). Esperado: `passes <em>1</em>`, `failures <em>0</em>`.

- [ ] **Step 4: Commit**
```bash
git add tests && git commit -m "test: estrutura de testes Mocha + Chai no navegador"
```

---

### Task 2: `js/estado.js`, funções puras (T-01, T-02, T-03, T-06, T-07)

**Files:**
- Create: `js/estado.js`, `tests/estado.test.js`
- Modify: `tests/index.html` (importar `estado.test.js`)

**Interfaces:**
- Produces:
  - `FORMATO_ID: RegExp`
  - `normalizarTexto(texto: any) → string`
  - `filtrar(itens: Item[], eixos: Eixo[], { texto?: string, eixo?: string }) → Item[]`
  - `validarId(id: any, itens: Item[]) → boolean`
  - `formatarFaixaPreco(faixa: number) → { simbolo: string, texto: string } | null`
  - `formatarData(iso: 'AAAA-MM-DD') → 'DD/MM/AAAA'`
  - `lerEstadoDaUrl(search: string, hash: string, eixos: Eixo[]) → { texto, eixo, produto: string|null }`
  - `montarBusca(search: string, { texto, eixo }) → string` (`''` ou `'?…'`)
  - `descreverResultado(qtd: number, { texto?, eixoNome? }) → string`
  - `descreverVazio({ texto?, eixoNome? }) → string`
  - `periodoDoDia(hora: 0–23) → 'manha'|'dia'|'tarde'|'noite'`

- [ ] **Step 1: Escrever os testes que falham (`tests/estado.test.js`)**

```js
import {
  normalizarTexto, filtrar, validarId, formatarFaixaPreco, formatarData,
  lerEstadoDaUrl, montarBusca, descreverResultado, descreverVazio, periodoDoDia,
} from '../js/estado.js';

const { expect } = chai;

const eixos = [
  { id: 'sono', nome: 'Sono' },
  { id: 'saude', nome: 'Saúde' },
  { id: 'casa', nome: 'Casa' },
];
const itens = [
  { id: 'lampadas-circadianas', titulo: 'Kit de lâmpadas circadianas', categoria: 'sono', resumo: 'Luz quente à noite.' },
  { id: 'monitor-pressao-braco', titulo: 'Monitor de pressão de braço', categoria: 'saude', resumo: 'Histórico para o médico.' },
  { id: 'robo-aspirador-lidar', titulo: 'Robô aspirador com LiDAR e mop', categoria: 'casa', resumo: 'Chão limpo sem esforço.' },
];

describe('T-01 normalizarTexto', () => {
  it('remove acentos, baixa a caixa e apara espaços', () => {
    expect(normalizarTexto('  Saúde  E   Ação ')).to.equal('saude e acao');
  });
  it('trata null/undefined como texto vazio', () => {
    expect(normalizarTexto(undefined)).to.equal('');
    expect(normalizarTexto(null)).to.equal('');
  });
});

describe('T-02 filtrar', () => {
  it('termo vazio ou só espaços retorna todos, na ordem original', () => {
    expect(filtrar(itens, eixos, { texto: '   ' }).map((i) => i.id))
      .to.deep.equal(itens.map((i) => i.id));
  });
  it('busca no título sem diferenciar acento e maiúscula', () => {
    expect(filtrar(itens, eixos, { texto: 'LAMPADAS' }).map((i) => i.id)).to.deep.equal(['lampadas-circadianas']);
  });
  it('busca no resumo', () => {
    expect(filtrar(itens, eixos, { texto: 'medico' }).map((i) => i.id)).to.deep.equal(['monitor-pressao-braco']);
  });
  it('busca pelo nome do eixo', () => {
    expect(filtrar(itens, eixos, { texto: 'saude' }).map((i) => i.id)).to.deep.equal(['monitor-pressao-braco']);
  });
  it('várias palavras: todas precisam aparecer', () => {
    expect(filtrar(itens, eixos, { texto: 'robo mop' })).to.have.length(1);
    expect(filtrar(itens, eixos, { texto: 'robo noite' })).to.have.length(0);
  });
  it('filtra por eixo e combina com texto', () => {
    expect(filtrar(itens, eixos, { eixo: 'casa' }).map((i) => i.id)).to.deep.equal(['robo-aspirador-lidar']);
    expect(filtrar(itens, eixos, { eixo: 'casa', texto: 'luz' })).to.have.length(0);
  });
  it('eixo inexistente não retorna nada', () => {
    expect(filtrar(itens, eixos, { eixo: 'xyz' })).to.have.length(0);
  });
});

describe('T-03 validarId', () => {
  it('aceita id existente no formato certo', () => {
    expect(validarId('robo-aspirador-lidar', itens)).to.equal(true);
  });
  it('recusa formato inválido, inexistente e não-texto', () => {
    expect(validarId('../itens', itens)).to.equal(false);
    expect(validarId('Robo', itens)).to.equal(false);
    expect(validarId('nao-existe', itens)).to.equal(false);
    expect(validarId(null, itens)).to.equal(false);
  });
});

describe('T-06 formatação', () => {
  it('faixa de preço vira símbolo + texto acessível', () => {
    expect(formatarFaixaPreco(1)).to.deep.equal({ simbolo: '$', texto: 'Faixa de preço: baixa' });
    expect(formatarFaixaPreco(2)).to.deep.equal({ simbolo: '$$', texto: 'Faixa de preço: média' });
    expect(formatarFaixaPreco(3)).to.deep.equal({ simbolo: '$$$', texto: 'Faixa de preço: alta' });
  });
  it('faixa inválida retorna null', () => {
    expect(formatarFaixaPreco(0)).to.equal(null);
    expect(formatarFaixaPreco('2')).to.equal(null);
  });
  it('data ISO vira DD/MM/AAAA sem efeito de fuso horário', () => {
    expect(formatarData('2026-10-04')).to.equal('04/10/2026');
  });
  it('descreve resultado e vazio', () => {
    expect(descreverResultado(1)).to.equal('1 produto');
    expect(descreverResultado(3, { eixoNome: 'Sono', texto: ' luz ' })).to.equal('3 produtos em Sono para “luz”');
    expect(descreverVazio({ texto: 'xyz', eixoNome: 'Cozinha' }))
      .to.equal('Nenhum produto encontrado em Cozinha para “xyz”.');
    expect(descreverVazio({})).to.equal('Nenhum produto encontrado.');
  });
  it('período do dia pela hora local', () => {
    expect(periodoDoDia(6)).to.equal('manha');
    expect(periodoDoDia(12)).to.equal('dia');
    expect(periodoDoDia(18)).to.equal('tarde');
    expect(periodoDoDia(23)).to.equal('noite');
    expect(periodoDoDia(2)).to.equal('noite');
  });
});

describe('T-07 URL', () => {
  it('lê q, eixo válido e produto', () => {
    expect(lerEstadoDaUrl('?q=luz&eixo=sono', '#produto-lampadas-circadianas', eixos))
      .to.deep.equal({ texto: 'luz', eixo: 'sono', produto: 'lampadas-circadianas' });
  });
  it('ignora eixo inválido e hash que não é de produto', () => {
    expect(lerEstadoDaUrl('?eixo=hack', '#catalogo', eixos))
      .to.deep.equal({ texto: '', eixo: '', produto: null });
  });
  it('hash malformado não lança exceção', () => {
    expect(() => lerEstadoDaUrl('', '#produto-%E0%A4%A', eixos)).not.to.throw();
    expect(lerEstadoDaUrl('', '#produto-%E0%A4%A', eixos).produto).to.equal('%E0%A4%A');
  });
  it('monta a busca preservando outros parâmetros e removendo vazios', () => {
    expect(montarBusca('?simular=lento', { texto: 'robô & mop', eixo: 'casa' }))
      .to.equal('?simular=lento&q=rob%C3%B4+%26+mop&eixo=casa');
    expect(montarBusca('?q=velho&eixo=sono', { texto: '  ', eixo: '' })).to.equal('');
  });
});
```

- [ ] **Step 2: Importar no runner.** Em `tests/index.html`, depois de `await import('./fumaca.test.js');`, adicionar:
```js
    await import('./estado.test.js');
```

- [ ] **Step 3: Rodar e confirmar a falha** (headless). Esperado: o Mocha não roda ou acusa erro de import (`estado.js` não existe).

- [ ] **Step 4: Implementar `js/estado.js`**

```js
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
```

- [ ] **Step 5: Rodar os testes.** Esperado: todos passam, `failures <em>0</em>`.

- [ ] **Step 6: Commit**
```bash
git add js/estado.js tests && git commit -m "feat: funções puras de busca, filtro, validação, formatação e URL"
```

---

### Task 3: `js/api.js`, requisições, erros e simulação (T-04, T-05)

**Files:**
- Create: `js/api.js`, `tests/api.test.js`
- Modify: `tests/index.html` (importar `api.test.js`)

**Interfaces:**
- Produces:
  - `class ErroRequisicao extends Error { tipo: 'rede'|'tempo'|'nao-encontrado'|'servidor'|'dados'|'cancelado'; detalhe: string }`
  - `MENSAGENS: Record<tipo, string>`
  - `buscarJSON(url, { fetchFn?, timeout?, signal? }) → Promise<any>`
  - `criarSimulador(search: string, { atraso?: number }) → { modo: string, antes(recurso: 'lista'|'detalhe'): Promise<void> }`
  - `criarApi({ fetchFn?, simulador?, timeout?, base? }) → { carregarCatalogo(signal?), carregarDetalhe(id, signal?) }`

- [ ] **Step 1: Escrever os testes que falham (`tests/api.test.js`)**

```js
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
```

- [ ] **Step 2: Importar no runner** (`await import('./api.test.js');`) e **rodar**. Esperado: falha de import.

- [ ] **Step 3: Implementar `js/api.js`**

```js
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
```
Atenção: `opcoes` passa `fetchFn: undefined` quando não informado. Como o parâmetro padrão só vale para `undefined`, o `fetch` global é usado.

- [ ] **Step 4: Rodar.** Esperado: tudo verde.

- [ ] **Step 5: Commit**
```bash
git add js/api.js tests && git commit -m "feat: requisições com classificação de erros e simulação de estados"
```

---

### Task 4: Conteúdo (`data/`) + teste de contrato (T-09)

**Files:**
- Create: `data/itens.json`, `data/detalhes/{id}.json` (24), `tests/contrato.test.js`
- Modify: `tests/index.html` (importar `contrato.test.js`); `docs/pesquisa/2026-09-29-nichos-e-produtos.md` (nota: SSD de backup trocado por gerenciador de senhas; purificador de ar trocado por fone com cancelamento de ruído)

**Interfaces:**
- Consumes: `criarApi`, `validarId`, `FORMATO_ID`
- Produces: os dados no formato da spec §5

- [ ] **Step 1: Escrever o teste de contrato (`tests/contrato.test.js`)**

```js
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
```

- [ ] **Step 2: Importar no runner e rodar.** Esperado: FAIL (`HTTP 404` em `data/itens.json`).

- [ ] **Step 3: Criar `data/itens.json`** com exatamente estes eixos e itens. Os resumos têm no máximo cerca de 110 caracteres. `alt` descreve a **foto escolhida na Task 8** (escreva um provisório agora e ajuste depois). `credito` é preenchido na Task 8.

Eixos (ordem de exibição):
```json
[
  { "id": "saude",       "nome": "Saúde",       "titulo": "Saúde evoluta",       "icone": "heart-pulse" },
  { "id": "sono",        "nome": "Sono",        "titulo": "Sono evoluto",        "icone": "moon-stars" },
  { "id": "casa",        "nome": "Casa",        "titulo": "Casa evoluta",        "icone": "house" },
  { "id": "seguranca",   "nome": "Segurança",   "titulo": "Segurança evoluta",   "icone": "shield-check" },
  { "id": "privacidade", "nome": "Privacidade", "titulo": "Privacidade evoluta", "icone": "fingerprint" },
  { "id": "cozinha",     "nome": "Cozinha",     "titulo": "Cozinha evoluta",     "icone": "cup-hot" },
  { "id": "energia",     "nome": "Energia",     "titulo": "Energia evoluta",     "icone": "lightning-charge" },
  { "id": "trabalho",    "nome": "Trabalho",    "titulo": "Trabalho evoluto",    "icone": "laptop" }
]
```

Itens (`id` · `titulo` · `categoria` · `faixaPreco` · `primeiroPasso`):

| id | titulo | categoria | faixa | 1º passo |
|---|---|---|---|---|
| monitor-pressao-braco | Monitor de pressão de braço validado | saude | 1 | ✓ |
| pulseira-fitness | Pulseira fitness de entrada | saude | 1 | |
| smartwatch-ecg | Smartwatch com ECG e alerta de ritmo | saude | 3 | |
| lampadas-circadianas | Kit de lâmpadas circadianas | sono | 1 | ✓ |
| controle-ir-universal | Controle infravermelho universal Wi-Fi | sono | 1 | |
| anel-inteligente | Anel inteligente de sono | sono | 3 | |
| interruptor-inteligente | Interruptor inteligente Wi-Fi | casa | 1 | ✓ |
| assistente-voz | Assistente de voz com hub de casa | casa | 2 | |
| robo-aspirador-lidar | Robô aspirador com LiDAR e mop | casa | 3 | |
| camera-wifi-ia | Câmera Wi-Fi com detecção de pessoas | seguranca | 1 | ✓ |
| sensores-porta-janela | Kit de sensores de porta e janela | seguranca | 1 | |
| fechadura-digital | Fechadura digital com biometria | seguranca | 2 | |
| gerenciador-senhas | Gerenciador de senhas | privacidade | 1 | ✓ |
| chave-seguranca-fido2 | Chave de segurança FIDO2 | privacidade | 2 | |
| roteador-mesh | Roteador mesh Wi-Fi 6 | privacidade | 2 | |
| airfryer | Airfryer | cozinha | 2 | ✓ |
| multicooker | Panela elétrica multicooker | cozinha | 2 | |
| purificador-agua | Purificador de água classe A | cozinha | 2 | |
| tomada-inteligente | Tomada inteligente com medição | energia | 1 | ✓ |
| ar-condicionado-inverter | Ar-condicionado inverter | energia | 3 | |
| estacao-energia | Estação de energia portátil | energia | 3 | |
| suporte-monitor | Suporte articulado de monitor | trabalho | 1 | ✓ |
| fone-cancelamento-ruido | Fone com cancelamento de ruído | trabalho | 2 | |
| mesa-regulavel | Mesa com regulagem elétrica de altura | trabalho | 3 | |

Exemplo de item completo:
```json
{
  "id": "lampadas-circadianas",
  "titulo": "Kit de lâmpadas circadianas",
  "categoria": "sono",
  "resumo": "Luz quente à noite, fria de manhã: o relógio do corpo agradece.",
  "imagem": {
    "src": "img/produtos/lampadas-circadianas.webp",
    "alt": "Quarto iluminado por luz âmbar suave ao anoitecer",
    "credito": { "autor": "Nome do fotógrafo", "url": "https://unsplash.com/photos/ID" }
  },
  "primeiroPasso": true,
  "faixaPreco": 1
}
```
Arquivo: `{ "versao": 1, "atualizadoEm": "2026-10-04", "eixos": [...], "itens": [...] }`, com os itens na ordem da tabela.

- [ ] **Step 4: Criar os 24 `data/detalhes/{id}.json`.** Regras (spec §5):
  - `tipoAnalise: "pesquisa"`, `atualizadoEm: "2026-10-04"`.
  - `veredito`: 1–2 frases diretas. `beneficio`: o ganho na rotina, **sem número sem fonte**.
  - `paraQuem`/`naoParaQuem`/`pros`/`contras`/`comoEscolher`: 2–4 itens curtos cada, com contras reais.
  - `exemplos`: marcas e linhas da pesquisa (`docs/pesquisa/2026-09-29-nichos-e-produtos.md`).
  - `evidencias`: usar **somente** as fontes abaixo. Item sem fonte recebe `[]`, e a UI mostra uma nota honesta.
  - `avisoSaude`: texto nos itens marcados abaixo, `null` nos demais.
  - `lojas`: 1–2 lojas, URL de **busca** da loja e `afiliado: false` (ACAD-08/20). Formatos: Amazon `https://www.amazon.com.br/s?k=termo+de+busca`, Mercado Livre `https://lista.mercadolivre.com.br/termo-de-busca`. Gerenciador de senhas: site oficial do Bitwarden `https://bitwarden.com/pt-br/`.

  | id | Evidência (texto curto + fonte + url) | avisoSaude |
  |---|---|---|
  | monitor-pressao-braco | Lista de aparelhos validados clinicamente · validatebp.org · https://www.validatebp.org/ | sim |
  | pulseira-fitness | — | sim |
  | smartwatch-ecg | Meta-análise: sensibilidade ~95% e especificidade ~97% para FA · JACC Advances 2025 · https://www.jacc.org/doi/10.1016/j.jacadv.2025.102133 ; ECG só distingue FA de ritmo sinusal · Apple Support · https://support.apple.com/pt-br/120278 | sim |
  | lampadas-circadianas | Luz ambiente antes de dormir atrasou a melatonina em 99% dos participantes · Gooley et al., JCEM 2011 · https://pubmed.ncbi.nlm.nih.gov/21193540/ | sim |
  | controle-ir-universal | — | null |
  | anel-inteligente | Oura Gen3: 91,7% de acurácia sono x vigília vs. polissonografia · Sleep Medicine 2024 · https://pubmed.ncbi.nlm.nih.gov/38382312/ | sim |
  | interruptor-inteligente | Interruptor é o item de casa inteligente mais buscado no Brasil · CNN Brasil · https://www.cnnbrasil.com.br/economia/money/tecnologia/buscas-por-casa-inteligente-crescem-22-no-brasil-diz-levantamento/ | null |
  | assistente-voz | 17 milhões de dispositivos ligados à Alexa no Brasil em 2024 · Eletrolar News · https://eletrolarnews.com.br/mercado-de-casas-inteligentes-deve-movimentar-us-66-bilhoes-no-brasil-ate-2033/ | null |
  | robo-aspirador-lidar | — | null |
  | camera-wifi-ia | Câmera é o item smart mais desejado (59%) · QuintoAndar/Datafolha via Cimento Itambé · https://www.cimentoitambe.com.br/casas-inteligentes-se-popularizam-no-brasil/ | null |
  | sensores-porta-janela | — | null |
  | fechadura-digital | 45% desejam fechadura eletrônica · QuintoAndar/Datafolha via Cimento Itambé · (mesma URL) | null |
  | gerenciador-senhas | — | null |
  | chave-seguranca-fido2 | Chave de segurança bloqueou 100% dos ataques automatizados, phishing em massa e direcionados no estudo do Google · Google Security Blog 2019 · https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html | null |
  | roteador-mesh | — | null |
  | airfryer | — | null |
  | multicooker | — | null |
  | purificador-agua | Selo INMETRO exige redução de cloro e retenção de partículas por classe · INMETRO · http://www.inmetro.gov.br/consumidor/produtos/filtro2.asp → **usar https** se responder, senão `[]` | null |
  | tomada-inteligente | Standby pode chegar a ~10% do consumo residencial · TechTudo 2026 · https://www.techtudo.com.br/guia/2026/07/tomada-inteligente-economiza-energia-veja-quando-ela-vale-a-pena-edinfoeletro.ghtml | null |
  | ar-condicionado-inverter | — | null |
  | estacao-energia | — | null |
  | suporte-monitor | — | null |
  | fone-cancelamento-ruido | — | null |
  | mesa-regulavel | — | null |

  Texto padrão de `avisoSaude`: "Este aparelho ajuda a monitorar e acompanhar tendências. Ele não substitui consulta nem exame médico. Na dúvida, procure um profissional de saúde."

  Exemplo completo (`data/detalhes/lampadas-circadianas.json`):
```json
{
  "id": "lampadas-circadianas",
  "tipoAnalise": "pesquisa",
  "atualizadoEm": "2026-10-04",
  "veredito": "Um dos upgrades mais baratos para a rotina de sono de quem fica em telas e luz branca até tarde.",
  "beneficio": "A luz esquenta sozinha no fim do dia e esfria de manhã, acompanhando o relógio do corpo sem você precisar lembrar.",
  "paraQuem": ["Quem usa luz branca forte à noite", "Quem quer acordar com luz em vez de alarme"],
  "naoParaQuem": ["Quem já tem iluminação quente e dimerizável", "Quem não tem Wi-Fi estável no quarto"],
  "pros": ["Instala na rosca comum, sem eletricista", "Rotinas por horário no aplicativo", "Funciona com Alexa e Google"],
  "contras": ["Depende de Wi-Fi e do aplicativo da marca", "Qualidade dos apps varia muito entre marcas"],
  "comoEscolher": ["Confira se a temperatura de cor vai de 2700 K ou menos (quente) a 6500 K (fria)", "Prefira marcas com rotina por horário sem precisar de hub", "Veja se o soquete é E27, o mais comum no Brasil"],
  "exemplos": ["Philips Hue", "Positivo Casa Inteligente", "Intelbras"],
  "evidencias": [
    { "texto": "Luz ambiente antes de dormir atrasou o início da melatonina em 99% dos participantes e encurtou sua duração em cerca de 90 minutos.", "fonte": "Gooley et al., The Journal of Clinical Endocrinology & Metabolism, 2011", "url": "https://pubmed.ncbi.nlm.nih.gov/21193540/" }
  ],
  "avisoSaude": "Este aparelho ajuda a criar hábitos de iluminação. Ele não trata insônia nem outros distúrbios do sono. Se o problema persistir, procure um profissional de saúde.",
  "lojas": [
    { "nome": "Mercado Livre", "url": "https://lista.mercadolivre.com.br/lampada-inteligente-wifi", "afiliado": false },
    { "nome": "Amazon", "url": "https://www.amazon.com.br/s?k=lampada+inteligente+wifi", "afiliado": false }
  ]
}
```

- [ ] **Step 5: Rodar.** Esperado: T-09 verde. Se falhar, corrigir o **conteúdo**, nunca afrouxar o teste.

- [ ] **Step 6: Atualizar a nota na pesquisa** (`docs/pesquisa/2026-09-29-nichos-e-produtos.md`, logo acima da tabela "Proposta de catálogo inicial"):
```markdown
> **Atualização 04/10/2026:** no MVP, o purificador de ar deu lugar ao fone com cancelamento de ruído (Trabalho), e o SSD de backup deu lugar ao gerenciador de senhas (Privacidade), o verdadeiro primeiro passo do eixo. Lista final em `data/itens.json`.
```

- [ ] **Step 7: Commit**
```bash
git add data tests docs/pesquisa && git commit -m "feat: catálogo com 24 tecnologias em 8 eixos e teste de contrato dos dados"
```

---

### Task 5: `js/ui.js`, criação de DOM (T-08)

**Files:**
- Create: `js/ui.js`, `tests/ui.test.js`
- Modify: `tests/index.html`

**Interfaces:**
- Consumes: `formatarFaixaPreco`, `formatarData` (Task 2)
- Produces:
  - `criarCard(item, eixo) → HTMLDivElement` (`.col` > `article.card`, botão `[data-produto=id]`)
  - `criarEsqueletos(qtd) → HTMLDivElement[]`
  - `criarAviso({ tipo: 'erro'|'vazio', titulo, mensagem, detalhe?, acao?: { texto, aoClicar } }) → HTMLDivElement`
  - `criarOpcoesEixos(eixos) → HTMLOptionElement[]` (inclui "Todos os eixos" com `value=""`)
  - `criarCarregandoDetalhe() → HTMLDivElement`
  - `criarMetaDetalhe(item, eixo, detalhe) → DocumentFragment`
  - `criarConteudoDetalhe(item, detalhe) → DocumentFragment`
  - `criarLinkLoja(loja) → HTMLParagraphElement`

- [ ] **Step 1: Escrever os testes que falham (`tests/ui.test.js`)**

```js
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
```

- [ ] **Step 2: Importar no runner e rodar.** Esperado: falha de import.

- [ ] **Step 3: Implementar `js/ui.js`**

```js
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
```

- [ ] **Step 4: Rodar.** Esperado: tudo verde.

- [ ] **Step 5: Commit**
```bash
git add js/ui.js tests && git commit -m "feat: componentes de interface criados com textContent"
```

---

### Task 6: `index.html`, `css/style.css` e marca

**Files:**
- Create: `index.html`, `css/style.css`, `img/marca/simbolo.svg`, `img/marca/favicon.svg`, `img/marca/favicon-32.png`, `img/marca/apple-touch-icon.png`

**Interfaces:**
- Produces os ids usados pela Task 7: `#form-busca`, `#busca`, `#filtro-eixo`, `#limpar`, `#status`, `#aviso-catalogo`, `#grade`, `#modal-detalhe`, `#detalhe-titulo`, `#detalhe-meta`, `#detalhe-corpo`, `.hero`, `#menu`.

- [ ] **Step 1: Criar `img/marca/simbolo.svg` e `img/marca/favicon.svg`** (o mesmo símbolo. O favicon usa traço mais grosso)

`simbolo.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><clipPath id="q"><rect x="24" y="8" width="32" height="32" rx="7"/></clipPath></defs>
  <circle cx="26" cy="38" r="18" fill="#E8A33D" clip-path="url(#q)"/>
  <rect x="24" y="8" width="32" height="32" rx="7" fill="none" stroke="#2D5BA8" stroke-width="5"/>
  <circle cx="26" cy="38" r="18" fill="none" stroke="#1E2A33" stroke-width="5"/>
</svg>
```
`favicon.svg`: igual, com `stroke-width="7"` nos dois contornos.

- [ ] **Step 2: Gerar os PNGs pelo Chrome headless**
```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --default-background-color=00000000 --window-size=32,32 --screenshot="$PWD/img/marca/favicon-32.png" "file:///$PWD/img/marca/favicon.svg"
"$CHROME" --headless=new --disable-gpu --default-background-color=FFFFFFFF --window-size=180,180 --screenshot="$PWD/img/marca/apple-touch-icon.png" "file:///$PWD/img/marca/simbolo.svg"
```
Conferir abrindo os PNGs (ferramenta Read). Se o SVG não ocupar o quadro, acrescente `width="100%" height="100%"` ao `<svg>` e gere de novo.

- [ ] **Step 3: Criar `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Evoluto: tecnologia a seu favor | Casa inteligente, sono e saúde</title>
  <meta name="description" content="Guias honestos de tecnologia para viver melhor: casa inteligente, sono, saúde, segurança, energia e mais, com prós, contras e evidências em cada análise.">
  <meta name="theme-color" content="#1E2A33">
  <!-- ACAD-14: domínio provisório até o registro de evoluto.com.br -->
  <link rel="canonical" href="https://evoluto.com.br/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Evoluto">
  <meta property="og:title" content="Evoluto: tecnologia a seu favor">
  <meta property="og:description" content="Guias honestos de tecnologia para viver melhor, com prós, contras e evidências.">
  <meta property="og:url" content="https://evoluto.com.br/">
  <link rel="icon" href="img/marca/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="img/marca/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="img/marca/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@600;700&family=Literata:ital,wght@0,400;0,600;1,400&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        integrity="sha384-XGjxtQfXaH2tnPFa9x+ruJTuLE3Aa6LhHSWRr1XeTyhezb4abCG4ccI5AkVDxqC+" crossorigin="anonymous">
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "name": "Evoluto", "url": "https://evoluto.com.br/", "logo": "https://evoluto.com.br/img/marca/simbolo.svg" },
      { "@type": "WebSite", "name": "Evoluto", "url": "https://evoluto.com.br/", "inLanguage": "pt-BR" }
    ]
  }
  </script>
</head>
<body>
  <a class="visually-hidden-focusable pular" href="#conteudo">Pular para o conteúdo</a>

  <svg class="position-absolute" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="clip-quadrado"><rect x="24" y="8" width="32" height="32" rx="7"/></clipPath>
      <symbol id="simbolo-evoluto" viewBox="0 0 64 64">
        <circle cx="26" cy="38" r="18" fill="#E8A33D" clip-path="url(#clip-quadrado)"/>
        <rect x="24" y="8" width="32" height="32" rx="7" fill="none" stroke="#2D5BA8" stroke-width="5"/>
        <circle cx="26" cy="38" r="18" fill="none" stroke="currentColor" stroke-width="5"/>
      </symbol>
    </defs>
  </svg>

  <header class="sticky-top">
    <nav class="navbar navbar-expand-lg navbar-dark" aria-label="Navegação principal">
      <div class="container">
        <a class="navbar-brand marca" href="#inicio" aria-label="Evoluto, página inicial">
          <svg class="marca-simbolo" aria-hidden="true" focusable="false"><use href="#simbolo-evoluto"/></svg>
          <span class="marca-nome" aria-hidden="true">evoluto</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
                aria-controls="menu" aria-expanded="false" aria-label="Abrir menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="#inicio">Início</a></li>
            <li class="nav-item"><a class="nav-link" href="#catalogo">Catálogo</a></li>
            <li class="nav-item"><a class="nav-link" href="#sobre">Sobre</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <!-- ACAD-20: texto da fase de testes. Na Fase 2, aviso de comissão -->
    <p class="aviso-afiliado mb-0"><span class="container d-block">Projeto em fase de testes: os links ainda não geram comissão. Quando gerarem, avisaremos aqui e em cada link.</span></p>
  </header>

  <main id="conteudo">
    <section id="inicio" class="hero" data-periodo="dia" aria-labelledby="titulo-inicio">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-7">
            <p class="tagline mb-2">Tecnologia a seu favor.</p>
            <h1 id="titulo-inicio">Tecnologia para viver melhor: guias honestos de casa inteligente, sono, saúde e mais</h1>
            <p class="texto fs-5 mt-3">Todo mundo é sapiens. Quase todo mundo já é techno sapiens. Evoluto é quem faz a tecnologia trabalhar para a própria vida, e não o contrário.</p>
            <a href="#catalogo" class="btn btn-ambar btn-lg mt-2">Explorar o catálogo</a>
          </div>
          <div class="col-lg-5 text-center">
            <svg class="simbolo-hero" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <circle class="simbolo-intersecao" cx="26" cy="38" r="18" fill="#E8A33D" clip-path="url(#clip-quadrado)"/>
              <rect x="24" y="8" width="32" height="32" rx="7" fill="none" stroke="#2D5BA8" stroke-width="4"/>
              <circle cx="26" cy="38" r="18" fill="none" stroke="currentColor" stroke-width="4"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section id="catalogo" class="py-5" aria-labelledby="titulo-catalogo">
      <div class="container">
        <h2 id="titulo-catalogo">Catálogo</h2>
        <p class="texto">Tecnologias em 8 eixos da vida. Cada análise diz para quem vale a pena e para quem não vale.</p>
        <form id="form-busca" class="row g-2 align-items-end" role="search" aria-label="Buscar no catálogo">
          <div class="col-12 col-md-6">
            <label for="busca" class="form-label">Buscar produto</label>
            <input type="search" id="busca" name="q" class="form-control" placeholder="Ex.: robô, luz, senha" autocomplete="off">
          </div>
          <div class="col-8 col-md-4">
            <label for="filtro-eixo" class="form-label">Eixo</label>
            <select id="filtro-eixo" name="eixo" class="form-select">
              <option value="">Todos os eixos</option>
            </select>
          </div>
          <div class="col-4 col-md-2 d-grid">
            <button type="button" id="limpar" class="btn btn-azul">Limpar</button>
          </div>
        </form>
        <p class="legenda mt-2">Faixa de preço: <strong>$</strong> até R$ 300 · <strong>$$</strong> de R$ 300 a R$ 1.500 · <strong>$$$</strong> acima de R$ 1.500</p>
        <p id="status" class="status" role="status" aria-live="polite"></p>
        <div id="aviso-catalogo"></div>
        <div id="grade" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4" aria-busy="true"></div>
        <noscript>
          <p class="alert alert-warning mt-3">O catálogo precisa de JavaScript para carregar os produtos. O restante da página funciona normalmente.</p>
        </noscript>
      </div>
    </section>

    <section id="sobre" class="py-5 sobre" aria-labelledby="titulo-sobre">
      <div class="container">
        <h2 id="titulo-sobre">Sobre</h2>
        <div class="accordion texto" id="acordeao-sobre">
          <div class="accordion-item">
            <h3 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sobre-manifesto" aria-expanded="false" aria-controls="sobre-manifesto">Manifesto</button>
            </h3>
            <div id="sobre-manifesto" class="accordion-collapse collapse" data-bs-parent="#acordeao-sobre">
              <div class="accordion-body">
                <p>Todo mundo é sapiens. Quase todo mundo já é techno sapiens: vive cercado de telas, apps e aparelhos.</p>
                <p>Evoluto é quem faz a tecnologia trabalhar para a própria vida. Não luta contra ela, nem vive para ela. Escolhe as ferramentas que devolvem tempo, sono e tranquilidade, e deixa de lado as que só pedem atenção.</p>
                <p class="mb-0">O símbolo do Evoluto é um círculo e um quadrado que se cruzam, a geometria do Homem Vitruviano de Da Vinci. O círculo é você, o quadrado é a tecnologia, e o âmbar é onde os dois se encontram a seu favor.</p>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h3 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sobre-metodo" aria-expanded="false" aria-controls="sobre-metodo">Como escolhemos</button>
            </h3>
            <div id="sobre-metodo" class="accordion-collapse collapse" data-bs-parent="#acordeao-sobre">
              <div class="accordion-body">
                <ul>
                  <li><strong>Evidência primeiro.</strong> Quando existe estudo, teste de laboratório ou certificação, citamos a fonte com link.</li>
                  <li><strong>Prós e contras sempre.</strong> Toda análise diz para quem o produto vale e para quem não vale.</li>
                  <li><strong>Primeiro passo evoluto.</strong> Em cada eixo, marcamos o produto com melhor relação entre impacto na rotina e custo.</li>
                  <li><strong>Faixa, não preço.</strong> Preços mudam todo dia. Mostramos a faixa e você confere o valor na loja.</li>
                  <li><strong>Honestidade sobre o método.</strong> Nesta fase, as análises são baseadas em pesquisa e evidências. Quando testarmos um produto, ele ganha o selo "Testado pelo Evoluto".</li>
                </ul>
                <p class="mb-0">Produtos de saúde ajudam a monitorar e acompanhar tendências. Eles não substituem consulta nem exame médico.</p>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h3 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sobre-transparencia" aria-expanded="false" aria-controls="sobre-transparencia">Transparência</button>
            </h3>
            <div id="sobre-transparencia" class="accordion-collapse collapse" data-bs-parent="#acordeao-sobre">
              <div class="accordion-body">
                <!-- ACAD-20 -->
                <p>O Evoluto será mantido por comissões de programas de afiliados: quando você compra pelo link, a loja paga uma parte da venda, sem custo extra para você. A comissão nunca decide o que recomendamos.</p>
                <p class="mb-0">Nesta fase de testes, nenhum link gera comissão, e por isso eles aparecem como "Link externo". Quando um link passar a ser de afiliado, ele virá identificado como "Link de afiliado", e este aviso será atualizado.</p>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h3 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sobre-projeto" aria-expanded="true" aria-controls="sobre-projeto">Sobre este projeto</button>
            </h3>
            <!-- ACAD-05: área de informações do projeto exigida pelo PDF, aberta por padrão -->
            <div id="sobre-projeto" class="accordion-collapse collapse show" data-bs-parent="#acordeao-sobre">
              <div class="accordion-body">
                <p>Projeto da avaliação prática de <strong>Desenvolvimento Web</strong> da UNEMAT, com o professor Ivan Luiz Pedroso Pires.</p>
                <p>Autor: <strong>Matheus Pinheiro de Camargo Silva</strong>.</p>
                <p class="mb-0">Feito com HTML, CSS, JavaScript e Bootstrap 5. Os produtos são carregados por AJAX (Fetch API) a partir de arquivos JSON, e cada análise faz uma nova requisição ao abrir. Fontes de dados, imagens e bibliotecas estão listadas no README do repositório.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="rodape py-4">
    <div class="container">
      <p class="mb-1">Produtos de saúde ajudam a monitorar, mas não substituem avaliação médica.</p>
      <p class="mb-1">Imagens dos cards são ilustrativas, de fotógrafos do Unsplash, e estão creditadas em cada análise.</p>
      <p class="mb-0">© 2026 Evoluto. Tecnologia a seu favor.</p>
    </div>
  </footer>

  <div class="modal fade" id="modal-detalhe" tabindex="-1" aria-labelledby="detalhe-titulo" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
      <div class="modal-content">
        <div class="modal-header align-items-start">
          <div>
            <h2 class="modal-title fs-4" id="detalhe-titulo">Análise</h2>
            <p id="detalhe-meta" class="detalhe-meta small mb-0"></p>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        <div class="modal-body" id="detalhe-corpo"></div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Criar `css/style.css`**

```css
/* Evoluto: tokens, componentes e apresentação por horário (ver spec §7) */
:root {
  --grafite: #1E2A33;
  --ceu: #F3F7FA;
  --nevoa: #DCE4EA;
  --ambar: #E8A33D;
  --ambar-escuro: #D99229;
  --azul: #2D5BA8;
  --verde: #2F7D62;
  --texto-suave: #4A5A66;
  --fonte-titulo: "Schibsted Grotesk", system-ui, sans-serif;
  --fonte-texto: Literata, Georgia, serif;

  --bs-body-bg: var(--ceu);
  --bs-body-color: var(--grafite);
  --bs-body-font-family: var(--fonte-texto);
  --bs-link-color-rgb: 45, 91, 168;
  --bs-link-hover-color-rgb: 30, 42, 51;
}

body { line-height: 1.65; }
h1, h2, h3, .navbar, .btn, .badge, label, .form-control, .form-select,
.accordion-button, .status, .legenda, .tagline { font-family: var(--fonte-titulo); }
h1 { font-size: clamp(1.9rem, 4.5vw, 3rem); font-weight: 700; letter-spacing: -.02em; line-height: 1.1; }
h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -.01em; }
h3 { font-size: 1.15rem; font-weight: 600; }
.texto { max-width: 68ch; }
section { scroll-margin-top: 96px; }
:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }

.pular { z-index: 1100; top: .5rem; left: .5rem; padding: .5rem 1rem; background: #fff; }

/* Navegação e marca */
.navbar { background: var(--grafite); }
.navbar .nav-link { color: #C9D4DD; }
.navbar .nav-link:hover, .navbar .nav-link:focus-visible { color: #fff; }
.marca { display: inline-flex; align-items: center; gap: .5rem; color: #fff; }
.marca-simbolo { width: 34px; height: 34px; color: #fff; }
.marca-nome { font-family: var(--fonte-titulo); font-weight: 700; font-size: 1.6rem; letter-spacing: -.03em; line-height: 1; }
.aviso-afiliado { background: var(--nevoa); font-size: .875rem; padding: .3rem 0; }

/* Botões */
.btn { border-radius: 6px; }
.btn-ambar {
  --bs-btn-bg: var(--ambar); --bs-btn-border-color: var(--ambar); --bs-btn-color: var(--grafite);
  --bs-btn-hover-bg: var(--ambar-escuro); --bs-btn-hover-border-color: var(--ambar-escuro); --bs-btn-hover-color: var(--grafite);
  --bs-btn-active-bg: var(--ambar-escuro); --bs-btn-active-color: var(--grafite); --bs-btn-font-weight: 600;
}
.btn-azul {
  --bs-btn-color: var(--azul); --bs-btn-border-color: var(--azul);
  --bs-btn-hover-bg: var(--azul); --bs-btn-hover-color: #fff; --bs-btn-hover-border-color: var(--azul);
  --bs-btn-active-bg: var(--azul); --bs-btn-active-color: #fff;
}

/* Apresentação: o fundo acompanha o horário de quem visita (sem JS = "dia") */
.hero { padding: clamp(3rem, 8vw, 6rem) 0; color: var(--grafite); }
.hero[data-periodo="manha"] { background: linear-gradient(180deg, #F7D9B5 0%, var(--ceu) 100%); }
.hero[data-periodo="dia"]   { background: linear-gradient(180deg, #E3F0FA 0%, var(--ceu) 100%); }
.hero[data-periodo="tarde"] { background: linear-gradient(180deg, #8A4B2E 0%, #3B4A6B 100%); color: #fff; }
.hero[data-periodo="noite"] { background: linear-gradient(180deg, var(--grafite) 0%, #2D3E5C 100%); color: var(--ceu); }
.tagline { font-size: 1.25rem; font-weight: 700; color: var(--azul); }
.hero[data-periodo="tarde"] .tagline, .hero[data-periodo="noite"] .tagline { color: var(--ambar); }
.simbolo-hero { width: min(300px, 60vw); height: auto; }
.simbolo-intersecao { animation: acender 1.6s ease-out .3s 1 both; }
@keyframes acender { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .simbolo-intersecao { animation: none; } }

/* Catálogo */
.form-control, .form-select { border-radius: 6px; border-color: #B9C6D1; }
.legenda { font-size: .9rem; color: var(--texto-suave); }
.status { font-weight: 600; min-height: 1.6em; }
.card { border: 1px solid var(--nevoa); border-radius: 12px; overflow: hidden; }
.card:hover { border-color: #9FB3C4; }
.card.primeiro { border: 2px solid var(--verde); }
.card-midia { position: relative; }
.card-img-top { aspect-ratio: 16 / 9; object-fit: cover; height: auto; background: var(--nevoa); }
.legenda-ilustrativa {
  position: absolute; right: .5rem; bottom: .4rem; padding: 0 .4rem; border-radius: 4px;
  background: rgba(30, 42, 51, .75); color: #fff; font: 600 .7rem var(--fonte-titulo);
}
.badge-eixo { background: #E8EEF3; color: var(--grafite); font-weight: 600; }
.badge-primeiro { background: var(--verde); }
.card-text { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.faixa { font-family: var(--fonte-titulo); font-weight: 700; color: var(--texto-suave); letter-spacing: .05em; }
.esqueleto-midia { display: block; aspect-ratio: 16 / 9; }

/* Sobre e rodapé */
.sobre { background: #fff; border-top: 1px solid var(--nevoa); }
.rodape { background: var(--grafite); color: #C9D4DD; font-size: .9rem; }

/* Modal */
.modal-content { border-radius: 16px; border: 0; }
.detalhe-meta { margin-top: .35rem; }
.selo-pesquisa { background: #EAF1FB; color: var(--azul); font-weight: 600; white-space: normal; }
.selo-link { background: var(--nevoa); color: var(--grafite); font-weight: 600; }
.veredito { font-size: 1.15rem; }
.lista-pros li::marker { content: "+  "; color: var(--verde); font-weight: 700; }
.lista-contras li::marker { content: "–  "; color: #B5552B; font-weight: 700; }
```

- [ ] **Step 5: Verificar contraste AA** (Node, sem dependências):
```bash
node -e '
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const r=(a,b)=>{const[x,y]=[L(a),L(b)].sort((m,n)=>n-m);return((x+.05)/(y+.05)).toFixed(2)};
[["#1E2A33","#F3F7FA"],["#2D5BA8","#F3F7FA"],["#1E2A33","#E8A33D"],["#FFFFFF","#2F7D62"],["#4A5A66","#F3F7FA"],["#FFFFFF","#8A4B2E"],["#FFFFFF","#3B4A6B"],["#E8A33D","#3B4A6B"],["#E8A33D","#1E2A33"],["#C9D4DD","#1E2A33"],["#2D5BA8","#EAF1FB"],["#1E2A33","#F7D9B5"]].forEach(([a,b])=>console.log(a,b,r(a,b)));'
```
Esperado: ≥ 4,5 em todos, exceto `#E8A33D`/`#3B4A6B` (tagline de 20 px em negrito = texto grande, exige ≥ 3). Se algum falhar, escurecer o fundo e repetir.

- [ ] **Step 6: Validar o HTML** em https://validator.w3.org/nu/ (Check by file upload). Esperado: 0 erros.

- [ ] **Step 7: Commit**
```bash
git add index.html css img/marca && git commit -m "feat: estrutura semântica, estilos e marca Evoluto"
```

---

### Task 7: `js/app.js`, orquestração, histórico e estados

**Files:**
- Create: `js/app.js`

**Interfaces:**
- Consumes: tudo das Tasks 2, 3 e 5; ids da Task 6; `window.bootstrap` (bundle).

- [ ] **Step 1: Implementar `js/app.js`**

```js
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
const estado = { itens: [], eixos: [], texto: '', eixo: '', controleDetalhe: null, botaoOrigem: null, modalCriouHistorico: false };

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

async function carregarCatalogo() {
  grade.setAttribute('aria-busy', 'true');
  grade.replaceChildren(...criarEsqueletos(6));
  avisoCatalogo.replaceChildren();
  status.textContent = 'Carregando catálogo…';
  try {
    const dados = await api.carregarCatalogo();
    estado.itens = dados.itens;
    estado.eixos = dados.eixos;
    campoEixo.replaceChildren(...criarOpcoesEixos(estado.eixos));

    const daUrl = lerEstadoDaUrl(location.search, location.hash, estado.eixos);
    estado.texto = daUrl.texto;
    estado.eixo = daUrl.eixo;
    campoBusca.value = estado.texto;
    campoEixo.value = estado.eixo;
    renderizarCatalogo();
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
      acao: { texto: 'Tentar novamente', aoClicar: carregarCatalogo },
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
  renderizarCatalogo();
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
  estado.botaoOrigem = botao;
  const hashDoProduto = `#produto-${id}`;
  if (!veioDaUrl && location.hash !== hashDoProduto) {
    history.pushState({ produto: id }, '', `${location.pathname}${location.search}${hashDoProduto}`);
    estado.modalCriouHistorico = true;
  }
  modal.show();

  if (!validarId(id, estado.itens)) {
    tituloDetalhe.textContent = 'Produto não encontrado';
    metaDetalhe.replaceChildren();
    corpoDetalhe.replaceChildren(criarAviso({
      tipo: 'erro',
      titulo: 'Produto não encontrado.',
      mensagem: 'O link pode estar errado ou o produto saiu do catálogo.',
      acao: { texto: 'Voltar ao catálogo', aoClicar: () => modal.hide() },
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
        : { texto: 'Voltar ao catálogo', aoClicar: () => modal.hide() },
    }));
  }
}

elementoModal.addEventListener('hidden.bs.modal', () => {
  estado.controleDetalhe?.abort();
  if (estado.modalCriouHistorico) {
    estado.modalCriouHistorico = false;
    history.back(); // o botão Voltar e o X têm o mesmo efeito
  } else if (location.hash.startsWith('#produto-')) {
    history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  }
  estado.botaoOrigem?.focus();
});

window.addEventListener('popstate', () => {
  const { produto } = lerEstadoDaUrl(location.search, location.hash, estado.eixos);
  const aberto = elementoModal.classList.contains('show');
  if (produto === null && aberto) {
    estado.modalCriouHistorico = false;
    modal.hide();
  } else if (produto !== null && !aberto && estado.itens.length) {
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
```

- [ ] **Step 2: Rodar a suíte** (headless). Esperado: tudo verde (o `app.js` não é importado pelos testes).

- [ ] **Step 3: Verificação manual no navegador** (`http://localhost:8000/`), anotando o resultado de cada M-xx:
  - M-01 24 cards · M-02 aba Rede mostra `detalhes/{id}.json` a cada abertura · M-03 "luz" · M-04 Cozinha = 3 · M-05 "saude" · M-06 "xyzabc" + Limpar busca
  - M-07 `?simular=lento` (esqueleto e spinner) · M-08 `?simular=erro` → Tentar novamente funciona **e o select não duplica eixos** · M-09 `?simular=erro-detalhe`
  - M-10 `#produto-nao-existe` e `#produto-%E0` · M-11 servidor parado + Tentar novamente · M-12 360/768/1280 px sem rolagem horizontal
  - M-13 teclado (Tab, Enter, Esc, Voltar; o foco volta ao botão) · M-14 copiar a URL com o modal aberto → nova aba abre o modal · M-15 JS desativado → `<noscript>`
  - Clicar rápido em dois cards seguidos com `?simular=lento` → o modal mostra o segundo
  - Console sem erros

  Verificação automatizável do DOM final: `msedge --headless=new --virtual-time-budget=10000 --dump-dom http://localhost:8000/ | grep -c 'class="col"'` → esperado `24`.

- [ ] **Step 4: Commit**
```bash
git add js/app.js && git commit -m "feat: catálogo interativo com busca, filtro, modal de detalhes e histórico"
```

---

### Task 8: Imagens ilustrativas (ACAD-10)

**Files:**
- Create: `img/produtos/{id}.webp` (24)
- Modify: `data/itens.json` (`imagem.alt` e `imagem.credito` reais)

- [ ] **Step 1:** Para cada item, encontrar uma foto no Unsplash (licença Unsplash: uso livre, crédito recomendado) que **ilustre o uso** (cena), via `WebSearch` com `site:unsplash.com/photos <termo em inglês>`. Anotar o id da página (`unsplash.com/photos/<slug-id>`) e o nome do fotógrafo.
- [ ] **Step 2:** Baixar em 640×360 WebP:
```bash
curl -sL "https://unsplash.com/photos/<ID>/download?force=true" -o /dev/null -w '%{url_effective}\n'   # URL final images.unsplash.com/photo-…
curl -sL "<URL_FINAL_SEM_QUERY>?fm=webp&w=640&h=360&fit=crop&q=70" -o img/produtos/<id>.webp
file img/produtos/<id>.webp   # esperado: RIFF … Web/P image
```
- [ ] **Step 3:** Atualizar `alt` (descrever **a cena da foto**) e `credito` em `data/itens.json`.
- [ ] **Step 4:** Se não houver foto adequada para um item, usar uma foto do mesmo eixo que funcione e registrar a reutilização no README.
- [ ] **Step 5:** Rodar a suíte (T-09 confere `src`/`alt`) e conferir visualmente.
- [ ] **Step 6: Commit**
```bash
git add img/produtos data/itens.json && git commit -m "feat: imagens ilustrativas com créditos"
```

---

### Task 9: README, marcadores ACAD e conferência final

**Files:**
- Create: `README.md`
- Modify: `docs/REGISTRO-FASE-2.md` (se surgir item novo)

- [ ] **Step 1: Escrever `README.md`** com as seções (spec §10):
  1. **Evoluto: tecnologia a seu favor** · Autor: Matheus Pinheiro de Camargo Silva · Disciplina: Desenvolvimento Web (UNEMAT), prof. Ivan Luiz Pedroso Pires · Tema
  2. **Funcionalidades** (listagem AJAX, detalhes com nova requisição, busca e filtro, estados, URL compartilhável, acessibilidade)
  3. **Como executar:** `git clone …`, `cd …`, `python -m http.server 8000` (ou `py -m http.server 8000` no Windows), abrir `http://localhost:8000/`. Aviso: não abrir o `index.html` direto (`file://`), porque o navegador bloqueia as requisições
  4. **Testes automatizados:** abrir `http://localhost:8000/tests/` e ver a tabela T-01…T-09 (o que verifica)
  5. **Roteiro de testes manuais:** tabela M-01…M-15 (como fazer · resultado esperado), conforme a spec §9 / Parte 3
  6. **Fontes:** dados (JSON próprio, pesquisa em `docs/pesquisa/` com links), imagens (lista dos 24 créditos do Unsplash com links), bibliotecas (Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Mocha 10.7.3, Chai 4.5.0) e fontes (Schibsted Grotesk e Literata, Google Fonts, licença OFL)
  7. **Estrutura de arquivos**
  8. **Fase 2:** link para `docs/REGISTRO-FASE-2.md`, `docs/superpowers/specs/…`, `docs/pesquisa/`

- [ ] **Step 2: Conferir os marcadores ACAD**
```bash
grep -rn "ACAD-" index.html css js tests | sort
```
Esperado: ACAD-04 (api.js, app.js), ACAD-05, ACAD-09, ACAD-10, ACAD-11, ACAD-14, ACAD-20.

- [ ] **Step 3: Conferência final (skill do projeto)**
  1. `git clone` numa pasta temporária → seguir o README ao pé da letra
  2. `/tests/` verde (headless + visual)
  3. Roteiro M-01…M-15 em 360/768/1280 px
  4. Console sem erros · validador W3C sem erros
- [ ] **Step 4: Commit**
```bash
git add README.md docs && git commit -m "docs: README com execução, testes, roteiro manual e fontes"
```
- [ ] **Step 5: Publicar** (depende do usuário): `git remote add origin <URL do repositório privado>` → `git push -u origin main` → o usuário adiciona `IVANLPPIRES` como colaborador e envia o link no SIGAA.
