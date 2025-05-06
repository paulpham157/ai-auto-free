#!/bin/bash
# Cursor Patch Shell Script
# Cursor patching tool for MacOS and Linux

set -e

# Function to generate a random UUID
generate_uuid() {
    if command -v uuidgen >/dev/null 2>&1; then
        uuid=$(uuidgen)
    else
        # Fallback if uuidgen is not available
        uuid=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "$(date +%s)-$RANDOM-$RANDOM-$RANDOM")
    fi
    echo "Generated UUID: $uuid"
    echo "$uuid"
}

# Function to generate a random MAC address
generate_mac_address() {
    local mac=""
    while [ -z "$mac" ] || [ "$mac" = "00:00:00:00:00:00" ] || [ "$mac" = "ff:ff:ff:ff:ff:ff" ] || [ "$mac" = "ac:de:48:00:11:22" ]; do
        mac=$(printf "%02X:%02X:%02X:%02X:%02X:%02X\n" $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)))
    done
    echo "Generated MAC address: $mac"
    echo "$mac"
}

# Get base path for Cursor app
get_cursor_base_path() {
    local base_path=""
    if [ "$(uname)" = "Darwin" ]; then
        # MacOS
        base_path="/Applications/Cursor.app/Contents/Resources/app"
    else
        # Linux - try common locations
        for path in "/opt/Cursor/resources/app" "/usr/share/cursor/resources/app"; do
            if [ -d "$path" ]; then
                base_path="$path"
                break
            fi
        done
    fi

    if [ -z "$base_path" ] || [ ! -d "$base_path" ]; then
        echo "Error: Cursor base path not found" >&2
        exit 1
    fi

    echo "$base_path"
}

# Get JS path
get_js_path() {
    local path="$1"
    local js_path=""

    if [ -n "$path" ]; then
        if command -v realpath >/dev/null 2>&1; then
            js_path="$(realpath "$path")"
        else
            # Fallback if realpath is not available (e.g., on macOS)
            js_path="$(cd "$(dirname "$path")" && pwd)/$(basename "$path")"
        fi
    else
        local cursor_base="$(get_cursor_base_path)"
        js_path="$cursor_base/out/main.js"
    fi

    if [ ! -f "$js_path" ]; then
        echo "Error: File not found: $js_path" >&2
        exit 1
    fi

    echo "$js_path"
}

# Create backup of file
backup_file() {
    local file="$1"
    local bak_file="${file}.bak"

    echo "Creating backup"
    if [ ! -f "$bak_file" ]; then
        cp -p "$file" "$bak_file"
        echo "Backup created"
    else
        echo "Backup exists"
    fi
}

# Count regex matches in a portable way
count_matches() {
    local data="$1"
    local pattern="$2"
    local os_type="$(uname)"

    if [ "$os_type" = "Linux" ] && grep -P -q "" 2>/dev/null; then
        # Linux with Perl regex support
        echo "$data" | grep -P "$pattern" | wc -l
    elif [ "$os_type" = "Darwin" ]; then
        # MacOS - use grep -E and handle with simplified patterns
        # This is not perfect but a best-effort for MacOS
        echo "$data" | grep -E "$pattern" | wc -l
    else
        # Fallback
        echo "$data" | grep -E "$pattern" | wc -l
    fi
}

# Replace pattern in file data with improved compatibility
replace_pattern() {
    local data="$1"
    local pattern="$2"
    local replacement="$3"
    local probe="$4"
    local os_type="$(uname)"

    echo "Replacing pattern"

    # Count original matches (with compatibility handling)
    local count=$(count_matches "$data" "$pattern")
    # Count already patched matches
    local patched_count=$(count_matches "$data" "$probe")

    if [ "$count" -eq 0 ]; then
        if [ "$patched_count" -gt 0 ]; then
            echo "Found already patched patterns"
        else
            echo "Warning: Pattern not found, SKIPPED!"
        fi
        echo "$data"
        return
    fi

    # Choose the right sed command based on OS
    local result=""
    if [ "$os_type" = "Darwin" ]; then
        # MacOS uses BSD sed
        result=$(echo "$data" | sed -E "s|$probe|$replacement|g" | sed -E "s|$pattern|$replacement|g")
    else
        # Linux likely uses GNU sed
        result=$(echo "$data" | sed -r "s|$probe|$replacement|g" | sed -r "s|$pattern|$replacement|g")
    fi

    # Get replaced count (this is approximate in shell)
    local replaced_count=$(count_matches "$result" "$(echo "$replacement" | sed 's/[\/&]/\\&/g')")

    if [ "$replaced_count" -ne $((count + patched_count)) ]; then
        echo "Warning: Patched $replaced_count/$count, failed $((count - replaced_count + patched_count))"
    else
        echo "Patching complete"
    fi

    echo "$result"
}

# Patch Cursor
patch_cursor() {
    echo "Starting Cursor patch..."

    local js_path=$(get_js_path "$1")
    local data=$(cat "$js_path")

    # Apply patches
    local machine_id=$(generate_uuid)
    data=$(replace_pattern "$data" "=.{0,50}timeout.{0,10}5e3.*?," "=/*csp1*/\"$machine_id\"/*1csp*/," "=/\*csp1\*/.*?/\*1csp\*/,")

    local mac=$(generate_mac_address)
    data=$(replace_pattern "$data" "(function .{0,50}\{).{0,300}Unable to retrieve mac address.*?(\})" "\1return/*csp2*/\"$mac\"/*2csp*/;\2" "()return/\*csp2\*/.*?/\*2csp\*/;()")

    local sqm=""
    data=$(replace_pattern "$data" "return.{0,50}\.GetStringRegKey.*?HKEY_LOCAL_MACHINE.*?MachineId.*?\|\|.*?\"\"" "return/*csp3*/\"$sqm\"/*3csp*/" "return/\*csp3\*/.*?/\*3csp\*/")

    local dev_id=$(generate_uuid)
    data=$(replace_pattern "$data" "return.{0,50}vscode/deviceid.*?getDeviceId\(\)" "return/*csp4*/\"$dev_id\"/*4csp*/" "return/\*csp4\*/.*?/\*4csp\*/")

    # Backup and save
    backup_file "$js_path"

    echo "Saving file"
    if echo "$data" > "$js_path"; then
        echo "File saved successfully"
        echo "OK"
    else
        echo "Error: Permission denied. The file '$js_path' is in use, please close it and try again" >&2
        exit 1
    fi
}

# Determine OS
OS=$(uname)
if [ "$OS" != "Darwin" ] && [ "$OS" != "Linux" ]; then
    echo "Error: Unsupported OS: $OS" >&2
    exit 1
fi

# Script start
echo "Starting Cursor Patch..."
patch_cursor "$1"
echo "Process completed!"
