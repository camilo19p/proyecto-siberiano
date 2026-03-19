$body = @{
  prestamo = 0
  items = @(
    @{ productId = "1"; quedaron = 1 },
    @{ productId = "2"; quedaron = 0 }
  )
} | ConvertTo-Json

Write-Host "Testing POST /api/inventario with body:"
Write-Host $body
Write-Host ""

try {
  $response = Invoke-WebRequest -Uri "http://localhost:3001/api/inventario" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
  
  Write-Host "✅ SUCCESS - Status: $($response.StatusCode)"
  Write-Host "Response:"
  $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
} catch {
  Write-Host "❌ ERROR: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    Write-Host "Response: $($_.Exception.Response.Content)"
  }
}
