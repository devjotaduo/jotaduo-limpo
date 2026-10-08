#!/usr/bin/env bash
# Gera a imagem de produção do Twenty do JotaDuo no oracle-sp e a deixa no Docker do host.
# Rode no servidor: bash imagem-oracle-sp.sh <commit> [branch]
# A tag é <ref do Twenty>-<commit>, com a ref em jotaduo/twenty-base.ref. Gere só de um
# commit que passou em jotaduo/ci/oracle-sp.sh: o build não confere tipos. Não envia a
# imagem a registro nenhum nem troca imagem de container: isso é o DEPLOY.md.
set -euo pipefail

COMMIT="${1:?informe o commit}"
BRANCH="${2:-jotaduo/custom}"
REPO_URL="https://github.com/devjotaduo/jotaduo-limpo.git"
CACHE_REPO="$HOME/checagens/fork.git"
BUILDER="${BUILDER:-jotaduo-checagem}"
IMAGE="${IMAGE:-rutherles/jotaduo}"
SHORT="${COMMIT:0:8}"
CONTEXT="$HOME/imagens/custom-$SHORT"

mkdir -p "$HOME/imagens"
[ -d "$CACHE_REPO" ] || git init -q --bare "$CACHE_REPO"
git -C "$CACHE_REPO" fetch -q --depth 50 "$REPO_URL" "$BRANCH"
git -C "$CACHE_REPO" cat-file -e "$COMMIT^{commit}" || {
  echo "O commit $COMMIT não está entre os últimos de $BRANCH no fork" >&2
  exit 1
}

if [ ! -f "$CONTEXT/package.json" ]; then
  mkdir -p "$CONTEXT"
  git -C "$CACHE_REPO" archive --format=tar "$COMMIT" | tar -x -C "$CONTEXT"
fi

TWENTY_REF="$(tr -d '[:space:]' < "$CONTEXT/jotaduo/twenty-base.ref")"
VERSION_FILE="$CONTEXT/packages/twenty-server/src/engine/core-modules/upgrade/constants/twenty-current-version.constant.ts"
TWENTY_VERSION="$(sed -n "s/.*TWENTY_CURRENT_VERSION = '\([^']*\)'.*/\1/p" "$VERSION_FILE")"
[ -n "$TWENTY_VERSION" ] || { echo "Não achei TWENTY_CURRENT_VERSION" >&2; exit 1; }
TAG="${TWENTY_REF:0:8}-$SHORT"

sudo -n docker buildx inspect "$BUILDER" >/dev/null 2>&1 || \
  sudo -n docker buildx create --name "$BUILDER" --driver docker-container \
    --driver-opt memory=12g --driver-opt cpu-quota=400000 --driver-opt cpu-period=100000

echo "Gerando $IMAGE:$TAG (Twenty v$TWENTY_VERSION, base $TWENTY_REF, commit $COMMIT)"
build() {
  sudo -n docker buildx build --builder "$BUILDER" --progress=plain \
    --platform linux/amd64 --build-arg APP_VERSION="v$TWENTY_VERSION" \
    -f "$CONTEXT/packages/twenty-docker/twenty/Dockerfile" "$@" "$CONTEXT"
}
# o servidor e o front em paralelo, na cota de 4 CPUs, deixam o lingui extract sem
# resposta dos workers; um de cada vez, e a imagem final só junta o que ficou em cache
status=0
build --target twenty-server-build &&
  build --target twenty-front-build &&
  build --target twenty -t "$IMAGE:$TAG" --load || status=$?

# o volume do builder guarda o cache para o próximo build e a próxima checagem
sudo -n docker buildx rm --keep-state "$BUILDER" >/dev/null 2>&1 || true
[ "$status" -eq 0 ] || exit "$status"
echo "Imagem: $IMAGE:$TAG"
