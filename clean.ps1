Remove-Item ./node_modules -r -Force
<<<<<<< HEAD
Remove-Item ./packages/*/node_modules -r -Force
Remove-Item ./packages/*/dist -r
=======
>>>>>>> 413c6e174bc2cfb59ec03d517d684f275413b773
Remove-Item ./.fusebox -r
Remove-Item ./build -r

dir npm-debug.log -r | foreach {rm $_}
dir yarn-error.log -r | foreach {rm $_}
<<<<<<< HEAD
=======
dir ./packages/dist -r | foreach {rm $_ -r}
>>>>>>> 413c6e174bc2cfb59ec03d517d684f275413b773
