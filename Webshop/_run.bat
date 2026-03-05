@echo off
REM =============================================
REM HTTP server for Vite dist folder (supports public/ assets)
REM =============================================

SETLOCAL
SET PORT=8080
SET FOLDER=%~dp0dist

echo Serving folder: %FOLDER% on http://localhost:%PORT%

powershell -NoProfile -Command ^
$Listener = [System.Net.HttpListener]::new(); ^
$Listener.Prefixes.Add('http://localhost:%PORT%/'); ^
$Listener.Start(); ^
Write-Host 'Server running... Press Ctrl+C to stop.'; ^
while ($Listener.IsListening) { ^
    $Context = $Listener.GetContext(); ^
    $Request = $Context.Request; ^
    $Response = $Context.Response; ^
    $UrlPath = $Request.Url.AbsolutePath.TrimStart('/'); ^
    if ([string]::IsNullOrEmpty($UrlPath)) { $UrlPath = 'index.html' } ^
    $File = Join-Path '%FOLDER%' $UrlPath; ^
    if (-Not (Test-Path $File)) { $File = Join-Path '%FOLDER%' 'index.html' } ^
    try { ^
        $Bytes = [System.IO.File]::ReadAllBytes($File); ^
        $Response.ContentType = 'text/html'; ^
        if ($File -like '*.js') { $Response.ContentType = 'text/javascript' } ^
        elseif ($File -like '*.css') { $Response.ContentType = 'text/css' } ^
        elseif ($File -like '*.wasm') { $Response.ContentType = 'application/wasm' } ^
        elseif ($File -like '*.png') { $Response.ContentType = 'image/png' } ^
        elseif ($File -like '*.jpg') { $Response.ContentType = 'image/jpeg' } ^
        elseif ($File -like '*.jpeg') { $Response.ContentType = 'image/jpeg' } ^
        elseif ($File -like '*.gif') { $Response.ContentType = 'image/gif' } ^
        elseif ($File -like '*.svg') { $Response.ContentType = 'image/svg+xml' } ^
        elseif ($File -like '*.webp') { $Response.ContentType = 'image/webp' } ^
        $Response.OutputStream.Write($Bytes, 0, $Bytes.Length); ^
    } catch { ^
        Write-Host 'Error serving: ' + $File; ^
    } ^
    $Response.Close(); ^
}
ENDLOCAL