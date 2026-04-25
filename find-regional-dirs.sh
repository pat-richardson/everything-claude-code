#!/usr/bin/env bash

# find-regional-dirs.sh
# Find and optionally delete directories with regional suffixes (-BR, -CN, -TW, -JP, -KR)
#
# Usage: find-regional-dirs.sh [OPTIONS] [ROOT_PATH]
#
# Author: Generated for production use
# Version: 1.0.0

set -Eu
shopt -s nullglob

# ============================================================================
# Constants & Configuration
# ============================================================================

readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly SCRIPT_VERSION="1.2.0"

# Regional suffixes to match
readonly -a REGIONAL_SUFFIXES=(-BR -CN -TW -JP -KR)

# Operational flags
MODE_DRY_RUN=1  # Default behavior
MODE_DELETE=0
MODE_INCLUDE_FILES=0
VERBOSE=0
CONFIG_FILE=""

# ============================================================================
# Logging & Output Functions
# ============================================================================

# Print usage information
usage() {
	cat <<-'EOF'
		Usage: find-regional-dirs.sh [OPTIONS] [ROOT_PATH]

		Find directories ending with regional suffixes (-BR, -CN, -TW, -JP, -KR).
		By default, performs a dry-run (lists matches without deleting).

		OPTIONS:
		  --dry-run         List matched items (default behavior)
		  --delete          Actually delete matched items (recursive)
		  --files           Also match files with regional suffixes (e.g. README.zh-CN.md)
		  --config FILE     Read additional paths to include from a file (one path per line;
		                    # comments and blank lines are ignored)
		  --verbose, -v     Show detailed progress information
		  --help, -h        Display this help message
		  --version         Show version information

		ARGUMENTS:
		  ROOT_PATH         Starting directory for search (default: current directory)

		EXAMPLES:
		  # List all regional directories in current directory
		  find-regional-dirs.sh

		  # Also match regional files (e.g. README.zh-CN.md)
		  find-regional-dirs.sh --files

		  # Include extra paths from a config file (e.g. docs/tr which has no suffix)
		  find-regional-dirs.sh --config regional-extra.txt --dry-run

		  # Delete everything: pattern matches + config paths
		  find-regional-dirs.sh --files --config regional-extra.txt --delete

		  # Dry-run with verbose output
		  find-regional-dirs.sh --verbose --dry-run /var/lib

		EXIT CODES:
		  0                 Success
		  1                 General error
		  2                 Invalid arguments
	EOF
}

# Show version
show_version() {
	printf '%s version %s\n' "$SCRIPT_NAME" "$SCRIPT_VERSION"
}

# Print info message
log_info() {
	printf '[INFO] %s\n' "$*" >&2
}

# Print error message
log_error() {
	printf '[ERROR] %s\n' "$*" >&2
}

# Print verbose message (only if VERBOSE=1)
log_verbose() {
	if (( VERBOSE )); then
		printf '[VERBOSE] %s\n' "$*" >&2
	fi
}

# ============================================================================
# Core Functions
# ============================================================================

# Validate that root path exists and is readable
validate_root_path() {
	local root_path="$1"

	if [[ ! -d "$root_path" ]]; then
		log_error "Root path does not exist: $root_path"
		return 1
	fi

	if [[ ! -r "$root_path" ]]; then
		log_error "Root path is not readable: $root_path"
		return 1
	fi

	return 0
}

# Read explicit paths from a config file (one path per line; # comments and blank lines ignored)
read_config_paths() {
	local config_file="$1"
	local line

	while IFS= read -r line; do
		[[ -z "$line" || "$line" == '#'* ]] && continue
		if [[ ! -e "$line" ]]; then
			log_verbose "Config path not found, skipping: $line"
			continue
		fi
		printf '%s\n' "$line"
	done < "$config_file"
}

# Find all matching directories (and optionally files)
find_regional_directories() {
	local root_path="$1"
	local -a matched_dirs=()
	local -a find_expr=()

	log_verbose "Searching for regional items in: $root_path"

	# Build find expression as an array to avoid glob expansion via $()
	# Dirs match: *-SUFFIX  Files match: *-SUFFIX.ext (e.g. README.zh-CN.md)
	for suffix in "${REGIONAL_SUFFIXES[@]}"; do
		if (( ${#find_expr[@]} > 0 )); then
			find_expr+=(-o)
		fi
		find_expr+=(-name "*${suffix}")
		if (( MODE_INCLUDE_FILES )); then
			find_expr+=(-o -name "*${suffix}.*")
		fi
	done

	while IFS= read -r -d '' dir; do
		matched_dirs+=("$dir")
	done < <(
		if (( MODE_INCLUDE_FILES )); then
			find "$root_path" -mindepth 1 \
				\( "${find_expr[@]}" \) \
				-print0 2>/dev/null || true
		else
			find "$root_path" -mindepth 1 -type d \
				\( "${find_expr[@]}" \) \
				-print0 2>/dev/null || true
		fi
	)

	if (( ${#matched_dirs[@]} > 0 )); then
		printf '%s\n' "${matched_dirs[@]}"
	fi
}

# Delete a file or directory safely
# Pass from_config=1 to skip the pattern safety check (path was explicitly listed)
delete_item() {
	local item_path="$1"
	local from_config="${2:-0}"

	# Extra safety: verify item still exists before deletion
	if [[ ! -e "$item_path" ]]; then
		log_verbose "Item no longer exists (may have been deleted): $item_path"
		return 0
	fi

	# Pattern safety check — skipped for config-sourced paths (user opted them in explicitly)
	if ! (( from_config )); then
		local item_basename
		item_basename=$(basename "$item_path")
		if ! matches_regional_pattern "$item_basename"; then
			log_error "Safety check failed: item does not match regional pattern: $item_path"
			return 1
		fi
	fi

	log_verbose "Deleting: $item_path"
	if rm -rf -- "$item_path"; then
		return 0
	else
		log_error "Failed to delete: $item_path"
		return 1
	fi
}

# Check if a name matches our regional pattern (dirs end with suffix; files have suffix before extension)
matches_regional_pattern() {
	local name="$1"

	for suffix in "${REGIONAL_SUFFIXES[@]}"; do
		if [[ "$name" == *"$suffix" ]] || [[ "$name" == *"${suffix}."* ]]; then
			return 0
		fi
	done

	return 1
}

# Process found directories (and optionally files + config paths)
process_directories() {
	local root_path="$1"
	local -a pattern_items=()
	local -a config_items=()
	local delete_count=0
	local error_count=0

	log_verbose "Mode: $( (( MODE_DELETE )) && printf 'DELETE' || printf 'DRY-RUN' )"

	# Collect pattern-matched items
	while IFS= read -r dir; do
		[[ -n "$dir" ]] && pattern_items+=("$dir")
	done < <(find_regional_directories "$root_path")

	# Collect config file paths
	if [[ -n "$CONFIG_FILE" ]]; then
		log_verbose "Reading paths from config: $CONFIG_FILE"
		while IFS= read -r config_path; do
			[[ -n "$config_path" ]] && config_items+=("$config_path")
		done < <(read_config_paths "$CONFIG_FILE")
	fi

	local total=$(( ${#pattern_items[@]} + ${#config_items[@]} ))

	# Handle case: nothing found
	if (( total == 0 )); then
		log_info "No items found"
		printf '0\n'
		return 0
	fi

	# Process pattern-matched items (safety check applies)
	if (( ${#pattern_items[@]} > 0 )); then
		for item in "${pattern_items[@]}"; do
			printf '%s\n' "$item"
			log_verbose "  $item"
			if (( MODE_DELETE )); then
				if ! delete_item "$item"; then
					(( error_count++ )) || true
				else
					(( delete_count++ )) || true
				fi
			fi
		done
	fi

	# Process config-sourced items (safety check skipped — explicitly listed)
	if (( ${#config_items[@]} > 0 )); then
		for item in "${config_items[@]}"; do
			printf '%s\n' "$item"
			log_verbose "  $item [config]"
			if (( MODE_DELETE )); then
				if ! delete_item "$item" 1; then
					(( error_count++ )) || true
				else
					(( delete_count++ )) || true
				fi
			fi
		done
	fi

	# Print summary
	printf '\n'
	if (( MODE_DELETE )); then
		log_info "Deleted: $delete_count items"
		if (( error_count > 0 )); then
			log_error "Failed to delete: $error_count items"
			printf '%d\n' "$error_count"
			return 1
		fi
	else
		log_info "Found: $total items (dry-run mode)"
	fi

	printf '%d\n' "$total"
	return 0
}

# ============================================================================
# Main Entry Point
# ============================================================================

main() {
	local root_path="."
	local show_help=0
	local show_version_flag=0

	# Parse command-line arguments
	while (( $# > 0 )); do
		case "$1" in
		--help | -h)
			show_help=1
			shift
			;;
		--version)
			show_version_flag=1
			shift
			;;
		--dry-run)
			MODE_DRY_RUN=1
			MODE_DELETE=0
			shift
			;;
		--delete)
			MODE_DRY_RUN=0
			MODE_DELETE=1
			shift
			;;
		--files)
			MODE_INCLUDE_FILES=1
			shift
			;;
		--config)
			if (( $# < 2 )); then
				log_error "--config requires a file argument"
				return 2
			fi
			CONFIG_FILE="$2"
			if [[ ! -f "$CONFIG_FILE" ]]; then
				log_error "Config file not found: $CONFIG_FILE"
				return 1
			fi
			shift 2
			;;
		--verbose | -v)
			VERBOSE=1
			shift
			;;
		-*)
			log_error "Unknown option: $1"
			printf 'Use --help for usage information\n' >&2
			return 2
			;;
		*)
			root_path="$1"
			shift
			;;
		esac
	done

	# Handle help/version display
	if (( show_help )); then
		usage
		return 0
	fi

	if (( show_version_flag )); then
		show_version
		return 0
	fi

	# Validate root path exists
	if ! validate_root_path "$root_path"; then
		return 1
	fi

	# Default to dry-run mode if neither flag was specified
	if (( !MODE_DELETE && !MODE_DRY_RUN )); then
		MODE_DRY_RUN=1
		log_info "No mode specified. Using dry-run (pass --delete to actually remove files)"
	fi

	# Inform user about mode
	local scope_label
	scope_label="$( (( MODE_INCLUDE_FILES )) && printf 'directories and files' || printf 'directories' )"
	[[ -n "$CONFIG_FILE" ]] && scope_label+=" + config paths"
	if (( MODE_DRY_RUN )); then
		log_info "Dry-run mode: listing matched ${scope_label} (use --delete to remove)"
	elif (( MODE_DELETE )); then
		log_info "Delete mode: removing matched ${scope_label}"
	fi

	# Process directories (and optionally files)
	if process_directories "$root_path"; then
		return 0
	else
		return 1
	fi
}

# Run main if not being sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
	main "$@"
	exit $?
fi
