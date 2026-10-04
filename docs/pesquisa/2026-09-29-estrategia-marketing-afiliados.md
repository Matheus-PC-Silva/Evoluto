# Pesquisa: estratégia de marketing de afiliados

> Pesquisa feita em 29/09/2026 para orientar o projeto (MVP acadêmico → base de negócio real).
> Público: **ser humano moderno** (neutro). Mercado: **Brasil**.
> Cada afirmação tem fonte. Números de blogs de marketing estão marcados como *fonte secundária*.

---

## 1. Resumo executivo

1. **O que ranqueia em 2026 é curadoria honesta com experiência real.** O Google rebaixa sites de afiliado "finos" e premia reviews com uso real, prós **e contras** e comparação entre alternativas ([SUSO — Google product reviews](https://susodigital.com/thoughts/how-to-write-product-reviews-the-google-way/), [WiserReview — histórico do product reviews update](https://wiserreview.com/blog/google-product-reviews-update/)).
2. **Autoridade tópica pesa mais do que volume.** Organize o site em *hubs* (eixos) e *spokes* (guias e reviews) com links internos nos dois sentidos ([Webtonic — Hub and Spoke](https://www.webtonic.io/blog/hub-and-spoke-seo), [Digital Applied — Content clusters 2026](https://www.digitalapplied.com/blog/seo-content-clusters-2026-topic-authority-guide)).
3. **A transparência é obrigatória, não opcional.** O novo Guia CONAR (vigente desde 01/06/2026) inclui **afiliados** e exige identificação *clara, ostensiva e imediata* ([Shopee — Guia CONAR 2026 para afiliados](https://help.shopee.com.br/portal/10/article/196794-Identifica%C3%A7%C3%A3o-de-Conte%C3%BAdo-Publicit%C3%A1rio:-Guia-CONAR-2026-para-Influenciadores-e-Afiliados), [Migalhas](https://www.migalhas.com.br/depeso/456129/guia-do-conar-de-publicidade-de-influenciadores-o-que-precisam-saber)). O Google exige `rel="sponsored"` em links de afiliado ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)).
4. **Não exibir preço fixo de produtos da Amazon.** O acordo de Associados só permite preço vindo da API oficial (Creators API/PA-API), com cache de no máximo 1 h e data/hora ao lado ([Amazon Associates — políticas](https://affiliate-program.amazon.com/help/operating/policies), [Geniuslink — requisitos](https://geniuslink.com/blog/amazon-associates-requirements/)). Consequência para o nosso design: **sem preço no card**, e sim uma **faixa** ($ / $$ / $$$) e o botão "Ver preço na loja".
5. **Saúde é o eixo mais lucrativo e o mais arriscado.** A ANVISA proíbe alegações de cura ou prevenção de doenças para suplementos ([Nutritotal — marco regulatório](https://nutritotal.com.br/pro/material/marco-regulatorio-dos-suplementos-alimentares-anvisa-apresenta-orientacoes-para-profissionais/)), e o CONAR investiga propaganda enganosa do setor ([Metrópoles](https://www.metropoles.com/brasil/conar-investiga-propaganda-enganosa-de-suplementos-feita-por-padres)). Recomendação: começar por **gadgets de saúde** (dispositivos) e deixar suplementos/nootrópicos de Monetizze/Braip para depois, com revisão jurídica.

---

## 2. Programas de afiliados (Brasil)

| Programa | Comissão (referência) | Ponto forte | Atenção |
|---|---|---|---|
| **Amazon Associados** | Saúde, Beleza, Cuidados Pessoais, Alimentos: **13%** · Pet: 11% · Dispositivos Amazon (Echo, Kindle): 9,5% ([portal oficial](https://associados.amazon.com.br/help/node/topic/GRXPHT8U84RAYDXZ)) | Confiança e Prime, alta conversão | **3 vendas em 180 dias** para ser aprovado. Conta encerrada após 1 ano sem vendas. Declaração obrigatória: *"Como Associado da Amazon, ganho com compras qualificadas"* ([ajuda Amazon BR](https://associados.amazon.com.br/help/node/topic/G7MJTPEP9NC3YKMG)). Sem preço estático |
| **Mercado Livre Afiliados** | Maioria das categorias **12%** · Beleza/Moda/Esportes 16% · **Eletrônicos, celulares e informática 5%** · Alimentos 0% · venda indireta = metade ([Hostinger](https://www.hostinger.com/br/tutoriais/comissao-afiliado-mercado-livre/), [Rally de Vendas](https://rallydevendas.com.br/blog/comissao-afiliado-mercado-livre-quanto-por-cento)) *fonte secundária* | Frete Full, cookie de **30 dias** | Tecnologia paga pouco. Compensa em casa, cozinha e esportes |
| **Shopee Afiliados** | Geralmente **3–15%**, com picos em campanhas ([Inteligência Setorial](https://inteligenciasetorial.com.br/programa-de-afiliado-shopee/)) *fonte secundária* | Gadgets baratos, sensores, iluminação | Qualidade variável dos vendedores, o que pode afetar a credibilidade |
| **Parceiro Magalu** | **1–12%**, saque a partir de R$ 50 ([InvestNews](https://investnews.com.br/economia/como-ser-afiliado/)) *fonte secundária* | Eletrodomésticos, marca conhecida | Comissão variável |
| **Awin** (rede) | 3–15% conforme a marca ([Divulga Ninja](https://www.divulganinja.com.br/blog/melhores-programas-afiliados-brasil-2026-guia-completo/)) *fonte secundária* | Afiliação direta a marcas (ticket alto) | Cada anunciante aprova individualmente |
| **Monetizze / Braip** | Altas (40%+) em infoprodutos e suplementos | Comissão agressiva | **Risco regulatório** (ANVISA/CONAR) e risco de reputação. Deixar para depois |
| **AliExpress Portals** | Variável | Zigbee, sensores, peças | Prazo de entrega longo, taxação de importação |

**Estratégia de mix:** Amazon para saúde, cuidados pessoais e dispositivos Amazon (as maiores comissões) · Mercado Livre para casa e cozinha (12%) · Shopee/AliExpress para gadgets de entrada · Awin para marcas premium. **O card de detalhe deve aceitar várias lojas por produto**, o que também dá ao leitor a opção de comparar.

---

## 3. Arquitetura de um site de afiliados que dá certo

### 3.1 Estrutura hub-and-spoke
```
Home
 ├─ Hub: Saúde & Monitoramento ── spokes: "Melhor smartwatch para saúde", "Smartwatch x anel", review Galaxy Watch…
 ├─ Hub: Sono & Recuperação
 ├─ Hub: Casa no Automático
 ├─ Hub: Segurança & Privacidade
 ├─ Hub: Cozinha & Alimentação
 ├─ Hub: Energia & Sustentabilidade
 └─ … (ver documento de nichos)
```
- Todo spoke aponta para o hub e o hub aponta para todos os spokes ([Jordan James Media](https://jordanjamesmedia.com/blog/post/hub-spoke-seo-architecture-complete-guide/)).
- Publique o hub **junto com 6–8 spokes**. Um hub sem spokes não distribui autoridade ([Webtonic](https://www.webtonic.io/blog/hub-and-spoke-seo)).

### 3.2 Tipos de página, em ordem de intenção de compra
| Tipo | Intenção | Exemplo |
|---|---|---|
| Guia educativo | Descoberta | "O que é Matter e por que importa" |
| Lista "Melhores X" | Comparação | "Melhores robôs aspiradores para apartamento" |
| Comparativo A x B | Decisão | "Roborock x Xiaomi: qual vale mais?" |
| Review individual | Decisão final | "Review: fechadura Intelbras FR 201" |
| Kit / setup | Ticket médio maior | "Setup de sono completo por faixa de preço" |

### 3.3 Anatomia de um review que converte (e é aprovado pelo Google)
1. **Veredito no topo:** para quem é e para quem **não** é.
2. **Benefício invisível** (o problema de vida que resolve), sem exagerar.
3. **Prós e contras** honestos. Citar um defeito real aumenta a credibilidade ([SUSO](https://susodigital.com/thoughts/how-to-write-product-reviews-the-google-way/)).
4. **Evidência:** estudo, teste de laboratório ou certificação (INMETRO, validação clínica).
5. **Alternativas:** mais barata, premium, "se você já tem X".
6. **CTA claro** com loja nomeada ("Ver na Amazon") e `rel="sponsored noopener"`.
7. **Data da última atualização** e autor.

### 3.4 E-E-A-T na prática
- Página "Sobre" real: quem escreve, como testa e como o site ganha dinheiro.
- **Página de metodologia** ("Como escolhemos"): critérios por eixo.
- Fotos próprias quando houver produto em mãos. Enquanto isso, deixar claro quando a análise é baseada em pesquisa ([Digital Prahlad — E-E-A-T afiliados](https://digitalprahlad.com/eeat-for-affiliate-sites/)).

### 3.5 Conversão
- CTAs claros, conteúdo de qualidade e UX são os maiores alavancadores ([Publift](https://www.publift.com/blog/affiliate-marketing-strategies)) *fonte secundária*.
- **E-mail converte mais que review isolado** (5,3% x 2,3%) ([wecantrack](https://wecantrack.com/insights/affiliate-conversion-statistics/)) *fonte secundária*. Fase 2: newsletter "1 upgrade de vida por semana", com uma isca como um checklist ("Casa automatizada com R$ 500").
- Rótulos de decisão nos cards: **"Melhor custo-benefício"**, **"Escolha premium"**, **"Para começar"**.
- Rótulo e preço não se misturam: sem preço fixo (regra Amazon), com faixa $/$$/$$$.

---

## 4. Conformidade (Brasil)

| Tema | Regra | Aplicação no site |
|---|---|---|
| Publicidade de afiliado | Guia CONAR 2026: identificação **clara, ostensiva, imediata, sem depender de rolagem** ([KLA](https://www.klalaw.com.br/conar-atualiza-guia-de-publicidade-com-influenciadores/)) | Aviso na primeira dobra ("Este site recebe comissão por compras feitas pelos links") + selo "Link de afiliado" junto a cada botão de compra |
| Links pagos (SEO) | `rel="sponsored"` ([Google](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)) | `rel="sponsored noopener noreferrer"` + `target="_blank"` |
| Amazon | Declaração obrigatória e sem preço estático | Rodapé + página de transparência |
| Saúde | ANVISA: sem alegação de cura/prevenção. Dispositivo ≠ diagnóstico | Aviso "não substitui avaliação médica" nos produtos de saúde. Linguagem de "monitorar", "alertar", nunca "diagnosticar" |
| LGPD | Consentimento para cookies de rastreio | MVP sem analytics/cookies. Fase 2: banner de consentimento |
| Imagens | Imagens de loja têm direitos | MVP: imagens livres (Unsplash/Pexels) creditadas no README. Fase 2: imagens via API oficial / kits de imprensa |

---

## 5. Correções ao plano original (checagem de fatos)

| Afirmação no plano base | Verificação | Como usar |
|---|---|---|
| Smartwatch = "detecção precoce de um infarto" | **Incorreto.** O ECG do Apple Watch só distingue fibrilação atrial de ritmo sinusal e não reconhece outras condições ([Apple Support](https://support.apple.com/en-us/120278)) | "Alerta de ritmo irregular compatível com fibrilação atrial". Não citar infarto |
| PPG com "alta precisão clínica" para FA (PMID 37234033) | **Confere.** Selder et al., *JMIR* 2023, algoritmo de FA em pulseira e smartwatch. Meta-análise: sensibilidade ~95% e especificidade ~97% ([JACC Advances 2025](https://www.jacc.org/doi/10.1016/j.jacadv.2025.102133)) | Pode citar, com a ressalva de que é alerta e não diagnóstico |
| Luz circadiana e melatonina | **Confere.** Luz ambiente antes de dormir atrasou a melatonina em 99% dos participantes e encurtou sua duração em ~90 min ([Gooley et al. 2011, JCEM](https://pubmed.ncbi.nlm.nih.gov/21193540/)) | Argumento forte para iluminação circadiana |
| Anel inteligente mede fases do sono | **Confere, parcialmente.** Oura Gen3: 79% de concordância em 4 estágios com polissonografia ([Oura/Brigham — divulgação da marca](https://ouraring.com/blog/2024-sensors-oura-ring-validation-study/)). Estudo independente com 96 participantes: acurácia de 91,7% para sono x vigília ([Sleep Medicine 2024](https://pubmed.ncbi.nlm.nih.gov/38382312/)) | "Boa estimativa de tendências", não "exame de sono" |
| Balança de bioimpedância mostra perda de gordura | **Parcial.** Mede peso com precisão, mas erra na composição corporal. Serve para acompanhar **tendência** individual ([PMC — validação de balanças BIA](https://pmc.ncbi.nlm.nih.gov/articles/PMC4475745/), [Wikipedia — BIA](https://en.wikipedia.org/wiki/Bioelectrical_impedance_analysis)) | Posicionar como "acompanhar tendência", nunca "medida exata" |
| Pistola de massagem acelera a recuperação | **Evidência mista.** Melhora amplitude de movimento e força explosiva de forma aguda, sem benefício claro para dor muscular tardia ([Frontiers 2025](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1561970/full), [IJSPT — revisão](https://ijspt.scholasticahq.com/article/73795-the-effect-of-percussive-therapy-on-musculoskeletal-performance-and-experiences-of-pain-a-systematic-literature-review)) | "Aquecimento e mobilidade", sem prometer "fim da dor" |
| "57% dos donos de smart home são homens" (HDL) | **Fonte fraca** (fabricante, sem metodologia) | Não usar. Público neutro de qualquer forma |
| "2–3 h/semana economizadas" (GreenMatch) / "77% relatam melhora" (ConsumerAffairs) | **Fontes secundárias** (blogs comerciais) | Usar com cautela e atribuição, ou trocar por dados BR (abaixo) |

**Dados brasileiros mais sólidos:**
- 17 milhões de dispositivos de casa inteligente conectados à Alexa no Brasil em 2024, com +50% de interações sobre o ano anterior ([Eletrolar News](https://eletrolarnews.com.br/mercado-de-casas-inteligentes-deve-movimentar-us-66-bilhoes-no-brasil-ate-2033/)).
- QuintoAndar/Datafolha: os itens mais desejados são câmera de segurança (59%), fechadura eletrônica (45%) e iluminação por app (42%) ([Cimento Itambé](https://www.cimentoitambe.com.br/casas-inteligentes-se-popularizam-no-brasil/)).
- Buscas por casa inteligente +22% em 12 meses, com interruptor inteligente liderando (~1,5 mi buscas) ([CNN Brasil](https://www.cnnbrasil.com.br/economia/money/tecnologia/buscas-por-casa-inteligente-crescem-22-no-brasil-diz-levantamento/)).
- Standby pode representar até 10% do consumo residencial, ~R$ 16–19/mês sobre 166 kWh ([TechTudo 2026](https://www.techtudo.com.br/guia/2026/07/tomada-inteligente-economiza-energia-veja-quando-ela-vale-a-pena-edinfoeletro.ghtml), [Canaltech](https://canaltech.com.br/produtos/vale-usar-tomada-inteligente-para-economizar-energia-fizemos-as-contas/)).

---

## 6. Nome da marca (público neutro)

| Nome | Leitura | Observação |
|---|---|---|
| **Setup Humano** | Upgrade do ambiente e do corpo | Neutro e memorável. **Favorito** |
| Rotina Inteligente | Tecnologia a serviço do dia a dia | Muito descritivo, bom para SEO |
| Tempo de Sobra | Benefício invisível no nome | Emocional, foco em tempo |
| Habitat Smart | Casa conectada | Estreito, só um eixo |
| Código do Conforto | Tecnologia + bem-estar | Um pouco abstrato |
| Radar Moderno | Curadoria de tendências | Genérico |
| ~~Otimização Masculina~~ | — | Descartado (público neutro) |

Antes de fechar: verificar domínio `.com.br`, perfis sociais e INPI.

---

## 7. Da nota ao negócio: roadmap técnico

| Fase | Entrega | Observação |
|---|---|---|
| **1. MVP acadêmico (até 05/10)** | Catálogo AJAX + Bootstrap 5, dados em JSON, detalhes via 2ª requisição, filtros por eixo | Cumpre o PDF. Vale como protótipo de UX e do modelo de dados |
| 2. Conteúdo | Hubs e guias em páginas próprias | **Limite do MVP:** conteúdo gerado por JS depois do carregamento é menos amigável a SEO que HTML estático. Na fase 2, gerar páginas estáticas a partir dos **mesmos JSON** (ex.: Eleventy/Astro) |
| 3. Monetização | Cadastro nos programas, troca dos links por links de afiliado, API da Amazon para preços | Os JSON já terão o campo `lojas[]`, então é só trocar as URLs |
| 4. Audiência | Newsletter, redes sociais, consentimento LGPD | — |

---

## 8. Implicações diretas para o MVP (entram na spec)

- Categoria = **eixo**. Card = produto com **rótulo de decisão** e **faixa de preço**, sem preço fixo.
- Detalhes (2ª requisição): veredito, para quem é/não é, prós/contras, benefício invisível, evidência com link, lojas com `rel="sponsored"`, data de atualização.
- Aviso de afiliado **visível sem rolagem** e página/seção "Sobre o projeto" com transparência + declaração Amazon.
- Aviso de saúde nos produtos do eixo saúde.
- Imagens livres creditadas no README.
