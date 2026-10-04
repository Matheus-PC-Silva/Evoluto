---
name: requisitos-avaliacao-web
description: Use when planning, building, testing, reviewing or delivering the UNEMAT Desenvolvimento Web catalog project (AJAX + Bootstrap 5 website) in this repository, or when any decision touches HTML structure, semantics, layout, Bootstrap components, fetch requests, UI states, tests, README or GitHub/SIGAA delivery.
---

# Requisitos da Avaliação Prática — Catálogo AJAX com Bootstrap 5

## Visão geral

Fonte da verdade: `Avaliacao_Pratica_Desenvolvimento_Web.pdf` (UNEMAT, prof. Ivan Luiz Pedroso Pires, 10,0 pontos, individual, entrega **05/10/2026**).

**Precedência:** o PDF vence qualquer outra skill. Em caso de dúvida, releia o PDF.

**Todo item deste checklist precisa ser comprovável** pelo professor, seja no navegador, no código ou no README. Um requisito implementado que o professor não consegue ver é tratado como requisito ausente.

## Relação com outras skills (sem sobrescrevê-las)

| Skill | Papel aqui | Ajuste específico do projeto |
|---|---|---|
| superpowers:brainstorming / writing-plans | Processo de design e plano | Spec fica no repositório (`docs/superpowers/specs/`), é intencional |
| superpowers:test-driven-development | TDD mantido | Testes rodam **no navegador** e ficam documentados para execução manual pelo professor (ver "Testes") |
| frontend-design | Direção visual | Cards do Bootstrap são **obrigatórios**. Dê hierarquia a eles, não os remova |
| security-guidance | Alerta XSS | Use o padrão de renderização segura abaixo |
| context7 | Docs atualizadas | Consulte o Bootstrap 5 antes de usar um componente |
| superpowers:verification-before-completion | Evidência antes de "pronto" | Use a "Conferência final" abaixo |

A pasta `.claude/` é versionada no repositório (decisão do aluno).

## Registro da Fase 2 (obrigatório)
Todo item criado **por exigência da avaliação** ou por simplificação do MVP precisa:
1. ter uma linha em `docs/REGISTRO-FASE-2.md` (ID `ACAD-xx`, origem, motivo, ação na Fase 2), no mesmo commit em que é criado;
2. ter o comentário `ACAD-xx` no código correspondente.

Antes de criar um item novo, confira se ele já tem ID no registro.

## Checklist por critério

### HTML — 1,0
- [ ] `<!DOCTYPE html>`, `<html lang="pt-BR">`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>` descritivo
- [ ] 3 áreas no mínimo: **apresentação**, **catálogo**, **sobre o projeto**
- [ ] Formulário de busca/filtro real (`<form role="search">`, `submit` com `preventDefault`)

### HTML semântico — 1,5
- [ ] `header`, `nav`, `main`, `footer`, mais `section` por área e `article` por item do catálogo
- [ ] Um único `h1` e hierarquia sem saltos (h1 → h2 por section → h3 por card)
- [ ] `alt` descritivo em imagens informativas e `alt=""` nas decorativas
- [ ] Todo campo com `<label for="id">` (se oculto, use `visually-hidden`, nunca só `placeholder`)
- [ ] Modal com `aria-labelledby` e botões com texto ou `aria-label`

### Layout e responsividade — 1,5
- [ ] `container` → `row` → `col-*` do Bootstrap
- [ ] Colunas do catálogo: `row-cols-1 row-cols-sm-2 row-cols-lg-3` (ou similar)
- [ ] Navbar colapsa no celular (`navbar-expand-lg` + `navbar-toggler`)
- [ ] Sem rolagem horizontal em 320px (imagens com `img-fluid`, nada de largura fixa em px)

### Bootstrap UI — 1,5
- [ ] Bootstrap **5** via CDN (confirme a versão atual com context7) com o **bundle JS**
- [ ] Obrigatórios: **navbar**, **cards**, **botões**, **formulário de busca/filtro**
- [ ] Componente interativo com função útil: **modal de detalhes** (recomendado). Opcionais: accordion no "sobre", collapse de filtros

### AJAX e interação — 3,0
- [ ] **Listagem (0,8):** `fetch` de 8 ou mais itens, cada um com `id`, `titulo`, `categoria`, `resumo`, e cards gerados via JS
- [ ] **Detalhes (0,8):** ao clicar, **nova requisição** a outra fonte/endpoint (`/detalhes/{id}`). Não pode reaproveitar os dados da listagem
- [ ] **Busca/filtro (0,6):** texto e/ou categoria, sem recarregar a página
- [ ] **Estados (0,8):** carregando (spinner), vazio (mensagem + ação para limpar), erro (mensagem clara + botão **Tentar novamente** que refaz a requisição). Vale para a listagem **e** para os detalhes

### Organização e entrega — 1,5
- [ ] Arquivos separados (0,5): ver estrutura abaixo
- [ ] README completo (0,5): ver modelo abaixo
- [ ] Repositório acessível e link no SIGAA (0,5): público **ou** privado compartilhado com `IVANLPPIRES`. **O link precisa ser enviado no SIGAA até 05/10/2026**

## Regras técnicas (inegociáveis)
- Somente HTML, CSS, JavaScript e Bootstrap 5. **Proibido Vue, React, Angular** e similares
- AJAX com `fetch` (ou XMLHttpRequest)
- Deve rodar por servidor HTTP local (`python -m http.server 8000` ou `npx serve`). **Nunca depender de `file://`**
- Fonte de dados: **somente JSON local** servido por HTTP (decisão do aluno), com **uma fonte para a listagem e outra para os detalhes**
- O aluno precisa saber explicar cada linha. Prefira código simples e comentado a abstrações

## Estrutura de arquivos

```
index.html
css/style.css
js/api.js        # fetch, timeout, verificação de resposta
js/estado.js     # lógica pura: filtro, busca (testável sem DOM)
js/ui.js         # renderização e estados da interface
js/app.js        # eventos e orquestração
data/itens.json  # listagem
data/detalhes/{id}.json  # detalhes (um arquivo por item)
tests/index.html # runner dos testes no navegador
tests/*.test.js
docs/superpowers/specs/  # spec e plano
README.md
```
Use ES modules (`<script type="module">`). Eles já exigem HTTP, o que é coerente com a regra.

## Padrão de requisição (JSON local via HTTP)

```js
// Falha em rede, HTTP != 2xx ou timeout vira exceção: a UI decide o estado de erro.
export async function buscarJSON(url, { timeout = 8000 } = {}) {
  if (simularErro()) throw new Error('Erro simulado');           // ?simular=erro
  const resposta = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();
}

export const carregarItens   = () => buscarJSON('data/itens.json');
export const carregarDetalhe = (id) => buscarJSON(`data/detalhes/${encodeURIComponent(id)}.json`);
```
- O estado de erro precisa ser **demonstrável**: `?simular=erro`, servidor parado ou id inexistente (404), documentados no README

## Renderização segura
Dados externos entram com `textContent` / `createElement` / `setAttribute`. Não use `innerHTML` com dados vindos da API. `innerHTML` só é aceitável com templates estáticos seus.

## Estados acessíveis
- Região de status com `aria-live="polite"` para carregando e vazio, e `role="alert"` para erro
- Spinner: `<div class="spinner-border" role="status"><span class="visually-hidden">Carregando…</span></div>`
- Texto de erro diz **o que houve e o que fazer** ("Não foi possível carregar o catálogo. Verifique a conexão e tente novamente.")

## Testes (TDD + roteiro manual)
- TDD mantido: teste antes do código, para toda lógica em `js/estado.js` e para o tratamento de erro de `js/api.js`
- Os testes rodam **no navegador** em `http://localhost:8000/tests/` (Mocha + Chai via CDN, sem npm). Assim o professor executa sem instalar nada
- Todo teste automatizado aparece também no README, numa tabela: **o que testa → como executar → resultado esperado**
- O roteiro manual cobre o que o PDF exige: listagem, detalhes, busca/filtro, carregando, vazio, erro + tentar novamente, fallback offline, responsividade (celular e desktop)

## Modelo de README (seções obrigatórias)
1. Nome completo · Disciplina · Tema
2. Funcionalidades
3. Fontes de dados (JSON local e fontes das informações), imagens e bibliotecas (Bootstrap, Mocha, Chai, fontes) **com links**
4. Como executar (servidor HTTP local, passo a passo, e aviso de que `file://` não funciona)
5. Roteiro de testes
   - Automatizados: como abrir `/tests/` e o que cada suíte verifica
   - Manuais: listagem, detalhes, busca/filtro, carregando, vazio, erro/tentar novamente, responsivo, cada um com passos e resultado esperado
6. Estrutura de arquivos

## Erros comuns (perdem nota)
| Erro | Correção |
|---|---|
| Modal mostra dados que já estavam no card | Faça um `fetch` novo por id ao abrir |
| Estado de erro impossível de ver na correção | Implemente `?simular=erro` e documente no README |
| `placeholder` no lugar de `label` | `<label class="visually-hidden">` |
| Pular de h2 para h4 | Mantenha a hierarquia |
| `innerHTML` com dados da API | `textContent` |
| Esquecer `bootstrap.bundle.min.js` | Sem ele, modal e navbar não funcionam |
| Só testar pelo `file://` | Sempre pelo servidor local |
| Publicar no GitHub e não enviar no SIGAA | A entrega só conta com o link no SIGAA |

## Conferência final (antes de dizer "pronto")
1. `git clone` numa pasta nova → seguir o README ao pé da letra
2. `/tests/` com todos os testes verdes
3. Roteiro manual completo, em desktop e no modo celular do DevTools (320px e 375px)
4. Sem erros no console
5. Validar o HTML (validator.w3.org) e revisar hierarquia de títulos, `alt` e `label`
6. Repositório acessível (público ou `IVANLPPIRES` como colaborador) e link enviado no SIGAA
