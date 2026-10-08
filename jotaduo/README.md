# Twenty do JotaDuo

Este branch (`jotaduo/custom`, no fork `devjotaduo/jotaduo-limpo`) é o Twenty que roda no JotaDuo:
o código do Twenty com as mudanças do JotaDuo feitas direto nele, um commit por mudança. Desde
08/10/2026 ele substitui o overlay de patches (`devjotaduo/jotaduo-overlay`), que continua com o
`DEPLOY.md`, o histórico das trocas e as cópias do servidor.

- **O que muda e como usar:** [`MUDANCAS.md`](MUDANCAS.md).
- **A ref do Twenty na base:** [`twenty-base.ref`](twenty-base.ref).
- **A troca na produção:** o `DEPLOY.md` do overlay, seções 4 a 6.

## Regras

- Mudança no Twenty entra aqui como commit `JotaDuo NNNN: <efeito>`, em português, com o porquê no
  corpo. Mudança nova leva o próximo número e uma seção no `MUDANCAS.md` no mesmo commit.
- Fica só o que vale a pena: o que o app chama, o que corrige problema real do servidor e a marca.
- O código segue o `CLAUDE.md` do Twenty na raiz: sem catálogo de tradução, sem arquivo gerado,
  sem entidade nova nem migração.
- Não entra mudança que contorne a licença do Twenty (`EnterprisePlanService`, limite de
  workspaces, arquivos `@license Enterprise`).
- O histórico publicado não é reescrito: para desfazer, `git revert`.
- Imagem só de um commit que passou na checagem.

## Checar um commit

O build da imagem não confere tipos (o `nest build` usa SWC com `typeCheck: false`). A checagem
roda o typecheck de servidor, SDK, front e renderizador numa instalação completa e os testes das
pastas que o JotaDuo muda.

1. Faça push do branch.
2. No `oracle-sp`, com o script copiado para a home:

   ```bash
   bash ~/jotaduo-ci-oracle-sp.sh <commit> jotaduo/custom
   ```

   O script extrai o commit numa pasta do runner do Forgejo, monta em `/workspace` e roda
   [`.forgejo/workflows/checagem.yml`](../.forgejo/workflows/checagem.yml) com
   `forgejo-runner exec`. A saída fica em `~/checagens/<commit>/runner.log`.
3. Esperado: `erros TS: 0` nos quatro e todos os testes passando (em 08/10: 1.706 no servidor, 557
   no front, 1.339 no renderizador).

O runner (13.2.0, `dood`) não copia o código para o job e já monta o `docker.sock`: não passe
outro `-v /var/run/docker.sock`. O builder `jotaduo-checagem` guarda o cache com `--keep-state`.

Sem o servidor, a mesma checagem roda em qualquer Docker com buildx:
`jotaduo/ci/checar.sh [server-check|front-check]`.

## Gerar a imagem

No `oracle-sp`:

```bash
bash ~/jotaduo-imagem-oracle-sp.sh <commit> jotaduo/custom
```

Sai `rutherles/jotaduo:<ref do Twenty>-<commit>` no Docker do host, pronta para o dev e a
produção. O script compila servidor e front em sequência e tira a cota de CPU do builder: o
`lingui extract` abre um worker por CPU da máquina, e com 4 CPUs os workers não sobem em 10 s.
Durante o build a produção pode ficar mais lenta. A imagem não vai para o Docker Hub.

## Trocar a imagem

1. **Dev:** `sudo bash /home/ubuntu/dev-trocar-imagem.sh <imagem> --aplicar` (dump, passo 4.4 e
   subida). Confira `upgrade:status`, funções gravando no kv e worker sem erro.
2. **Produção:** só com o ok da pessoa, pelo `DEPLOY.md` do overlay. O modo automático do Claude
   Code barra a troca; a pessoa roda os comandos.

Lições da troca de 08/10/2026:

- **O passo 4.4 (`run-instance-commands`) é obrigatório.** Nesta ref, sem ele, o `upgrade` do boot
  roda o comando de workspace `DeleteOrphanedWorkflowRuns`, que lê `pendingWakeUp.payload` antes de
  o comando de instância que cria a coluna rodar, e os workspaces falham.
- **Workspace criado depois da versão anterior** nasce sem o registro dela e faz o 4.4 recusar (o
  `onbording`). Confira os workspaces um a um e só então use `--force`.
- **Comandos de uma versão sem tag mudam no upstream.** Antes de trocar, confira se o último passo
  registrado na produção ainda existe na ref nova.

## Atualizar o Twenty

1. `git fetch upstream` e `git merge upstream/main` neste branch, resolvendo os conflitos commit a
   commit pela intenção descrita no `MUDANCAS.md`.
2. Atualize [`twenty-base.ref`](twenty-base.ref) com o `git merge-base HEAD upstream/main`.
3. Confira as mudanças de banco do upstream (comandos de instância e de workspace novos ou
   reescritos) e se alguma entidade ainda mapeia coluna que um comando apaga.
4. Cheque, gere a imagem e passe pelo dev antes da produção.

## Armazenamento dos front components

Os arquivos compilados ficam em
`/app/packages/twenty-server/.local-storage/<workspace>/<app>/built-front-component/` (volume
`./data` do app twenty do 1Panel). O banco guarda o caminho e o SHA-256 (`builtComponentChecksum`).
Se um front component der 404, confira se o arquivo existe. Em 08/10/2026, 41 arquivos do
`brendo` sumiram às 17:00, por causa ainda desconhecida, e foram restaurados copiando de outro
workspace com o mesmo app e o mesmo SHA-256.
