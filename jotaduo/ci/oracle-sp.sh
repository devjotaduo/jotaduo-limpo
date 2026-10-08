#!/usr/bin/env bash
# Dispara a checagem de um commit do fork no runner do Forgejo do oracle-sp.
# Rode no servidor: bash oracle-sp.sh <commit> [branch]
# Busca o branch num clone bare em ~/checagens/fork.git, extrai o commit sem .git numa
# pasta própria do runner (o forgejo-runner exec só copia para /workspace uma pasta sem
# repositório), roda .forgejo/workflows/checagem.yml e grava a saída em
# ~/checagens/<commit curto>/runner.log. Não apaga nada: a pasta de um commit já extraído
# é reaproveitada.
set -euo pipefail

COMMIT="${1:?informe o commit}"
BRANCH="${2:-jotaduo/custom}"
REPO_URL="https://github.com/devjotaduo/jotaduo-limpo.git"
RUNNER_CONTAINER="1Panel-forgejo-runner-DcLI"
RUNNER_DATA="/opt/1panel/apps/forgejo-runner/forgejo-runner/data"
CACHE_REPO="$HOME/checagens/fork.git"
SHORT="${COMMIT:0:9}"
WORKDIR_NAME="checagens/custom-$SHORT"
REPORT_DIR="$HOME/checagens/$SHORT"

mkdir -p "$REPORT_DIR"
[ -d "$CACHE_REPO" ] || git init -q --bare "$CACHE_REPO"
git -C "$CACHE_REPO" fetch -q --depth 1 "$REPO_URL" "$BRANCH"
git -C "$CACHE_REPO" cat-file -e "$COMMIT^{commit}" || {
  echo "O commit $COMMIT não é a ponta de $BRANCH no fork" >&2
  exit 1
}

if ! sudo -n test -f "$RUNNER_DATA/$WORKDIR_NAME/package.json"; then
  sudo -n mkdir -p "$RUNNER_DATA/$WORKDIR_NAME"
  git -C "$CACHE_REPO" archive --format=tar "$COMMIT" | sudo -n tar -x -C "$RUNNER_DATA/$WORKDIR_NAME"
fi

echo "Checagem de $COMMIT em $RUNNER_DATA/$WORKDIR_NAME; saída em $REPORT_DIR/runner.log"
sudo -n docker exec "$RUNNER_CONTAINER" forgejo-runner exec \
  --directory "/data/$WORKDIR_NAME" \
  --workflows .forgejo/workflows/checagem.yml --job checagem \
  --image docker:29.8.2-cli --env-file /dev/null \
  --container-opts "--cpus=1 --memory=1g" </dev/null 2>&1 | tee "$REPORT_DIR/runner.log"
