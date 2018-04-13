Remove-Item ./node_modules -r -Force
Remove-Item ./packages/*/node_modules -r -Force
Remove-Item ./packages/*/dist -r
Remove-Item ./.fusebox -r
Remove-Item ./build -r

dir npm-debug.log -r | foreach {rm $_}
dir yarn-error.log -r | foreach {rm $_}
