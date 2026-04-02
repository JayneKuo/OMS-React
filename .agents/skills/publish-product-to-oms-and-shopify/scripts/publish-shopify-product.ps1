param(
  [Parameter(Mandatory = $true)]
  [string]$Shop,

  [Parameter(Mandatory = $true)]
  [string]$AccessToken,

  [Parameter(Mandatory = $true)]
  [string]$PayloadPath,

  [ValidateSet('POST', 'PUT')]
  [string]$Method = 'POST',

  [string]$ProductId
)

if (-not (Test-Path $PayloadPath)) {
  throw "Payload file not found: $PayloadPath"
}

$jsonText = Get-Content $PayloadPath -Raw -Encoding UTF8
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonText)

$headers = @{
  'X-Shopify-Access-Token' = $AccessToken
  'Content-Type' = 'application/json; charset=utf-8'
  'Accept' = 'application/json'
}

if ($Method -eq 'POST') {
  $uri = "https://$Shop/admin/api/2025-10/products.json"
}
elseif ($Method -eq 'PUT') {
  if (-not $ProductId) {
    throw "ProductId is required when Method=PUT"
  }
  $uri = "https://$Shop/admin/api/2025-10/products/$ProductId.json"
}

try {
  $resp = Invoke-WebRequest -Uri $uri -Headers $headers -Method $Method -Body $bodyBytes -UseBasicParsing
  [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::UTF8.GetBytes($resp.Content))
}
catch {
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $content = $reader.ReadToEnd()
    throw "Shopify request failed: $content"
  }
  throw
}
