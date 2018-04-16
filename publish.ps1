pushd

node .\fuse-build.js

cd .\packages\rewire-common\dist
echo $PWD
npm publish

cd ..\..\rewire-core\dist
echo $PWD
npm publish

cd ..\..\rewire-ui\dist
echo $PWD
npm publish

cd ..\..\rewire-graphql\dist
echo $PWD
npm publish

cd ..\..\rewire-grid\dist
echo $PWD
npm publish

popd
