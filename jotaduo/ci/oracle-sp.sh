#!/usr/bin/env bash
# Dispara a checagem de um commit do fork no runner do Forgejo do oracle-sp.
# Rode no servidor: bash oracle-sp.sh <commit> [branch]
# Clona o commit numa pasta própria, roda .forgejo/workflows/checagem.yml com
# forgejo-runner exec e grava a saída em ~/checagens/<commit curto>/runner.log. Não apaga nada:
# o clone de um commit que já foi checado é reaproveitado, e a saída da nova rodada
# substitui a anterior em runner.log.
set -euo pipefail

COMMIT="${1:?informe o commit}"
BRANCH="${2:-jotaduo/custom}"
REPO_URL="https://github.com/devjotaduo/jotaduo-limpo.git"
RUNNER_CONTAINER="1Panel-forgejo-runner-DcLI"
RUNNER_DATA="/opt/1panel/apps/forgejo-runner/forgejo-runner/data"
SHORT="${COMMIT:0:9}"
WORKDIR_NAME="checagens/custom-$SHORT"
REPORT_DIR="$HOME/checagens/$SHORT"

mkdir -p "$REPORT_DIR"

if ! sudo -n test -d "$RUNNER_DATA/$WORKDIR_NAME/.git"; then
  sudo -n mkdir -p "$RUNNER_DATA/$WORKDIR_NAME"
  sudo -n git -C "$RUNNER_DATA/$WORKDIR_NAME" init -q
  sudo -n git -C "$RUNNER_DATA/$WORKDIR_NAME" fetch -q --depth 1 "$REPO_URL" "$BRANCH"
fi
# o runner pede um branch para montar o contexto do job; um HEAD solto só gera avisos
sudo -n git -C "$RUNNER_DATA/$WORKDIR_NAME" checkout -q -B jotaduo-checagem "$COMMIT"

echo "Checagem de $COMMIT em $RUNNER_DATA/$WORKDIR_NAME; saída em $REPORT_DIR/runner.log"
sudo -n docker exec "$RUNNER_CONTAINER" forgejo-runner exec \
  --directory "/data/$WORKDIR_NAME" \
  --workflows .forgejo/workflows/checagem.yml --job checagem \
  --image docker:29.8.2-cli --env-file /dev/null \
  --container-opts "--cpus=1 --memory=1g" </dev/null 2>&1 | tee "$REPORT_DIR/runner.log"
