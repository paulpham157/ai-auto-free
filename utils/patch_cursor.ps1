# Cursor Patch PowerShell Script
# Cursor patching tool for Windows

function Get-RandomUUID {
    param (
        [string]$uuid = ""
    )
    if (-not $uuid) {
        $uuid = [guid]::NewGuid().ToString()
        Write-Host "Generated UUID: $uuid"
    }
    return $uuid
}

function Get-RandomMacAddress {
    param (
        [string]$macaddr = ""
    )
    if (-not $macaddr) {
        do {
            $bytes = New-Object byte[] 6
            $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
            $rng.GetBytes($bytes)
            $macaddr = ($bytes | ForEach-Object { "{0:X2}" -f $_ }) -join ":"
        } until ($macaddr -notin @("00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff", "ac:de:48:00:11:22"))
        Write-Host "Generated MAC address: $macaddr"
    }
    return $macaddr
}

function Get-CursorBasePath {
    $localAppData = $env:LOCALAPPDATA
    if (-not $localAppData) {
        Write-Error "LOCALAPPDATA not found"
        exit 1
    }
    $path = Join-Path -Path $localAppData -ChildPath "Programs\cursor\resources\app"
    if (-not (Test-Path $path)) {
        Write-Error "Cursor base path not found: $path"
        exit 1
    }
    return $path
}

function Get-JSPath {
    param (
        [string]$path = ""
    )
    if ($path) {
        $jsPath = Resolve-Path $path
    } else {
        $cursorBase = Get-CursorBasePath
        $jsPath = Join-Path -Path $cursorBase -ChildPath "out\main.js"
    }

    if (-not (Test-Path $jsPath)) {
        Write-Error "File not found: $jsPath"
        exit 1
    }
    return $jsPath
}

function Backup-File {
    param (
        [string]$path
    )
    Write-Host "Creating backup"
    $bakFile = "$path.bak"
    if (-not (Test-Path $bakFile)) {
        Copy-Item -Path $path -Destination $bakFile
        Write-Host "Backup created"
    } else {
        Write-Host "Backup exists"
    }
}

function Replace-Pattern {
    param (
        [byte[]]$data,
        [string]$pattern,
        [string]$replacement,
        [string]$probe
    )
    Write-Host "Replacing pattern"

    # Convert to string (System.Text.Encoding)
    $encoding = [System.Text.Encoding]::UTF8
    $content = $encoding.GetString($data)

    # Original pattern matches
    $matches = [regex]::Matches($content, $pattern, "Singleline")
    $count = $matches.Count

    # Probe for already patched
    $patchedMatches = [regex]::Matches($content, $probe, "Singleline")
    $patchedCount = $patchedMatches.Count

    if ($count -eq 0) {
        if ($patchedCount -gt 0) {
            Write-Host "Found already patched patterns"
        } else {
            Write-Warning "Pattern not found, SKIPPED!"
        }
        return $data
    }

    # Replace patched and original patterns
    $content = [regex]::Replace($content, $probe, $replacement, "Singleline")
    $content = [regex]::Replace($content, $pattern, $replacement, "Singleline")

    # Get new matches to verify replacement
    $newMatches = [regex]::Matches($content, [regex]::Escape($replacement), "Singleline")
    $replacedCount = $newMatches.Count

    if ($replacedCount -ne ($count + $patchedCount)) {
        Write-Warning "Patched $replacedCount/$count, failed $($count - $replacedCount + $patchedCount)"
    } else {
        Write-Host "Patching complete"
    }

    # Return as bytes
    return $encoding.GetBytes($content)
}

function Patch-Cursor {
    Write-Host "Starting Cursor patch..."

    $jsPath = Get-JSPath
    $fileContent = [System.IO.File]::ReadAllBytes($jsPath)

    # Apply patches
    $machineId = Get-RandomUUID
    $fileContent = Replace-Pattern -data $fileContent `
        -pattern '=.{0,50}timeout.{0,10}5e3.*?,' `
        -replacement "=/*csp1*/`"$machineId`"/*1csp*/," `
        -probe "=/\*csp1\*/.*?/\*1csp\*/,"

    $mac = Get-RandomMacAddress
    $fileContent = Replace-Pattern -data $fileContent `
        -pattern "(function .{0,50}\{).{0,300}Unable to retrieve mac address.*?(\})" `
        -replacement "\1return/*csp2*/`"$mac`"/*2csp*/;\2" `
        -probe "()return/\*csp2\*/.*?/\*2csp\*/;()"

    $sqm = ""
    $fileContent = Replace-Pattern -data $fileContent `
        -pattern 'return.{0,50}\.GetStringRegKey.*?HKEY_LOCAL_MACHINE.*?MachineId.*?\|\|.*?""' `
        -replacement "return/*csp3*/`"$sqm`"/*3csp*/" `
        -probe "return/\*csp3\*/.*?/\*3csp\*/"

    $devId = Get-RandomUUID
    $fileContent = Replace-Pattern -data $fileContent `
        -pattern "return.{0,50}vscode\/deviceid.*?getDeviceId\(\)" `
        -replacement "return/*csp4*/`"$devId`"/*4csp*/" `
        -probe "return/\*csp4\*/.*?/\*4csp\*/"

    # Backup and save
    Backup-File -path $jsPath

    try {
        [System.IO.File]::WriteAllBytes($jsPath, $fileContent)
        Write-Host "File saved successfully"
        Write-Host "OK"
    } catch {
        Write-Error "Permission denied: The file '$jsPath' is in use, please close it and try again"
        exit 1
    }
}

# Script start
Write-Host "Starting Cursor Patch..."
Patch-Cursor
Write-Host "Process completed!"
