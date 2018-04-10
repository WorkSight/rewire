param(
  [Parameter(
    Position = 0
  )]
  [Switch]
  # Build server and client, then package it up for deploy
  $CleanOnly
)

Remove-Item ./node_modules -r -Force
Remove-Item ./.fusebox -r
Remove-Item ./build -r
Remove-Item ./dist -r
Remove-Item './rewire.7z'

dir npm-debug.log -r | foreach {rm $_}
dir yarn-error.log -r | foreach {rm $_}

if ($CleanOnly) {
  return;
}

function create-7zip($aDirectory, $aZipfile) {
  [string]$pathToZipExe = "$($Env:ProgramFiles)\7-Zip\7z.exe";
  # If 32bit version doesn't exist, use 64bit version
  if (!(Test-Path -Path $pathToZipExe)) {
    [string]$pathToZipExe = "$($Env:ProgramW6432)\7-Zip\7z.exe";
  }
  [Array]$arguments = "a", "-t7z", $aZipfile, $aDirectory, "-r", "-mx9";
  & $pathToZipExe $arguments;
  if ($LASTEXITCODE) {
    throw "Error packaging rewire"
  }
}

create-7zip "./" "rewire"
