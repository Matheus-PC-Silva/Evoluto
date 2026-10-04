# Spec: Evoluto, catálogo AJAX com Bootstrap 5 (MVP acadêmico)

- **Data:** 04/10/2026 · **Entrega:** 05/10/2026 (GitHub + link no SIGAA)
- **Origem:** avaliação prática de Desenvolvimento Web (UNEMAT). Requisitos e checklist em `.claude/skills/requisitos-avaliacao-web/SKILL.md`
- **Pesquisa:** `docs/pesquisa/` · **Itens a revisar em produção:** `docs/REGISTRO-FASE-2.md` (ACAD-xx)
- **Amostra visual aprovada:** `docs/marca/amostra-layout.html` (logo 3, "Encontro")

## 1. Objetivo e critérios de sucesso

Um catálogo de tecnologias para qualidade de vida, da marca **Evoluto** ("tecnologia a seu favor"), que:
1. cumpre 100% dos requisitos do PDF (nota máxima é o critério principal);
2. serve de protótipo para um site de afiliados real (Fase 2), com cada atalho acadêmico registrado como ACAD-xx.

**Fora de escopo:** backend, login, preços reais, links com ID de afiliado, analytics, páginas por produto, modo escuro completo do site, **WebMCP** (análise e gatilhos de reavaliação em `docs/pesquisa/2026-10-04-webmcp.md`).

## 2. Restrições técnicas
- HTML, CSS, JavaScript (ES modules) e Bootstrap 5.3 (CSS + bundle JS) + Bootstrap Icons, via jsDelivr **com SRI**. Sem frameworks JS.
- Dados **somente em JSON local**, servido por HTTP (`python -m http.server 8000`). Nunca via `file://`.
- Testes no navegador com Mocha + Chai (CDN) em `/tests/`. Sem npm.

## 3. Estrutura de arquivos
```
index.html
css/style.css
js/api.js        buscarJSON, classificação de erros, simulação (ACAD-04)
js/estado.js     funções puras: normalizarTexto, filtrar, validarId, formatarFaixaPreco, formatarData, ler/escrever URL
js/ui.js         renderização (cards, esqueleto, status, modal) só com createElement/textContent
js/app.js        eventos, histórico (#produto-id, ?q=&eixo=), orquestração
data/itens.json
data/detalhes/{id}.json        (24 arquivos)
img/produtos/{id}.webp         imagens ilustrativas (ACAD-10)
img/marca/simbolo.svg, favicon.svg, favicon-32.png, apple-touch-icon.png
tests/index.html, tests/*.test.js
docs/…  README.md
```

## 4. Página (abordagem A: uma página + modal + accordion)

```
<head>  title "Evoluto: tecnologia a seu favor | Casa inteligente, sono e saúde" · meta description · OG (ACAD-14)
        · canonical (ACAD-14) · theme-color · favicon · JSON-LD Organization + WebSite
<header class="sticky-top">  link "Pular para o conteúdo" · navbar (logo Encontro + "evoluto"; Início · Catálogo · Sobre;
        colapsa em lg; fecha ao clicar no celular) · faixa de aviso de afiliado (ACAD-20)
<main id="conteudo">
  section#inicio   tagline (p) · h1 descritivo · trecho do manifesto · botão "Explorar o catálogo"
                   · símbolo grande (aria-hidden), interseção âmbar "acende" 1x ao carregar (sem com reduced-motion)
                   · fundo pelo horário local: manhã 5–9h, dia 9–17h, fim de tarde 17–19h, noite 19–5h (sem JS = dia)
  section#catalogo h2 · form role=search: input search "Buscar produto" + select "Eixo" + "Limpar"
                   · legenda da faixa de preço · região de status aria-live · grid row-cols-1/sm-2/lg-3/xl-4
                   · <noscript>
  section#sobre    h2 · accordion: Manifesto | Como escolhemos | Transparência | Sobre este projeto (aberto, ACAD-05)
<footer>  aviso de saúde · declaração Amazon só se houver link afiliado (ACAD-20) · créditos · ©
Modal #detalhe  modal-lg, scrollable, fullscreen-sm-down, aria-labelledby
```
Hierarquia de títulos: h1 (início) → h2 (seções) → h3 (cards, itens do accordion). No modal: h2 (título) → h3 (blocos).

## 5. Dados

### `data/itens.json`
```json
{ "versao": 1, "atualizadoEm": "2026-10-04",
  "eixos": [{ "id": "sono", "nome": "Sono", "titulo": "Sono evoluto", "icone": "moon" }],
  "itens": [{ "id": "lampadas-circadianas", "titulo": "…", "categoria": "sono", "resumo": "…",
              "imagem": { "src": "img/produtos/lampadas-circadianas.webp", "alt": "…", "credito": { "autor": "…", "url": "…" } },
              "primeiroPasso": true, "faixaPreco": 2 }] }
```
- 8 eixos: saude, sono, casa, seguranca, privacidade, cozinha, energia, trabalho. 3 itens cada, total 24 (lista em `docs/pesquisa/2026-09-29-nichos-e-produtos.md`, com o fone com cancelamento de ruído no lugar do purificador de ar).
- Um `primeiroPasso: true` por eixo. `faixaPreco` ∈ {1,2,3}. `id` ∈ `^[a-z0-9-]+$` e único.

### `data/detalhes/{id}.json`
```json
{ "id": "…", "tipoAnalise": "pesquisa", "atualizadoEm": "2026-10-04",
  "veredito": "…", "beneficio": "…", "paraQuem": [], "naoParaQuem": [], "pros": [], "contras": [],
  "comoEscolher": [], "exemplos": [], "evidencias": [{ "texto": "…", "fonte": "…", "url": "…" }],
  "avisoSaude": null, "lojas": [{ "nome": "…", "url": "…", "afiliado": false }] }
```
- Não repete título, resumo nem imagem (o modal os reutiliza do card).
- Produtos **genéricos** com exemplos de marcas. Lojas apontam para a busca da loja (ACAD-07, ACAD-08).

**Regras editoriais:** número no `beneficio` só com fonte em `evidencias`. Na saúde, usar "monitorar/alertar", nunca "diagnosticar/prevenir". `avisoSaude` preenchido nos eixos saude e sono quando aplicável. Contras reais em todo item.

## 6. Comportamento

### 6.1 Requisição (`js/api.js`)
- `buscarJSON(url, { fetchFn = fetch, timeout = 8000, signal })` lança `ErroRequisicao` com `tipo` ∈ `rede | tempo | nao-encontrado | servidor | dados | cancelado`.
- Simulação (ACAD-04): `?simular=erro` e `?simular=erro-detalhe` falham **só na 1ª tentativa**. `?simular=lento` adiciona 1,5 s.
- Os detalhes são buscados a **cada abertura** (sem cache). Uma nova abertura cancela a anterior (`AbortController`). `cancelado` não gera mensagem.

### 6.2 Estados
| Onde | Estado | UI |
|---|---|---|
| Catálogo | carregando | 6 cards em esqueleto, `aria-busy`, status "Carregando catálogo…" |
| | sucesso | cards + "N produtos" (com termo e eixo quando houver), anunciado com atraso |
| | vazio | mensagem com termo e eixo + "Limpar busca" |
| | erro | `role="alert"`, mensagem por tipo + detalhe técnico pequeno + "Tentar novamente" |
| Modal | carregando | título do card + spinner "Carregando análise…" |
| | erro rede/tempo/servidor | alerta + "Tentar novamente" (mesmo id) |
| | nao-encontrado / id inválido / dados | mensagem + "Voltar ao catálogo" |

### 6.3 Busca e filtro
- `filtrar(itens, eixos, {texto, eixo})`: sem acento, sem diferença de maiúsculas, `trim`. Todas as palavras precisam aparecer em título + resumo + nome do eixo. Termo vazio retorna tudo. Mantém a ordem do JSON.
- Gatilhos: `input` com espera de 250 ms, `change` no select, `submit` com `preventDefault`, e "Limpar".
- URL: `?q=&eixo=` via `replaceState`. Na carga, aplica os parâmetros válidos e ignora eixo inválido.

### 6.4 Modal e histórico
- Abrir: `pushState` com `#produto-{id}`. Fechar (X, Esc, fundo): `history.back()` se a entrada foi criada pelo modal. `popstate` sincroniza.
- Link direto `#produto-{id}`: abre o modal depois que o catálogo carrega. Antes de buscar, valida o id (formato + existência).
- Ao fechar, o foco volta para o botão de origem.

### 6.5 Modal: ordem do conteúdo
Cabeçalho (h2, eixo, selo "Análise baseada em pesquisa e evidências" (ACAD-09), `<time>`) → Veredito → Benefício evoluto → Para quem é / não é → Prós / Contras (`ul`) → Como escolher → Exemplos no mercado ("confira o modelo na loja") → O que diz a evidência (`cite` + link) → Aviso de saúde (se houver) → Onde encontrar (botões; selo "Link externo"/"Link de afiliado" e `rel` conforme `afiliado`, ACAD-20) → crédito da imagem.

### 6.6 Card
`article.card` (com `.primeiro` + selo verde "Primeiro passo evoluto" quando for o caso) → imagem 16:9 `loading=lazy` com width/height e legenda "Imagem ilustrativa" → selo do eixo com ícone → h3 → resumo (3 linhas) → faixa (`aria-hidden`) + texto oculto "Faixa de preço: baixa/média/alta" → botão "Ver análise" + nome do produto em texto oculto.

## 7. Visual (Parte 4, aprovada)
- **Paleta:** Grafite `#1E2A33` · Céu `#F3F7FA` · Névoa `#DCE4EA` · Âmbar `#E8A33D` (botão principal, texto grafite) · Azul `#2D5BA8` (links, foco, secundário) · Verde `#2F7D62` (Primeiro passo, prós). Contraste AA verificado na implementação.
- **Fontes:** Schibsted Grotesk 600/700 (títulos e interface) + Literata 400/600/itálico (texto, entrelinha 1,65, ≤ 68ch).
- **Logo "Encontro":** círculo (humano, grafite/claro) ∩ quadrado arredondado (tecnologia, azul), interseção âmbar. Assinatura = símbolo + "evoluto" em minúsculas. Conceito em SVG próprio (ACAD-21).
- **Componentes:** cantos 6/12/16 px, cards sem sombra com borda Névoa (hover só troca a borda), alinhamento à esquerda, nenhuma animação além do símbolo da apresentação.
- **Tom:** "você", voz ativa, botões dizem a ação, erros dizem o que houve e o que fazer.

## 8. Acessibilidade e SEO (resumo)
Pular para o conteúdo · foco visível · labels em todos os campos · `alt` descritivo · `aria-live`/`role=alert` · nomes acessíveis únicos · reduced-motion · links externos avisam nova aba · `scroll-margin-top` · conteúdo estático útil sem JS · sem estrelas de avaliação inventadas · sem preço estático.

## 9. Testes
- **TDD** (Mocha + Chai, `/tests/`): T-01 normalizarTexto · T-02 filtrar · T-03 validarId · T-04 buscarJSON (com `fetchFn` simulado) · T-05 simulação · T-06 formatação · T-07 URL · T-08 renderização (estrutura, nomes acessíveis, `rel` por `afiliado`, sem innerHTML) · T-09 contrato dos dados (todos os itens e detalhes).
- **Manual** (README): M-01 a M-15, conforme a Parte 3.
- **Conferência final:** clone limpo, testes verdes, roteiro manual em 360/768/1280 px, console sem erros, validador W3C, repositório acessível e link no SIGAA.

## 10. README (seções)
Nome completo, disciplina, tema · Funcionalidades · Fontes (dados, pesquisa, imagens, bibliotecas, fontes) · Como executar · Testes automatizados e roteiro manual · Estrutura · Fase 2 (link para o registro).

## 11. Autor e entrega
- Autor: **Matheus Pinheiro de Camargo Silva** (README e "Sobre este projeto").
- Repositório **privado** no GitHub durante o desenvolvimento. Ao concluir: compartilhar com `IVANLPPIRES` e enviar o link no SIGAA até 05/10/2026.
