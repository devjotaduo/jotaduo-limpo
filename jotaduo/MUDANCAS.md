# O que o JotaDuo muda no Twenty

Relatório do branch `jotaduo/custom` do fork `devjotaduo/jotaduo-limpo`: cada mudança que ficou,
o que ela faz e como usar. A base é o Twenty de [`twenty-base.ref`](twenty-base.ref) (`43b824f7`,
v2.46.0). Na produção desde 08/10/2026, 21:54 UTC, na imagem `rutherles/jotaduo:43b824f7-012b023b`.

Cada mudança é um commit `JotaDuo NNNN: ...`, com o número que ela tinha como patch no overlay
(`devjotaduo/jotaduo-overlay`). O porquê de cada item está no `MELHORIAS-NO-TWENTY.md` de lá.

Como ler cada seção:

- **Para quem:** pessoa (quem usa a tela), app (quem escreve o `@jotaduo/app`), operação (quem
  roda comandos no servidor).
- **Como usar:** o contrato exato.
- **Limites:** o que a mudança não faz e o que pode surpreender.

## Resumo

| Nº | Mudança | Lado | Quem usa |
| --- | --- | --- | --- |
| 0001 | Marca do JotaDuo no build do front | tela | todos |
| 0002 | Pacote de app grande demais não derruba o servidor | servidor | operação |
| 0003 | Mudar `onDelete` refaz a chave estrangeira | servidor | app |
| 0004 | Jobs do app com a prioridade dos gatilhos | servidor | app (turno da Lia) |
| 0005 | A tela recarrega os metadados quando um app muda | tela | pessoa, app |
| 0006 | `pickAndUploadFile`: anexar arquivo do computador | tela | app (`campos.ts`) |
| 0007 | Funções do host aceitam `universalIdentifier` | tela | app |
| 0008 | `runAgent` com uso, custo, código do erro e `persist` | servidor | app (`executar-agente.ts`) |
| 0009 | `watchRecordChanges`: aviso de mudança de registro | tela | app (`aviso-de-mudanca.ts`) |
| 0010 | `application:upgrade --sync` e `autoUpgrade` nos pré-instalados | servidor | operação |
| 0011 | Item de página escondido para quem não lê o objeto | tela | app (páginas avulsas) |
| 0012 | Funções sem as variáveis de ambiente do servidor | servidor | segurança |
| 0013 | Saída em JSON dos agentes com contexto e esquema | servidor | app (Lia, Sofia, Copiloto) |
| 0014 | Autor da linha do tempo quando não há membro | tela + servidor | pessoa |
| 0016 | `runAgent` aceita `maxSteps` | servidor | app (`PASSOS_DO_AGENTE`) |
| 0018 | Rosto da IA no estado vazio do chat de IA | tela | pessoa |
| 0020 | Rosto animado no chat de IA e as boas-vindas do JotaDuo | tela | pessoa |
| — | `AgentEntity` sem `evaluationInputs` | servidor | upgrade |
| — | CI e imagem no `oracle-sp`, só os workflows úteis | repositório | operação |

## O que saiu, e por quê

Critério de 08/10/2026: fica o que o app chama de verdade, o que corrige problema real do
servidor e a marca.

| Nº | O que era | Por que saiu |
| --- | --- | --- |
| 0015 | Ferramentas do próprio app no `runAgent` | O app não pede (`useApplicationTools` fica de fora em `turno-de-agente.ts`); o laço de ferramentas continua no app. |
| 0016, parte | `useApplicationTools` | Mesmo motivo. Do 0016 ficou só o `maxSteps`. |
| 0017 | Mocks do teste de suspensão | O Twenty corrigiu o teste. |
| 0019 | `timeoutMs` e `finalStepWithoutTools` no `runAgent` | Nenhuma chamada do app usa. |
| 0021 | Onboarding JotaDuo no cadastro | A pessoa pediu o onboarding nativo do Twenty. As rotas `/s/jotaduo/onboarding` continuam no app, mas nada no Twenty as abre. |
| — | 50 dos 55 workflows do GitHub, depois os 5 restantes | Deploy, i18n, site e previews do próprio Twenty; a checagem útil roda no `oracle-sp`. |

Mandar `useApplicationTools`, `timeoutMs` ou `finalStepWithoutTools` agora dá erro de validação
do GraphQL.

## 0001: marca no build do front

- **Para quem:** todos.
- **O que muda:** o front sai com o nome, as cores, os ícones e o `manifest.json` do JotaDuo.
  - O `vite.config.ts` liga o plugin de `packages/twenty-front/branding/jotaduo/`.
  - O plugin troca "Twenty" por "JotaDuo" em arquivos escolhidos.
  - `JOTADUO_BRANDING_ENABLED=false` desliga no build.
- **Limites:** texto novo com "Twenty" em arquivo que o plugin não conhece continua "Twenty". Os
  testes do plugin (`branding/jotaduo/*.test.mjs`) acusam alvo que sumiu numa atualização.

## 0002: pacote grande demais não derruba o servidor

- **Para quem:** operação, app.
- **O que muda:** instalar ou publicar um app cujo pacote passe de 500 MB extraído
  (`MAX_EXTRACTED_SIZE_BYTES`) falha com `TARBALL_EXTRACTION_FAILED`. Antes o erro saía de dentro
  do `tar` como `uncaughtException` e derrubava o processo.
- **Como usar:** nada a fazer.
- **Limites:** o que foi extraído antes do limite fica na pasta temporária da instalação.

## 0003: mudar `onDelete` refaz a chave estrangeira

- **Para quem:** app.
- **O que muda:** uma relação MANY_TO_ONE sem `onDelete` nasce com chave `CASCADE`. Antes, mudar
  depois para `SET_NULL` alterava só o metadado, e o banco seguia apagando em cascata. Agora os
  dois lados são comparados pelo valor efetivo e a chave é refeita.
- **Como usar:** declarar o `onDelete` no campo e publicar.
- **Limites:** chave que já estava fora do lugar antes não volta sozinha.

## 0004: jobs do app com a prioridade dos gatilhos

- **Para quem:** pessoa (resposta mais rápida), app.
- **O que muda:** os jobs que o app enfileira com `enqueueJobs` saem com prioridade 4, a mesma
  dos gatilhos de banco e dos crons. Antes era 10, e na BullMQ o número menor sai primeiro: o
  turno da Lia esperava os gatilhos de todos os workspaces.
- **Limites:** o valor é fixo.

## 0005: a tela recarrega os metadados quando um app muda

- **Para quem:** pessoa, app.
- **O que muda:** com a tela aberta, instalar, atualizar ou sincronizar um app recarrega o
  usuário e os metadados em todas as abas, inclusive para quem não tem a permissão de apps. Some o
  "Sem dados" e a tela em branco que pediam limpar o IndexedDB.
  - Recarga completa: criação de `application`, atualização de `application` com `version`,
    `settingsCustomTabFrontComponentId`, `uninstallLogicFunctionId`,
    `healthCheckLogicFunctionId` ou `defaultRoleId`, e criação de `objectMetadata`.
  - Só o usuário: eventos de permissão, inclusive as regras de acesso por registro.
  - Rajada: espera de 2 s e no máximo 15 s; uma publicação vira uma recarga.
- **Limites:** cada aba aberta relê os metadados uma vez por publicação.

## 0006: `pickAndUploadFile`, anexar arquivo do computador

- **Para quem:** pessoa (botão "Escolher do computador"), app.
- **O que muda:** o host dos front components abre o seletor de arquivos do navegador e sobe o
  arquivo pelo mesmo caminho do `uploadFile`. Os bytes ficam no host.
- **Como usar, no componente:**

  ```ts
  const resultado = await globalThis.frontComponentHostCommunicationApi.pickAndUploadFile({
    fieldMetadataId, // campo FILES: id ou universalIdentifier (0007)
    accept,          // opcional, como no <input type="file">
  });
  // { status: 'uploaded', file: { fileId, path, url, size, mimeType, label } }
  // { status: 'cancelled' }
  // { status: 'failed', reason: 'invalid-params' | 'upload-failed' | 'picker-busy' | 'picker-unavailable' }
  ```

  - A chamada tem de sair direto do clique, sem `await` antes.
  - O campo tem de ser FILES, conferido antes de abrir o seletor.
- **Limites:** um seletor por componente (`picker-busy`); navegador sem o evento `cancel` não
  percebe o cancelamento.

## 0007: funções do host aceitam `universalIdentifier`

- **Para quem:** app.
- **O que muda:** onde o host pedia o id do workspace, aceita também o `universalIdentifier` do
  manifesto. Tenta o id; se não achar, procura o `universalIdentifier`; senão passa o valor como
  veio.
  - `fieldMetadataId` em `uploadFile` e `pickAndUploadFile`;
  - `frontComponentId` em `openSidePanelPage` com `ViewFrontComponent`;
  - `pageLayoutId` em `navigate` para `AppPath.PageLayoutPage`.
- **Como usar:** passar o `universalIdentifier` do manifesto, sem paginar metadados.
- **Limites:** um app que dependa disso não abre páginas, painéis nem anexos num Twenty sem a
  mudança.

## 0008: `runAgent` com uso, custo, código do erro e `persist`

- **Para quem:** app. O `executar-agente.ts` do app usa tudo isto pela API de metadados.
- **Resultado:** os campos do Twenty mais os do JotaDuo, todos opcionais.

  ```graphql
  mutation RunAgent($input: RunAgentInput!) {
    runAgent(input: $input) {
      threadId status result error success
      errorCode modelId durationMs
      usage { inputTokens outputTokens reasoningTokens cacheReadTokens cacheCreationTokens totalTokens nativeWebSearchCallCount }
      cost { totalCostInDollars creditsUsedMicro }
      toolCalls { toolName state }
    }
  }
  ```

  - **`status`** (do Twenty): `COMPLETED`, `SUSPENDED` (pausou numa espera e segue sozinho) ou
    `FAILED`. Substitui o `isWaiting` da ref anterior.
  - **`threadId`:** a conversa; `null` com `persist: false`, que não grava conversa. No Twenty ele é
    obrigatório; aqui pode ser nulo por causa do `persist`.
  - **`errorCode`:** `null` quando dá certo; `CREDITS_EXHAUSTED` quando o crédito acaba no meio; o
    código da exceção quando ela tem um (`QUOTA_EXHAUSTED`, `RATE_LIMITED`,
    `BILLING_SUBSCRIPTION_INACTIVE`, `CONTEXT_WINDOW_EXCEEDED`...); `AGENT_EXECUTION_FAILED` no resto.
  - **`error`:** o texto não muda, porque a mensagem do provedor pode trazer o endereço do LiteLLM.
  - **`toolCalls`:** só o nome e o estado (`started`, `success`, `error`, `awaiting-approval`). Por
    `execute_tool`, o nome é o da ferramenta chamada.
- **Entrada:** `persist: false` roda sem abrir turno, sem gravar mensagens e sem oferecer as
  ferramentas de espera. Uma pausa nessa execução falha sem fechar as chamadas pendentes de uma
  conversa existente. A cobrança continua. Só token de app pode pedir; outro chamador recebe
  `RUN_AGENT_NOT_ALLOWED`.
- **Limites:** quando a execução lança erro antes de começar, `usage` e `cost` voltam nulos. Os
  clientes GraphQL gerados do Twenty não foram refeitos.

## 0009: `watchRecordChanges`, aviso de mudança de registro

- **Para quem:** pessoa (a caixa atualiza sozinha), app.
- **O que muda:** o host conta as mudanças por objeto a partir dos eventos que a tela já recebe, e
  só um número cruza para o sandbox. Some a consulta a cada 5 s (~26 execuções por minuto por
  atendente).
- **Como usar, no componente:**

  ```ts
  await globalThis.frontComponentHostCommunicationApi.watchRecordChanges({
    objectNameSingulars: ['mensagem', 'conversa'], // 0 a 10; lista vazia para de observar
  });
  // { status: 'watching', objectNameSingulars } ou
  // { status: 'failed', reason: 'invalid-params' | 'unknown-object' | 'object-not-owned' | 'filter-not-supported' | 'unavailable' }
  ```

  Os contadores chegam em `recordChangeCounters` do contexto de execução. Compare só por
  diferença.
- **Regras:** só objetos do próprio app; a primeira mudança sai na hora e depois no máximo uma por
  segundo por objeto; quando a conexão de eventos volta, todos somam 1.
- **Limites:** sem `filter`; aba escondida atrasa; recarregar zera. Mantenha a consulta lenta como
  reserva.

## 0010: `application:upgrade --sync` e `autoUpgrade` nos pré-instalados

- **Para quem:** operação.
- **O que muda:** `--sync` atualiza o app workspace a workspace, no próprio processo, com uma linha
  por resultado; se algum falhar, os outros seguem e o comando sai com 1. Sem `--sync`, enfileira e
  sai, como no Twenty. Instalação de app pré-instalado nasce com `autoUpgrade = true`.
- **Como usar:**

  ```bash
  sudo docker exec -e NO_COLOR=1 jotaduo-server yarn command:prod application:upgrade -u <universalIdentifier> -y --sync
  ```

- **Limites:** `--sync --dry-run` não imprime linha por workspace.

## 0011: item de página escondido para quem não lê o objeto

- **Para quem:** pessoa, app.
- **O que muda:** o item de página avulsa no menu lateral some quando o papel da pessoa não lê o
  objeto da página. O endereço continua abrindo, e os widgets conferem a permissão.
- **Como usar:** `definePageLayout({ type: 'STANDALONE_PAGE', objectUniversalIdentifier, ... })`.
- **Limites:** a página inicial padrão ainda pode cair numa página escondida.

## 0012: funções sem as variáveis de ambiente do servidor

- **Para quem:** app, operação.
- **O que muda:** cada função recebia o `process.env` inteiro do servidor, com `APP_SECRET` e a senha
  do banco. Agora recebe uma lista fechada (`PATH`, `HOME`, `TMPDIR`, `TZ`, `LANG`, `NODE_ENV`,
  proxy e certificados), mais as variáveis do app e as `TWENTY_*`. A instalação das dependências
  recebe também as `YARN_*`.
- **Como usar:** variável de que a função precisa é declarada como variável do app.
- **Limites:** não é isolamento; a função roda com o usuário do servidor.

## 0013: saída em JSON dos agentes com contexto e esquema

- **Para quem:** app, admin.
- **O que muda:** em agente com formato `json`, a chamada que monta o JSON recebe as instruções, a
  conversa recente, os resultados de ferramenta, a resposta e o esquema, em seções com limite de
  tamanho. Antes recebia só o texto da resposta.
- **Opção no provedor:** `supportsStructuredOutputs: true` numa entrada `@ai-sdk/openai-compatible`
  de `AI_PROVIDERS` manda `json_schema` estrito ao LiteLLM; sem ela, `json_object`.
- **Limites:** mais tokens de entrada por chamada.

## 0014: autor da linha do tempo quando não há membro

- **Para quem:** pessoa.
- **O que muda:** sem membro, a linha do tempo mostra o primeiro ator não manual (app, agente ou
  chave de API), procurado em `properties.actor`, `diff.updatedBy`, `after.updatedBy`,
  `after.createdBy` e no `createdBy` da atividade. O servidor grava `properties.actor` nos marcos de
  criação e atualização.
- **Limites:** exclusão e restauração não guardam autor.

## 0016: `runAgent` aceita `maxSteps`

- **Para quem:** app. O app usa 3 passos na atendente e no Copiloto e 15 na Sofia do grupo.
- **O que muda:** `maxSteps` (Int) para a execução depois de tantos passos.
  - abaixo de 1, ou valor não inteiro, dá `INVALID_AGENT_INPUT` (checado no serviço, porque o
    resolver não roda o pipe de validação);
  - acima de `AGENT_CONFIG.MAX_STEPS` (300), vale 300; sem ele, 300.
  - Fica na especificação salva da execução: uma continuação conta do zero.
- **Limites:** execução cortada pelo limite pode voltar `success: true` com resposta vazia.

## 0018: rosto da IA no estado vazio do chat de IA

- **Para quem:** pessoa.
- **O que muda:** acima do título do estado vazio entra o rosto da IA do Figma (corpo `accent4`,
  olhos `accent10`): 40 px na página do chat, 24 px no painel. É o mesmo rosto do Copiloto do app.
- **Limites:** decorativo (`aria-hidden`).

## 0020: rosto animado no chat de IA e as boas-vindas do JotaDuo

- **Para quem:** pessoa.
- **O que muda:**
  - **Pensando:** três pontos no lugar dos olhos, no lugar do carregador nativo.
  - **Respostas:** cada resposta abre com o rosto de 16 px, pontos enquanto chega e olhos no fim.
  - **Estado vazio:** igual na página e no painel, rosto piscando a cada 5 s, título grande e
    atalhos em botão com contorno.
  - **Atalhos padrão:** "Criar um lembrete", "Cadastrar um cliente" e "Ver o que eu sei fazer".
  - As animações respeitam `prefers-reduced-motion`.
- **Limites:** edita o catálogo `pt-BR.po` do front ("Como posso ajudar?", os atalhos e o texto do
  campo), o trecho que mais tende a conflitar numa atualização do Twenty. Abaixo de ~768 px o
  Twenty não mostra o estado vazio.

## `AgentEntity` sem `evaluationInputs`

- **Para quem:** operação.
- **O que muda:** o comando de instância da 2.47 apaga `core.agent.evaluationInputs`, mas a entidade
  do Twenty ainda mapeava a coluna, para pods da 2.45 numa atualização gradual. Aqui o upgrade roda
  os comandos da 2.47 e não há pods antigos: sem a mudança, toda consulta de agente falha com
  `column AgentEntity.evaluationInputs does not exist` (aconteceu no dev em 08/10/2026).
- **Limites:** ao atualizar o Twenty, conferir se o upstream já tirou a coluna; aí este commit sai
  no conflito.

## CI, imagem e workflows

- **Para quem:** operação. O passo a passo está em [`README.md`](README.md).
- **O que muda:** sem workflows do GitHub. A checagem roda no runner do Forgejo do `oracle-sp`
  (`jotaduo/ci/oracle-sp.sh`), e a imagem é gerada no próprio servidor
  (`jotaduo/ci/imagem-oracle-sp.sh`).
