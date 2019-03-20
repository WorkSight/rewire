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
  parcel build src/index.ts
  if [ ! -z $PUBLISH ];
  then
    yarn version --patch --no-git-tag-version
    cp package.json dist
    npm publish dist
  fi
  cd ..
done

# jq ".main |= \"index.js\" | .typings |=  \"index.js\" | .\"ts:main\" |=  \"ooga.js\"" package.json