param(
  [Parameter(
    Position = 0
  )]
  [String]
  # Build server and client, then package it up for deploy
  $version
)

function hasChanges() {
  $ooga = git status --porcelain
  if ($ooga.length -gt 0) {
    echo "has changes"
    return 1
  }
  return 0
}

if(hasChanges) {
  echo "you must commit all of your changes before setting the version"
  exit -1
}

function setVersion($packageFile) {
  $fileContents = Get-Content -Raw $packageFile
  $package =  [Newtonsoft.Json.Linq.JObject]::Parse($fileContents)
  $package.version = $version
  $package.toString() | Set-Content $packageFile
}

function updateAllVersions() {
  setVersion './package.json'
  dir packages/**/*.json | foreach {
    setVersion $_
  }
  git add -A
  git commit -m $version
  git tag -a $version -m $version
}

updateAllVersions
echo "finished updating package.json projects to $version"