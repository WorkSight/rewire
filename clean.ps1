Remove-Item ./node_modules -r -Force
Remove-Item ./.fusebox -r
Remove-Item ./build -r

dir npm-debug.log -r | foreach {rm $_}
dir yarn-error.log -r | foreach {rm $_}
dir ./packages/dist -r | foreach {rm $_ -r}
