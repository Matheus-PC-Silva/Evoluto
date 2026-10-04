# Registro: itens acadêmicos a revisar na Fase 2 (produção)

Este documento lista tudo o que existe no Evoluto **por exigência da avaliação acadêmica** (PDF da disciplina, UNEMAT) ou **por limitação do MVP**, e o que precisa mudar quando o projeto virar um site de afiliados real em produção.

**Regras de uso**
1. Todo item novo criado por exigência da avaliação entra aqui **no mesmo commit** em que é criado.
2. No código, o trecho correspondente leva um comentário com o ID, por exemplo `<!-- ACAD-05 -->` ou `// ACAD-04`. Para achar todos os pontos: `grep -rn "ACAD-" .`
3. Na Fase 2, nenhum item é removido deste arquivo. Ele recebe status `Migrado` com data e link do commit.

**Legenda de origem:** `PDF` = requisito da avaliação · `MVP` = simplificação por prazo/escopo · `CONF` = conformidade que muda com dados reais

---

| ID | Item no MVP | Origem | Por que existe | Ação na Fase 2 | Status |
|---|---|---|---|---|---|
| ACAD-01 | Catálogo montado no navegador via `fetch` de JSON | PDF §3a | Listagem dinâmica por AJAX é obrigatória | Gerar HTML estático por produto e por eixo a partir dos mesmos dados (Eleventy/Astro), já que conteúdo renderizado por JS é pior para SEO | Pendente |
| ACAD-02 | Detalhes em **modal** com 2ª requisição (`data/detalhes/{id}.json`) | PDF §3b, §2d | Nova requisição de detalhes + componente interativo do Bootstrap | Cada produto ganha **página própria** indexável (`/produtos/{id}/`). O modal pode ficar como prévia rápida | Pendente |
| ACAD-03 | Site em **uma única página** com âncoras | MVP | Escopo do prazo e clareza para a correção | Arquitetura hub-and-spoke: página por eixo (hub) + guias/reviews (spokes) | Pendente |
| ACAD-04 | Parâmetros `?simular=erro`, `?simular=erro-detalhe` (falham só na 1ª tentativa) e `?simular=lento` (+1,5 s) | PDF §3d | Permitir ao professor ver os estados de carregamento e erro e o "Tentar novamente" funcionando, já que o JSON local carrega instantaneamente | Remover do build de produção ou restringir ao ambiente de desenvolvimento | Pendente |
| ACAD-05 | Item "Sobre este projeto" (disciplina, aluno, professor), aberto por padrão no accordion | PDF §2a | Área obrigatória de informações sobre o projeto | Substituir por página "Quem somos" com autor real (E-E-A-T) e política editorial | Pendente |
| ACAD-06 | Dados em **JSON local estático** editado à mão | PDF §4 / MVP | Fonte de dados via HTTP sem backend | Fonte editorial (CMS headless ou JSON versionado + build). Preços via API oficial (ver ACAD-12) | Pendente |
| ACAD-07 | Produtos **genéricos** ("Robô aspirador com LiDAR"), com exemplos de marcas | MVP | Sem teste real de modelos e sem dados de preço confiáveis | Reviews de **modelos específicos**, com especificações, fotos e comparativos | Pendente |
| ACAD-08 | Links de loja **sem ID de afiliado** (URLs de busca nas lojas) | MVP / CONF | Ainda não há cadastro nos programas | Cadastrar nos programas (Amazon, ML, Shopee, Magalu, Awin), trocar por links com tag e considerar redirecionador próprio (`/ir/{id}`) para trocar links em um só lugar | Pendente |
| ACAD-09 | Selo "Análise baseada em pesquisa e evidências" | CONF | Honestidade: não houve teste físico | Selo "Testamos" nos produtos realmente testados, com fotos próprias | Pendente |
| ACAD-10 | Imagens livres genéricas (Unsplash/Pexels) com legenda "Imagem ilustrativa", créditos em `imagem.credito`, no README e no modal | MVP / PDF §4 | Direitos de imagem + exigência de citar fontes | Fotos próprias ou imagens oficiais via API/kit de imprensa | Pendente |
| ACAD-11 | Testes no navegador (`/tests/`, Mocha + Chai via CDN) + roteiro manual no README | PDF §6.2 / decisão do aluno | O professor executa os testes sem instalar nada | Manter os testes de unidade, acrescentar testes de ponta a ponta (Playwright) e CI no GitHub Actions | Pendente |
| ACAD-12 | Faixa de preço manual ($ / $$ / $$$), sem preço exato | CONF | Amazon proíbe preço estático | Preço via Creators API, com cache ≤ 1 h e data/hora exibidas. Manter a faixa onde não houver API | Pendente |
| ACAD-13 | Execução por servidor local (`python -m http.server`) | PDF §4 | Não depender de `file://` | Hospedagem com HTTPS (ex.: Cloudflare Pages/Netlify) + domínio `evoluto.com.br` (verificar no registro.br) | Pendente |
| ACAD-14 | `canonical` e Open Graph com URL provisória | MVP | Ainda não há domínio | Atualizar para o domínio definitivo + imagem OG própria | Pendente |
| ACAD-15 | Sem analytics, sem cookies, sem política de privacidade | MVP / CONF | Nada é coletado no MVP | Ao adicionar analytics/newsletter: banner de consentimento LGPD, política de privacidade e termos de uso | Pendente |
| ACAD-16 | Bootstrap 5 via CDN, sem frameworks JS | PDF §4 | Tecnologias obrigatórias e proibidas | Livre escolha. Avaliar manter o Bootstrap (com CSS reduzido) ou migrar junto com o gerador estático | Pendente |
| ACAD-17 | README voltado à correção (roteiro de testes para o professor) | PDF §6.2 | Exigência de entrega | Separar o README de desenvolvimento da documentação editorial e operacional | Pendente |
| ACAD-18 | Repositório público contendo `.claude/`, `docs/superpowers/` e `docs/pesquisa/` | Decisão do aluno | Mostrar o processo na avaliação | Avaliar se o repositório de produção deve ser privado ou separado | Pendente |
| ACAD-19 | Pesquisa base com fontes secundárias marcadas | MVP | Prazo | Revalidar estatísticas e trocar por fontes primárias antes de usar em textos de venda | Pendente |
| ACAD-20 | Avisos de afiliado controlados pelo campo `lojas[].afiliado`. No MVP, todos `false`: selo "Link externo", faixa com o texto "Projeto em fase de testes: os links ainda não geram comissão…", sem `rel="sponsored"` e sem declaração da Amazon | CONF | Não afirmar comissão inexistente (CONAR/CDC), mas deixar o mecanismo pronto e demonstrável | Ao trocar os links (ACAD-08): `afiliado: true`, selo "Link de afiliado", `rel="sponsored"`, texto de comissão na faixa e declaração da Amazon no rodapé | Pendente |
| ACAD-21 | Logo "Encontro" (círculo ∩ quadrado, interseção âmbar) desenhado em SVG como conceito | MVP | Prazo: conceito suficiente para o MVP | Refinamento por designer (proporções, versão monocromática, manual de marca) e registro no INPI junto com o nome | Pendente |
