# synthesize-audio.ps1 — Windows PowerShell TTS synthesis using edge-tts
# Usage: .\scripts\synthesize-audio.ps1 [--force] [--voice zh-CN-YunxiNeural]

param(
    [switch]$Force,
    [string]$Voice = "zh-CN-YunxiNeural"
)

$Root = Split-Path -Parent $PSScriptRoot
$SegmentsFile = Join-Path $Root "audio-segments.json"
$OutDir = Join-Path $Root "public/audio"
$VoiceBin = $null

# Find edge-tts binary
$candidates = @(
    "edge-tts",
    "edge-tts.exe",
    "$env:APPDATA/Python/Python312/Scripts/edge-tts.exe",
    "$env:LOCALAPPDATA/Programs/Python/Python312/Scripts/edge-tts.exe"
)
foreach ($c in $candidates) {
    if (Get-Command $c -ErrorAction SilentlyContinue) {
        $VoiceBin = $c
        break
    }
}

if (-not $VoiceBin) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $VoiceBin = "py:edge_tts"
    }
}

if (-not $VoiceBin) {
    Write-Error "edge-tts not found. Install: pip install edge-tts"
    exit 1
}

if (-not (Test-Path $SegmentsFile)) {
    Write-Error "$SegmentsFile not found. Run: npm run extract-narrations"
    exit 1
}

$segments = Get-Content $SegmentsFile -Raw -Encoding UTF8 | ConvertFrom-Json
$total = $segments.Count
$synthesized = 0
$skipped = 0
$failed = 0

Write-Host "Synthesizing $total segments with voice: $Voice" -ForegroundColor Cyan
Write-Host ""

for ($i = 0; $i -lt $total; $i++) {
    $seg = $segments[$i]
    $chapter = $seg.chapter
    $step = $seg.step
    $text = $seg.text
    $out = Join-Path $OutDir "$chapter/$step.mp3"
    $label = "$chapter/$step.mp3"

    if ((Test-Path $out) -and -not $Force) {
        $skipped++
        Write-Host "[$($i+1)/$total] $label".PadRight(45) -NoNewline
        Write-Host " skip (exists)" -ForegroundColor DarkGray
        continue
    }

    $dir = Split-Path -Parent $out
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        if ($VoiceBin -eq "py:edge_tts") {
            py -m edge_tts --text $text --voice $Voice --write-media $out 2>&1 | Out-Null
        } else {
            & $VoiceBin --text $text --voice $Voice --write-media $out 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $out)) {
            $sw.Stop()
            $synthesized++
            Write-Host "[$($i+1)/$total] $label".PadRight(45) -NoNewline
            Write-Host " OK $([math]::Round($sw.Elapsed.TotalSeconds,1))s" -ForegroundColor Green
        } else {
            throw "edge-tts exited with code $LASTEXITCODE"
        }
    } catch {
        $sw.Stop()
        $failed++
        Write-Host "[$($i+1)/$total] $label".PadRight(45) -NoNewline
        Write-Host " FAILED: $_" -ForegroundColor Red
    }
}

Write-Host ""
$fg = if ($failed -eq 0) { "Green" } else { "Red" }
Write-Host "Done - synthesized $synthesized, skipped $skipped, failed $failed" -ForegroundColor $fg
exit $(if ($failed -gt 0) { 1 } else { 0 })
