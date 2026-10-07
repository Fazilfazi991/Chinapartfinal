param([string]$OutputPath = 'deliverables/china-parts-production-source.zip')
$ErrorActionPreference = 'Stop'
$cpsRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$cpsOutput = [IO.Path]::GetFullPath((Join-Path $cpsRoot $OutputPath))
$cpsDeliverables = [IO.Path]::GetFullPath((Join-Path $cpsRoot 'deliverables')) + [IO.Path]::DirectorySeparatorChar
if (-not $cpsOutput.StartsWith($cpsDeliverables, [StringComparison]::OrdinalIgnoreCase)) { throw 'Archive must stay within this project deliverables folder.' }
if (Test-Path -LiteralPath $cpsOutput) { throw 'Output already exists; provide a new archive filename.' }
$cpsFiles = & git -C $cpsRoot -c core.quotepath=false ls-files --cached --others --exclude-standard
if ($LASTEXITCODE -ne 0) { throw 'Source inventory failed.' }
$cpsFiles = $cpsFiles | Sort-Object -Unique | Where-Object {
  $_ -notmatch '^(?:evidence|deliverables|reference-demo|\.local-data|\.test-pg|\.tools|\.git|\.next(?:-dev)?|node_modules)/' -and
  ($_ -notmatch '(?:^|/)\.env' -or $_ -eq '.env.example') -and
  $_ -notmatch '\.(?:log|pid|tsbuildinfo)$'
}
$cpsArchive = [IO.Compression.ZipFile]::Open($cpsOutput, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($cpsRelative in $cpsFiles) {
    $cpsAbsolute = [IO.Path]::GetFullPath((Join-Path $cpsRoot $cpsRelative))
    if (-not $cpsAbsolute.StartsWith($cpsRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Source escaped the project boundary.' }
    if (-not (Test-Path -LiteralPath $cpsAbsolute -PathType Leaf)) { throw ('Source is not a regular file: ' + $cpsRelative) }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($cpsArchive,$cpsAbsolute,$cpsRelative.Replace('\','/'),[IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $cpsArchive.Dispose() }
Write-Output ('Packaged ' + $cpsFiles.Count + ' source files: ' + $cpsOutput)
