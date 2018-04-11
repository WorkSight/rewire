const {
  FuseBox,
  JSONPlugin,
  CSSPlugin,
  EnvPlugin,
  SassPlugin,
  QuantumPlugin,
  Sparky,
  ImageBase64Plugin
} = require('fuse-box');
let isProduction   = false;
let target         = '';
let home           = '';
let instructions   = '> **/**.{ts,tsx}';
let fuse;

Sparky.task('config', () => {
  fuse = FuseBox.init({
    target:               target,
    homeDir:              home,
    useTypescriptCompiler:true,
    cache:                false,
    hash:                 false,
    sourceMaps:           {app: true, vendor: false},
    output:               `${home}/$name.js`,
    plugins:                         [
      JSONPlugin(),
      EnvPlugin({ NODE_ENV: isProduction ? 'production' : 'development' }),
      CSSPlugin(),
      [SassPlugin(), CSSPlugin()],
      ImageBase64Plugin(),
      isProduction && QuantumPlugin({target: 'browser', uglify: {keep_fnames: true}, treeshake: true})
    ],
    experimentalFeatures:true
  });
  fuse.bundle(bundleName).instructions(instructions);
});

Sparky.task('clean', () => {
  return Sparky.src('dist/').clean('dist/');
});

let pkg = '';
Sparky.task('copy-src', () => Sparky.src('./**', { base: `./packages/${pkg}/src` }).dest(`dist/${pkg}/`));
Sparky.task('copy-pkg', () => Sparky.src(`./${pkg}/package.json`, { base: './packages' }).dest('dist/'));
Sparky.task('copy-md',  () => Sparky.src(`./${pkg}/*.md`, { base: './packages' }).dest('dist/'));

Sparky.task('copy', async() => {
  pkg = 'rewire-common';
  await Sparky.exec('copy-src', 'copy-pkg');
  pkg = 'rewire-core';
  await Sparky.exec('copy-src', 'copy-pkg', 'copy-md');
  pkg = 'rewire-ui';
  await Sparky.exec('copy-src', 'copy-pkg');
  pkg = 'rewire-grid';
  await Sparky.exec('copy-src', 'copy-pkg');
  pkg = 'rewire-graphql';
  await Sparky.exec('copy-src', 'copy-pkg');
});

async function build(_pkg, _target, _isProduction = true) {
  isProduction = _isProduction;
  bundleName   = `${_target}-lib`;
  pkg          = _pkg;
  home         = `./dist/${pkg}`;
  target       = `browser@${_target}`;
  await Sparky.resolve('config');
  await fuse.run();
}

Sparky.task('dist', async() => {
  await build('rewire-common', 'es6');
  await build('rewire-common', 'esnext');
  await build('rewire-core', 'es6');
  await build('rewire-core', 'esnext');
  await build('rewire-ui', 'es6');
  await build('rewire-ui', 'esnext');
  await build('rewire-grid', 'es6');
  await build('rewire-grid', 'esnext');
  await build('rewire-graphql', 'es6');
  await build('rewire-graphql', 'esnext');
});

Sparky.task('default', ['clean', 'copy', 'dist'], () => { });
