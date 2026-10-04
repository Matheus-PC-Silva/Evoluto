# Evoluto: tecnologia a seu favor

Catálogo interativo de tecnologias que melhoram a qualidade de vida (saúde, sono, casa, segurança, privacidade, cozinha, energia e trabalho), com listagem e detalhes carregados por AJAX, busca e filtro sem recarregar a página.

| | |
|---|---|
| **Autor** | Matheus Pinheiro de Camargo Silva |
| **Disciplina** | Desenvolvimento Web (UNEMAT), prof. Ivan Luiz Pedroso Pires |
| **Atividade** | Avaliação prática individual: website AJAX com Bootstrap |
| **Tema** | Evoluto, um catálogo honesto de tecnologia para viver melhor, base para um futuro site de afiliados |

## Funcionalidades

- **Listagem dinâmica (AJAX):** 24 produtos em 8 eixos, carregados por `fetch` de `data/itens.json`. Cada item tem identificador, título, categoria (eixo) e resumo. Os cards são montados no navegador.
- **Consulta de detalhes (nova requisição AJAX):** ao clicar em "Ver análise", o site busca `data/detalhes/{id}.json` e mostra num modal do Bootstrap: veredito, para quem é e não é, prós e contras, como escolher, evidências com fonte e onde encontrar.
- **Busca e filtro:** busca por texto (ignora acentos e maiúsculas, todas as palavras precisam aparecer) e filtro por eixo, combináveis, sem recarregar a página.
- **Estados da interface:** cards em esqueleto durante o carregamento, mensagem com "Limpar busca" quando não há resultados, e aviso de erro com "Tentar novamente", tanto na lista quanto no modal.
- **URL compartilhável:** a busca vai para a URL (`?q=…&eixo=…`) e o modal aberto também (`#produto-{id}`). O botão Voltar do navegador fecha o modal.
- **Componentes Bootstrap 5:** navbar responsiva, cards, botões, formulário de busca, **modal** (detalhes) e **accordion** (seção Sobre).
- **Acessibilidade:** HTML semântico (`header`, `nav`, `main`, `section`, `article`, `footer`), hierarquia de títulos h1 → h2 → h3, `label` em todos os campos, `alt` descritivo, link "Pular para o conteúdo", região `aria-live` para o status, foco visível e respeito a "reduzir movimento".

## Como executar

O site **precisa de um servidor HTTP local**: abrindo o `index.html` direto (`file://`), o navegador bloqueia as requisições AJAX.

1. Clone o repositório e entre na pasta:
   ```bash
   git clone <URL-do-repositório>
   cd <pasta-do-repositório>
   ```
2. Inicie um servidor (Python 3, já instalado na maioria dos sistemas):
   ```bash
   python -m http.server 8000
   ```
   No Windows, se `python` não for reconhecido, use `py -m http.server 8000`.
   Alternativa com Node.js: `npx serve -l 8000`.
3. Abra **http://localhost:8000/** no navegador.

É necessário estar conectado à internet, porque Bootstrap, ícones e fontes vêm de CDN.

## Testes automatizados

Com o servidor rodando, abra **http://localhost:8000/tests/**. Os testes rodam no próprio navegador (Mocha + Chai via CDN), sem instalar nada. Verde = passou. São 49 testes no total.

| Grupo | O que verifica |
|---|---|
| T-01 normalizarTexto | Remove acentos, baixa maiúsculas e apara espaços ("  Saúde " → "saude") |
| T-02 filtrar | Busca por título, resumo e eixo; várias palavras; filtro por eixo; combinação; termo vazio; sem resultado |
| T-03 validarId | Aceita só ids existentes e no formato `a-z0-9-`; recusa `../itens` e ids inexistentes |
| T-04 buscarJSON | Sucesso; 404 → "não encontrado"; 500 → "servidor"; falha de rede; JSON inválido; tempo esgotado; cancelamento |
| T-05 simulação | `?simular=erro` e `?simular=erro-detalhe` falham só na 1ª tentativa; `?simular=lento` atrasa; URLs da API |
| T-06 formatação | Faixa de preço ($, $$, $$$ + texto para leitores de tela), data DD/MM/AAAA, mensagens de resultado e vazio, período do dia |
| T-07 URL | Lê e monta `?q=`, `?eixo=` e `#produto-{id}`, inclusive com hash malformado |
| T-08 renderização | Card com `article` + `h3`, `alt`, botão com nome acessível; avisos (`role="alert"` só em erro); links de loja com `rel` correto; ordem das seções do modal; texto sempre inserido como texto (sem HTML) |
| T-09 contrato dos dados | 8 itens ou mais com id, título, categoria e resumo; ids únicos; 1 "primeiro passo" por eixo; todo item tem arquivo de detalhes completo; nenhum texto de saúde promete diagnosticar ou prevenir |

## Roteiro de testes manuais

Com o servidor rodando em `http://localhost:8000/`:

| # | Teste | Como fazer | Resultado esperado |
|---|---|---|---|
| M-01 | Listagem | Abrir o site | 24 cards e o texto "24 produtos" |
| M-02 | Detalhes por nova requisição | Abrir DevTools (F12) › aba **Rede** e clicar em "Ver análise" | Aparece a requisição `detalhes/{id}.json` e o modal é preenchido. Cada abertura faz uma nova requisição |
| M-03 | Busca | Digitar `luz` no campo de busca | 4 produtos, sem recarregar a página |
| M-04 | Filtro | Escolher "Cozinha" no campo Eixo | 3 produtos |
| M-05 | Busca sem acento | Digitar `saude` | Encontra os 3 produtos do eixo Saúde |
| M-06 | Sem resultados | Digitar `xyzabc` | Mensagem "Nenhum produto encontrado…" e botão **Limpar busca**, que volta aos 24 |
| M-07 | Carregando | Abrir http://localhost:8000/?simular=lento | Cards em esqueleto por cerca de 1,5 s. No modal, spinner "Carregando análise…" |
| M-08 | Erro na lista + tentar novamente | Abrir http://localhost:8000/?simular=erro | Aviso "Não foi possível carregar o catálogo." → clicar em **Tentar novamente** → o catálogo carrega |
| M-09 | Erro no detalhe + tentar novamente | Abrir http://localhost:8000/?simular=erro-detalhe e clicar em "Ver análise" | Aviso de erro dentro do modal → **Tentar novamente** → a análise carrega |
| M-10 | Produto inexistente | Abrir http://localhost:8000/#produto-nao-existe | Modal "Produto não encontrado" com "Voltar ao catálogo" |
| M-11 | Erro real de conexão | Com o site aberto, parar o servidor (Ctrl+C) e clicar em "Ver análise" | Aviso de erro de conexão com "Tentar novamente". Reinicie o servidor e tente de novo |
| M-12 | Responsividade | DevTools › modo dispositivo (Ctrl+Shift+M) em 360, 768 e 1280 px | 1, 2 e 4 colunas; menu ☰ no celular; sem rolagem horizontal; modal em tela cheia no celular |
| M-13 | Teclado | Navegar com Tab, Enter e Esc; abrir um modal e apertar Voltar no navegador | Foco visível; Esc e Voltar fecham o modal; o foco volta ao botão "Ver análise" |
| M-14 | Link compartilhável | Com um modal aberto, copiar a URL e abrir em outra aba | O modal do mesmo produto abre direto |
| M-15 | Sem JavaScript | Desativar o JavaScript do navegador e recarregar | Apresentação e seção Sobre aparecem, com aviso de que o catálogo precisa de JavaScript |

Os parâmetros `?simular=` existem só para a demonstração (o JSON local carrega instantaneamente). `erro` e `erro-detalhe` falham apenas na primeira tentativa, para o "Tentar novamente" funcionar.

## Fontes e recursos

**Dados:** conteúdo próprio em JSON (`data/`), escrito a partir da pesquisa em [`docs/pesquisa/`](docs/pesquisa/). As evidências citadas em cada análise têm link para a fonte original (PubMed, JACC Advances, Suporte Apple, Google Security Blog, CNN Brasil, entre outras). Os links de loja apontam para a página de busca da loja e **não** contêm ID de afiliado.

**Bibliotecas (via jsDelivr, com verificação de integridade SRI):**
- [Bootstrap 5.3.3](https://getbootstrap.com/) (CSS e JS), licença MIT
- [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/), licença MIT
- [Mocha 10.7.3](https://mochajs.org/) e [Chai 4.5.0](https://www.chaijs.com/), licença MIT, usados só na página de testes

**Fontes tipográficas ([Google Fonts](https://fonts.google.com/), licença OFL):** Schibsted Grotesk (títulos) e Literata (texto).

**Marca:** símbolo "Encontro" (círculo e quadrado, homenagem à geometria do Homem Vitruviano) desenhado em SVG para este projeto.

**Imagens:** fotos do [Unsplash](https://unsplash.com/), sob a [Licença Unsplash](https://unsplash.com/license), recortadas em 640×360 e convertidas para WebP. Elas aparecem como "Imagem ilustrativa": mostram o contexto de uso, não o produto exato.

| Produto | Foto |
|---|---|
| Monitor de pressão de braço validado | [Marcelo Leal](https://unsplash.com/photos/oe8lel1znuo) |
| Pulseira fitness de entrada | [FitNish Media](https://unsplash.com/photos/q8Emkm9ooig) |
| Smartwatch com ECG e alerta de ritmo | [Ivett M](https://unsplash.com/photos/ev8AhtPgamI) |
| Kit de lâmpadas circadianas | [Archee Lal](https://unsplash.com/photos/hkCXcR2mcds) |
| Controle infravermelho universal Wi-Fi | [Vladislav Nikonov](https://unsplash.com/photos/JBw9IlbHhVY) |
| Anel inteligente de sono | [Andrey Matveev](https://unsplash.com/photos/VUmPbOXmUoQ) |
| Interruptor inteligente Wi-Fi | [Jaye Haych](https://unsplash.com/photos/bPOEB3sy4As) |
| Assistente de voz com hub de casa | [Lazar Gugleta](https://unsplash.com/photos/Ub4CggGYf2o) |
| Robô aspirador com LiDAR e mop | [Onur Binay](https://unsplash.com/photos/uhJgh4FHi6I) |
| Câmera Wi-Fi com detecção de pessoas | [Scott Webb](https://unsplash.com/photos/yekGLpc3vro) |
| Kit de sensores de porta e janela | [Ashwini Chaudhary (Monty)](https://unsplash.com/photos/capxeZuSgz4) |
| Fechadura digital com biometria | [Katja Ano](https://unsplash.com/photos/vFfF9lt3yJ8) |
| Gerenciador de senhas | [FlyD](https://unsplash.com/photos/C5pXRFEjq3w) |
| Chave de segurança FIDO2 | [Sasun Bughdaryan](https://unsplash.com/photos/cX8kNl8X0Ys) |
| Roteador mesh Wi-Fi 6 | [Andres Urena](https://unsplash.com/photos/YoM7sOGo4sU) |
| Airfryer | [Richard Bell](https://unsplash.com/photos/01Cym9NFY0s) |
| Panela elétrica multicooker | [Abdallah Arafa](https://unsplash.com/photos/sat_YDATN_4) |
| Purificador de água classe A | [Fiona Murray-deGraaff](https://unsplash.com/photos/oS1RRGvQKHI) |
| Tomada inteligente com medição | [Mitchell Luo](https://unsplash.com/photos/xzSVKPPfIHo) |
| Ar-condicionado inverter | [Kevin Woblick](https://unsplash.com/photos/JkHSdaYRiUI) |
| Estação de energia portátil | [Jackery Power Station](https://unsplash.com/photos/OGKaLGt1VYY) |
| Suporte articulado de monitor | [Clark Gu](https://unsplash.com/photos/9rznoW59E-4) |
| Fone com cancelamento de ruído | [Creatopy](https://unsplash.com/photos/k2ze-Q4qazc) |
| Mesa com regulagem elétrica de altura | [Arthur Lambillotte](https://unsplash.com/photos/sopDgxKFMj0) |

## Estrutura de arquivos

```
index.html                 página única: apresentação, catálogo, sobre e modal
css/style.css              estilos próprios (cores, tipografia, componentes)
js/
  app.js                   eventos, histórico do navegador e orquestração
  api.js                   requisições AJAX (fetch), erros e simulação de estados
  estado.js                funções puras: busca, filtro, validação, formatação, URL
  ui.js                    criação dos elementos da interface (createElement/textContent)
data/
  itens.json               listagem: eixos e 24 produtos
  detalhes/{id}.json       detalhes de cada produto (24 arquivos)
img/
  produtos/                imagens ilustrativas (WebP)
  marca/                   símbolo e favicons
tests/
  index.html               página que roda os testes no navegador
  *.test.js                suítes T-01 a T-09
docs/                      pesquisa, especificação, plano e registro da Fase 2
.claude/                   configuração e checklist do projeto usados no desenvolvimento
```

## Próximos passos (Fase 2)

Este projeto é o protótipo de um site de afiliados real. Tudo o que existe só por exigência da avaliação ou por simplificação do MVP está listado, com a ação prevista para produção, em [`docs/REGISTRO-FASE-2.md`](docs/REGISTRO-FASE-2.md). O código correspondente está marcado com comentários `ACAD-xx`.

Documentação do processo: [especificação](docs/superpowers/specs/2026-10-04-evoluto-catalogo-design.md), [plano de implementação](docs/superpowers/plans/2026-10-04-evoluto-catalogo.md) e [pesquisa](docs/pesquisa/).
