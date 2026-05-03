#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER="$SCRIPT_DIR/scripts/install-apply.js"
TARGET_PROJECT=""
PROFILE="developer"
DRY_RUN=()
CLAIM=()
WITH_COMPONENTS=()
WITHOUT_COMPONENTS=()
TARGETS=("claude-project" "cursor" "codex-project")

usage() {
  cat <<'EOF'
Usage: ecc-init.sh <target-project-path> [flags]

Project bootstrap wrapper around the manifest installer.

Flags:
  --profile <name>       Manifest profile to install (default: developer)
  --target <name>        Install one target instead of the default Claude/Cursor/Codex project set
  --with <component>     Include an install component
  --without <component>  Exclude an install component
  --with-gan             Include capability:gan
  --claim                Record ecc-install.json and install-state without applying file operations
  --dry-run              Print installer plans without writing
  -h, --help             Show this help
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --profile)
      PROFILE="${2:-}"
      [ -n "$PROFILE" ] || { echo "ecc-init.sh: --profile requires a value" >&2; exit 1; }
      shift 2
      ;;
    --target)
      target_value="${2:-}"
      [ -n "$target_value" ] || { echo "ecc-init.sh: --target requires a value" >&2; exit 1; }
      TARGETS=("$target_value")
      shift 2
      ;;
    --with)
      component_value="${2:-}"
      [ -n "$component_value" ] || { echo "ecc-init.sh: --with requires a value" >&2; exit 1; }
      WITH_COMPONENTS+=("--with" "$component_value")
      shift 2
      ;;
    --without)
      component_value="${2:-}"
      [ -n "$component_value" ] || { echo "ecc-init.sh: --without requires a value" >&2; exit 1; }
      WITHOUT_COMPONENTS+=("--without" "$component_value")
      shift 2
      ;;
    --with-gan)
      WITH_COMPONENTS+=("--with" "capability:gan")
      shift
      ;;
    --claim)
      CLAIM=("--claim")
      shift
      ;;
    --dry-run)
      DRY_RUN=("--dry-run")
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "ecc-init.sh: unknown flag: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [ -z "$TARGET_PROJECT" ]; then
        TARGET_PROJECT="$1"
      else
        echo "ecc-init.sh: unexpected argument: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

[ -n "$TARGET_PROJECT" ] || { usage >&2; exit 1; }
[ -d "$TARGET_PROJECT" ] || { echo "ecc-init.sh: target project does not exist: $TARGET_PROJECT" >&2; exit 1; }
[ -f "$INSTALLER" ] || { echo "ecc-init.sh: installer not found: $INSTALLER" >&2; exit 1; }

TARGET_PROJECT="$(cd "$TARGET_PROJECT" && pwd -P)"

for install_target in "${TARGETS[@]}"; do
  (
    cd "$TARGET_PROJECT"
    node "$INSTALLER" \
      --target "$install_target" \
      --profile "$PROFILE" \
      "${WITH_COMPONENTS[@]}" \
      "${WITHOUT_COMPONENTS[@]}" \
      "${CLAIM[@]}" \
      "${DRY_RUN[@]}"
  )
done
