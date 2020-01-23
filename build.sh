#!/bin/bash
modules=("rewire-common" "rewire-core" "rewire-ui" "rewire-grid" "rewire-graphql");

while getopts ":cp" arg "$@"; do
  case $arg in
    "c")
      echo 'doing a complete rebuild!'
      CLEAN="true"
    ;;
    "p")
      echo 'publishing to npm!'
      PUBLISH="true"
    ;;
    *)
      errormsg="Unknown parameter or option error with option - $OPTARG"
    ;;
  esac
done

if [ ! -z $CLEAN ];
then
  rm -rf .cache
  rm -rf dist
  rm -rf node_modules
  rm -rf build
  rm yarn.lock
  yarn
fi

if [ ! -z $PUBLISH ];
then
  yarn version --patch --no-git-tag-version
fi
cd packages

for module in "${modules[@]}"
do
  cd $module

  rm -rf dist
  if [ ! -z $CLEAN ];
  then
    rm -rf .cache
    rm -rf node_modules
    rm -rf build
  fi
  echo building $module
  if [ ! -z $PUBLISH ];
  then
    yarn version --patch --no-git-tag-version
  fi

  mkdir dist
  mkdir dist/src
  cp -r src/* dist/src
  jq ".main |= \"src/index.js\" | del(.alias)" package.json > dist/package.json
  cp ../../tsconfig-build.json dist/tsconfig.json
  cp ../../tslint.json dist/tslint.json
  cd dist
  ../../../node_modules/typescript/bin/tsc
  rm tsconfig.json
  rm tslint.json

  if [ ! -z $PUBLISH ];
  then
    npm publish --force
    sleep 3s
  fi
  cd ../..
done
