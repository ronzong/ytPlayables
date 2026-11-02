param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][string]$Game)
$ErrorActionPreference='Stop'
# 只做交付尺寸导出；构图/内容来自 imagegen，原图保留不覆盖。
Add-Type -AssemblyName System.Drawing
if($Game -notmatch '^[A-Za-z0-9_-]+$'){throw '游戏目录名不合法'}
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\marketing'))
$dir=Join-Path $root $Game
[IO.Directory]::CreateDirectory($dir)|Out-Null
$dest=Join-Path $dir 'ad-540x756.png'
if(Test-Path -LiteralPath $dest){throw ('广告图已存在，避免覆盖：'+$dest)}
$image=[System.Drawing.Image]::FromFile([IO.Path]::GetFullPath($Source))
$bitmap=[System.Drawing.Bitmap]::new(540,756)
$graphics=[System.Drawing.Graphics]::FromImage($bitmap)
try{
 $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $scale=[Math]::Max(540.0/$image.Width,756.0/$image.Height)
 $cropWidth=540.0/$scale;$cropHeight=756.0/$scale
 $sourceRect=[System.Drawing.RectangleF]::new(($image.Width-$cropWidth)/2,($image.Height-$cropHeight)/2,$cropWidth,$cropHeight)
 $graphics.DrawImage($image,[System.Drawing.RectangleF]::new(0,0,540,756),$sourceRect,[System.Drawing.GraphicsUnit]::Pixel)
 $bitmap.Save($dest,[System.Drawing.Imaging.ImageFormat]::Png)
 Write-Output ($Game+'：540x756 → '+$dest)
}finally{$graphics.Dispose();$bitmap.Dispose();$image.Dispose()}
