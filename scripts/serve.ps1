$ErrorActionPreference = 'Stop'

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$prefix = 'http://127.0.0.1:8080/'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

Write-Output 'Starting local site'

try {
    $listener.Start()
    Write-Output "Local site ready at $prefix"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response

        try {
            $relativePath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($relativePath)) {
                $relativePath = 'index.html'
            }

            $relativePath = $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
            if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                $response.ContentType = 'text/plain; charset=utf-8'
            }
            elseif (Test-Path -LiteralPath $filePath -PathType Leaf) {
                $body = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = switch ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant()) {
                    '.html' { 'text/html; charset=utf-8' }
                    '.css' { 'text/css; charset=utf-8' }
                    '.js' { 'text/javascript; charset=utf-8' }
                    '.json' { 'application/json; charset=utf-8' }
                    '.svg' { 'image/svg+xml' }
                    '.png' { 'image/png' }
                    '.jpg' { 'image/jpeg' }
                    '.jpeg' { 'image/jpeg' }
                    '.webp' { 'image/webp' }
                    default { 'application/octet-stream' }
                }
            }
            else {
                $response.StatusCode = 404
                $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
                $response.ContentType = 'text/plain; charset=utf-8'
            }

            $response.ContentLength64 = $body.Length
            if ($context.Request.HttpMethod -ne 'HEAD') {
                $response.OutputStream.Write($body, 0, $body.Length)
            }
        }
        finally {
            $response.Close()
        }
    }
}
finally {
    $listener.Close()
}