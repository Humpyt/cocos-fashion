# Emergency Recovery Script - PowerShell Version
# Deploys and runs the emergency recovery script on VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,

    [Parameter(Mandatory=$true)]
    [string]$VpsUser,

    [Parameter(Mandatory=$true)]
    [int]$VpsPort = 22,

    [Parameter(Mandatory=$true)]
    [string]$SshKeyPath
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  EMERGENCY WEBSITE RECOVERY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# VPS connection details
$remoteHost = $VpsHost
$remoteUser = $VpsUser
$remotePort = $VpsPort
$sshKey = $SshKeyPath

Write-Host "[INFO] Target VPS: $remoteUser@$remoteHost:$remotePort" -ForegroundColor Green
Write-Host "[INFO] SSH Key: $sshKey" -ForegroundColor Green
Write-Host ""

# Check if SCP and SSH are available
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue
$sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue

if (-not $scpAvailable -or -not $sshAvailable) {
    Write-Host "[ERROR] SSH/SCP not found. Please install OpenSSH or use Git Bash." -ForegroundColor Red
    exit 1
}

# Upload the recovery script
Write-Host "[1/3] Uploading emergency recovery script to VPS..." -ForegroundColor Yellow
$localScript = "deploy/hostinger/emergency-recovery.sh"
$remoteScript = "/tmp/emergency-recovery.sh"

$scpArgs = @(
    "-i", $sshKey,
    "-P", $remotePort.ToString(),
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    $localScript,
    "${remoteUser}@${remoteHost}:${remoteScript}"
)

$scpResult = & scp @scpArgs 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Script uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to upload script" -ForegroundColor Red
    Write-Host $scpResult
    exit 1
}
Write-Host ""

# Make script executable and run it
Write-Host "[2/3] Running recovery script on VPS..." -ForegroundColor Yellow
$sshArgs = @(
    "-i", $sshKey,
    "-p", $remotePort.ToString(),
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "${remoteUser}@${remoteHost}",
    "chmod +x $remoteScript && sudo $remoteScript"
)

$sshOutput = & ssh @sshArgs 2>&1
Write-Host $sshOutput
Write-Host ""

# Test the websites
Write-Host "[3/3] Testing websites..." -ForegroundColor Yellow
Write-Host ""

# Test Coco's Fashion
Write-Host "Testing: http://cocofashionbrands.com" -ForegroundColor Cyan
try {
    $cocoResponse = Invoke-WebRequest -Uri "http://$remoteHost" -UseBasicParsing -TimeoutSec 10
    if ($cocoResponse.StatusCode -in 200, 301, 302) {
        Write-Host "[SUCCESS] Coco's Fashion is responding (Status: $($cocoResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Unexpected status code: $($cocoResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Failed to reach Coco's Fashion: $_" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  RECOVERY COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please test in your browser:" -ForegroundColor Green
Write-Host "  - http://cocofashionbrands.com" -ForegroundColor White
Write-Host "  - http://eaglesrugbyug.com" -ForegroundColor White
Write-Host ""
Write-Host "If issues persist, SSH into VPS and check:" -ForegroundColor Yellow
Write-Host "  sudo tail -f /var/log/nginx/error.log" -ForegroundColor White
Write-Host "  pm2 logs" -ForegroundColor White
Write-Host "  docker logs eaglesrfc_api" -ForegroundColor White
Write-Host ""
