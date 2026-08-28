param(
    [string]$Image = "uidesired:uplary",
    [string]$Registry = ""
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $Root

Write-Host "Building $Image from infrastructure/docker/Dockerfile.uplary"
docker build -f infrastructure/docker/Dockerfile.uplary -t $Image .

if ($Registry) {
    $Remote = "$Registry/uidesired:uplary"
    docker tag $Image $Remote
    Write-Host "Pushing $Remote"
    docker push $Remote
    Write-Host "Uplary Custom Docker image: $Remote"
    Write-Host "Container port: 8080"
} else {
    Write-Host "Built $Image. Tag and push to a registry Uplary can pull, for example:"
    Write-Host "  docker tag $Image YOUR_DOCKERHUB_USER/uidesired:uplary"
    Write-Host "  docker push YOUR_DOCKERHUB_USER/uidesired:uplary"
}
