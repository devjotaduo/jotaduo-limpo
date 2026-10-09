#!/usr/bin/env bash
# Confere o Twenty do JotaDuo sem gerar imagem: typecheck de servidor, SDK, front e
# renderizador, e os testes das pastas que o JotaDuo muda, no BuildKit.
#
#   jotaduo/ci/checar.sh                 servidor e front
#   jotaduo/ci/checar.sh server-check    só servidor e SDK
#   jotaduo/ci/checar.sh front-check     só front e renderizador
#
# Variáveis: BUILDER (padrão: o builder atual), SERVER_TESTS, FRONT_TESTS, RENDERER_TESTS
# (caminhos de teste relativos ao pacote), LOG_DIR (padrão jotaduo/ci/logs).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="${LOG_DIR:-$REPO_DIR/jotaduo/ci/logs}"
SERVER_TESTS="${SERVER_TESTS:-src/engine/core-modules/application src/engine/core-modules/logic-function src/engine/metadata-modules/ai src/engine/metadata-modules/page-layout src/engine/metadata-modules/flat-page-layout src/engine/core-modules/admin-panel src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field src/modules/timeline}"
FRONT_TESTS="${FRONT_TESTS:-src/modules/front-components src/modules/metadata-store src/modules/navigation-menu-item src/modules/activities/timeline-activities src/modules/ai/components src/modules/page-layout src/modules/side-panel/pages/page-layout src/jotaduo}"
RENDERER_TESTS="${RENDERER_TESTS:-src}"

builder_args=()
[ -z "${BUILDER:-}" ] || builder_args=(--builder "$BUILDER")

alvos=("$@")
[ "${#alvos[@]}" -gt 0 ] || alvos=(server-check front-check)

mkdir -p "$LOG_DIR"
cd "$REPO_DIR"
falhou=0
for alvo in "${alvos[@]}"; do
  log="$LOG_DIR/checagem-$alvo.log"
  echo "== $alvo (log em $log)"
  if docker buildx build "${builder_args[@]}" --progress=plain --target "$alvo" \
      --build-arg SERVER_TESTS="$SERVER_TESTS" --build-arg FRONT_TESTS="$FRONT_TESTS" \
      --build-arg RENDERER_TESTS="$RENDERER_TESTS" \
      -f jotaduo/ci/Dockerfile.checagem . > "$log" 2>&1; then
    echo "ok"
  else
    echo "falhou"; falhou=1
  fi
  # uma falha do builder pode não emitir o resumo; ainda assim confira os outros alvos
  grep -E 'erros TS|error TS|Tests:|Test Suites:' "$log" | sed -E 's/^#[0-9]+ [0-9.]+ //' | sed -n '1,40p' || true
done
exit "$falhou"
