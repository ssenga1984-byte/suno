$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:5173/#/"
$port = 5173

function Test-LocalPort {
  param([int]$Port)

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $connect = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(500, $false)) {
      return $false
    }

    $client.EndConnect($connect)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Close()
  }
}

function Wait-ForDevServer {
  param([int]$Port)

  for ($i = 0; $i -lt 60; $i++) {
    if (Test-LocalPort -Port $Port) {
      return $true
    }

    Start-Sleep -Milliseconds 500
  }

  return $false
}

try {
  Set-Location -LiteralPath $siteRoot

  if (Test-LocalPort -Port $port) {
    Start-Process $url
    exit 0
  }

  $npmCommand = Get-Command npm.cmd -ErrorAction Stop

  if (-not (Test-Path -LiteralPath (Join-Path $siteRoot "node_modules"))) {
    Write-Host "node_modules not found. Running npm install..."
    & $npmCommand.Source install
  }

  $serverCommand = @"
Set-Location -LiteralPath '$siteRoot'
& '$($npmCommand.Source)' run dev -- --host 127.0.0.1
"@

  Start-Process powershell.exe -WorkingDirectory $siteRoot -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    $serverCommand
  )

  if (Wait-ForDevServer -Port $port) {
    Start-Process $url
    exit 0
  }

  Write-Host "Dev server window was opened, but port $port did not respond yet."
  Write-Host "When Vite finishes starting, open: $url"
}
catch {
  Write-Host ""
  Write-Host "JUON site dev launcher failed:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
}

Read-Host "Press Enter to close this launcher"
