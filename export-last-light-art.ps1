# Delivery encoding only: keep the generated full-resolution PNG originals untouched.
Add-Type -AssemblyName System.Drawing
$deliveryEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$deliveryParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$deliveryParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]87)
foreach ($artSource in Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'assets/art') -Filter 'last-light-*-v1.png') {
  $deliveryPath = [System.IO.Path]::ChangeExtension($artSource.FullName, '.jpg')
  if (Test-Path -LiteralPath $deliveryPath) { continue }
  $deliveryImage = [System.Drawing.Bitmap]::new($artSource.FullName)
  try { $deliveryImage.Save($deliveryPath, $deliveryEncoder, $deliveryParameters) } finally { $deliveryImage.Dispose() }
}
$deliveryParameters.Dispose()
Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'assets/art') -Filter 'last-light-*-v1.jpg' | Measure-Object -Property Length -Sum | Select-Object Count, Sum
