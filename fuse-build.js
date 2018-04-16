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

const instructions = '> [index.ts]';
let fuse;

Sparky.task('config', (context) => {
  fuse = FuseBox.init({
    globals:              { default: '*' }, // we need to expore index in our bundles
    target:               context.target,
    homeDir:              context.home,
    useTypescriptCompiler:true,
    cache:                false,
    hash:                 false,
    // sourceMaps:           {[context.bundleName]: true},
    tsConfig:             'tsconfig-build.json',
    output:               `${context.home}/$name.js`,
    plugins:                         [
      JSONPlugin(),
      EnvPlugin({ NODE_ENV: context.isProduction ? 'production' : 'development' }),
      CSSPlugin(),
      [SassPlugin(), CSSPlugin()],
      ImageBase64Plugin(),
      context.isProduction && QuantumPlugin({
        target: 'npm',
        containedAPI: true,
        ensureES5: false,
        removeExportsInterop: true,
        uglify: {keep_fnames: true},
        treeshake: true,
        bakeApiIntoBundle: context.bundleName
      })
    ],
    experimentalFeatures:true
  });
  fuse.bundle(context.bundleName).instructions(instructions);
});

Sparky.task('copy-src', (context) => Sparky.src('./**', { base: `./packages/${context.pkg}/src`}).dest(`./packages/${context.pkg}/dist/`));
Sparky.task('copy-pkg', (context) => Sparky.src('./package.json', { base: `./packages/${context.pkg}` }).dest(`./packages/${context.pkg}/dist/`));
Sparky.task('copy-md',  (context) => Sparky.src('./*.md', { base: `./packages/${context.pkg}` }).dest(`./packages/${context.pkg}/dist/`));

async function build(context, pkg, targets) {
  context.pkg        = pkg;
  await Sparky.exec('copy-src', 'copy-pkg', 'copy-md');
  await Sparky.src(`./packages/${context.pkg}/dist/*.json`).file('package.json', (file) => {
    file.json(json => {
      json['ts:main'] = './index.ts';
      json.typings    = './index.ts';
    });
    file.save();
  }).exec();
  for (const target of targets) {
    context.bundleName = `${target}-lib`;
    context.home       = `./packages/${pkg}/dist/`;
    context.target     = `browser@${target}`;
    await Sparky.resolve('config');
    await fuse.run();
  }
}

Sparky.task('clean-package', (context) => {
  return Sparky.src(`./packages/${context.pkg}/dist`).clean(`./packages/${context.pkg}/dist`);
});

async function clean(context, pkg) {
  context.pkg = pkg;
  await Sparky.exec('clean-package');
}

Sparky.task('dist', async(context) => {
  context.isProduction = true;
  await build(context, 'rewire-common', ['es6', 'esnext']);
  await build(context, 'rewire-core', ['es6', 'esnext']);
  await build(context, 'rewire-ui', ['es6', 'esnext']);
  await build(context, 'rewire-grid', ['es6', 'esnext']);
  await build(context, 'rewire-graphql', ['es6', 'esnext']);
});

Sparky.task('clean', async(context) => {
  await clean(context, 'rewire-common');
  await clean(context, 'rewire-core');
  await clean(context, 'rewire-ui');
  await clean(context, 'rewire-grid');
  await clean(context, 'rewire-graphql');
});

Sparky.task('default', ['clean', 'dist'], () => { });
