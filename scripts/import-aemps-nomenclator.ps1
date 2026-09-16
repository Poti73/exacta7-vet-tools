[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
  [string]$SourceDirectory,
  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{4}-\d{2}-\d{2}$')]
  [string]$RetrievedAt,
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$ArchivePath,
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$LegalNoticePath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Load-Xml([string]$Path) {
  $xml = New-Object System.Xml.XmlDocument
  $xml.PreserveWhitespace = $false
  $xml.Load($Path)
  return $xml
}

function ChildText([System.Xml.XmlNode]$Node, [string]$Name) {
  $child = $Node.SelectSingleNode("*[local-name()='$Name']")
  if ($null -eq $child) { return $null }
  return $child.InnerText.Trim()
}

function ChildTexts([System.Xml.XmlNode]$Node, [string]$Path) {
  return @($Node.SelectNodes($Path) | ForEach-Object { $_.InnerText.Trim() } | Where-Object { $_ })
}

function New-Lookup([string]$File, [string]$EntryName, [string]$KeyName, [string]$ValueName) {
  $lookup = @{}
  $xml = Load-Xml (Join-Path $SourceDirectory $File)
  foreach ($entry in $xml.SelectNodes("/*/*[local-name()='$EntryName']")) {
    $key = ChildText $entry $KeyName
    $value = ChildText $entry $ValueName
    if ($key -and $value) { $lookup[$key] = $value }
  }
  return $lookup
}

$actives = New-Lookup 'DICCIONARIO_PRINCIPIOS_ACTIVOS.xml' 'principiosactivos' 'nroprincipioactivo' 'principioactivo'
$species = New-Lookup 'DICCIONARIO_ESPECIES_DESTINO.xml' 'especiesdestino' 'cod_espdes' 'des_espdes'
$routes = New-Lookup 'DICCIONARIO_VIAS_ADMINISTRACION.xml' 'viasadministracion' 'codigoviaadministracion' 'viaadministracion'
$units = New-Lookup 'DICCIONARIO_UNIDAD_COMPOSICION.xml' 'unidadescomposicion' 'codigounidadcomposicion' 'unidadcomposicion'
$fullPath = Join-Path $SourceDirectory 'PrescripcionVET.xml'
$full = Load-Xml $fullPath
$sourceDate = ChildText ($full.DocumentElement.SelectSingleNode("*[local-name()='header']")) 'listprescriptiondate'
if (-not $sourceDate) { throw 'Missing AEMPS listprescriptiondate.' }

$archiveHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $ArchivePath).Hash.ToLowerInvariant()
$legalHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $LegalNoticePath).Hash.ToLowerInvariant()
$source = [ordered]@{
  id = 'aemps-cima-vet-nomenclator'
  publisher = 'Agencia Española de Medicamentos y Productos Sanitarios (AEMPS)'
  source_url = 'https://listadomedicamentos.aemps.gob.es/prescripcionVET.zip'
  legal_notice_url = 'https://listadomedicamentos.aemps.gob.es/Aviso_Legal_Nomenclato_vet.pdf'
  documentation_url = 'https://cimavet.aemps.es/cimavet/publico/nomenclator.html'
  retrieved_at = $RetrievedAt
  source_data_date = $sourceDate
  archive_sha256 = $archiveHash
  legal_notice_sha256 = $legalHash
  license_status = 'USE_CONDITIONS_RECORDED_MANUAL_LEGAL_REVIEW_REQUIRED'
}

$products = @{}
$presentations = @()
foreach ($record in $full.SelectNodes("/*/*[local-name()='prescription']")) {
  $registration = ChildText $record 'nro_definitivo'
  $nationalCode = ChildText $record 'cod_nacion'
  $name = ChildText $record 'nombre_med'
  if (-not $registration -or -not $nationalCode -or -not $name) { throw "Malformed AEMPS record: registration=$registration nationalCode=$nationalCode" }
  $productId = "aemps-product:$registration"
  $activeIds = ChildTexts $record "*[local-name()='formafarmaceutica']/*[local-name()='principiosactivos']/*[local-name()='cod_principio_activo']"
  $activeSubstances = @($activeIds | ForEach-Object { if ($actives.ContainsKey($_)) { $actives[$_] } else { "UNRESOLVED_AEMPS_ACTIVE:$_" } })
  $speciesIds = ChildTexts $record "*[local-name()='especiesdestino']/*[local-name()='cod_espdes']"
  $targetSpecies = @($speciesIds | ForEach-Object { if ($species.ContainsKey($_)) { $species[$_] } else { "UNRESOLVED_AEMPS_SPECIES:$_" } })
  $routeIds = ChildTexts $record "*[local-name()='formafarmaceutica']/*[local-name()='viasadministracion']/*[local-name()='cod_via_admin']"
  $administrationRoutes = @($routeIds | ForEach-Object { if ($routes.ContainsKey($_)) { $routes[$_] } else { "UNRESOLVED_AEMPS_ROUTE:$_" } })
  $ingredients = @()
  foreach ($ingredient in $record.SelectNodes("*[local-name()='formafarmaceutica']/*[local-name()='principiosactivos']")) {
    $activeId = ChildText $ingredient 'cod_principio_activo'
    $unitId = ChildText $ingredient 'cod_unidad_cantidad'
    $ingredients += [ordered]@{
      aemps_active_id = $activeId
      name = if ($actives.ContainsKey($activeId)) { $actives[$activeId] } else { $null }
      amount = ChildText $ingredient 'cantidad'
      unit = if ($units.ContainsKey($unitId)) { $units[$unitId] } else { $null }
    }
  }
  if (-not $products.ContainsKey($productId)) {
    $products[$productId] = [ordered]@{
      id = $productId
      aemps_registration_number = $registration
      name = $name
      atcvet = @(ChildTexts $record "*[local-name()='atcvet']/*[local-name()='cod_atcvet']")
      first_authorization_date = ChildText $record 'fec_primera_aut'
      registration_status_code = ChildText $record 'cod_estado_registro_medicamento'
      administrative_status_code = ChildText $record 'cod_situacion_administrativa_medicamento'
      marketing_status = ChildText $record 'comercializado'
      prescription_required = ChildText $record 'prescripcion'
      veterinary_exclusive_administration = ChildText $record 'administracion_exclusiva_veterinario'
      veterinarian_control_administration = ChildText $record 'administracion_bajo_control_veterinario'
      technical_sheet_url = ChildText $record 'ficha_tecnica'
      leaflet_url = ChildText $record 'prospecto'
      target_species = $targetSpecies
      routes = $administrationRoutes
      active_substances = $activeSubstances
      ingredients = $ingredients
      source = $source
      publication = [ordered]@{ state = 'PENDING_REVIEW'; reviewer = $null; reviewed_at = $null; version = $sourceDate }
    }
  }
  $packageUnitId = ChildText $record 'unidad_contenido_total_envase'
  $presentations += [ordered]@{
    id = "aemps-presentation:$nationalCode"
    aemps_national_code = $nationalCode
    product_id = $productId
    label = ChildText $record 'formato'
    presentation_registration_status_code = ChildText $record 'cod_estado_registro_formato'
    package_content = ChildText $record 'contenido_total_envase'
    package_content_unit = if ($packageUnitId -and $units.ContainsKey($packageUnitId)) { $units[$packageUnitId] } else { $null }
    source = $source
    publication = [ordered]@{ state = 'PENDING_REVIEW'; reviewer = $null; reviewed_at = $null; version = $sourceDate }
  }
}

$manifest = [ordered]@{
  schema_version = 1
  import_id = "aemps-$sourceDate-$archiveHash"
  imported_at = (Get-Date).ToUniversalTime().ToString('o')
  source = $source
  counts = [ordered]@{ products = $products.Count; presentations = $presentations.Count; active_substances = $actives.Count; species = $species.Count; routes = $routes.Count }
  publication_guard = 'PENDING_REVIEW_ONLY'
  data = [ordered]@{ products = @($products.Values | Sort-Object aemps_registration_number); presentations = @($presentations | Sort-Object aemps_national_code) }
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$destination = Join-Path $OutputDirectory "aemps-nomenclator-$sourceDate.json"
$temporaryDestination = "$destination.tmp"
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $temporaryDestination -Encoding utf8NoBOM
Move-Item -LiteralPath $temporaryDestination -Destination $destination -Force
Write-Output "Imported $($products.Count) products and $($presentations.Count) presentations to $destination"
