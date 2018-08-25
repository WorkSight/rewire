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
const { spawn } = require('child_process');
const {bumpVersion} = require('fuse-box/sparky');
const {ensureAbsolutePath} = require('fuse-box/Utils');

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
      ImageBase64Plugin({ useDefault: true }),
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
      json.typings    = './index.ts';
      json['ts:main'] = './index.ts';
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

async function clean(pkg) {
  await Sparky.src(`./packages/${pkg}/dist`).clean(`./packages/${pkg}/dist`).exec();
}

const modules = ['rewire-common', 'rewire-core', 'rewire-ui', 'rewire-grid', 'rewire-graphql'];

async function npmPublish(opts) {
  opts.tag = opts.tag || 'latest';

  return new Promise((resolve, reject) => {
    const cmd     = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
    const publish = spawn(cmd, ['publish', '--tag', opts.tag], {
      stdio: 'inherit',
      cwd: ensureAbsolutePath(opts.path),
    });
    publish.on('close', function(code) {
      if (code === 8) {
      	return reject('Error detected, waiting for changes...');
      }
      return resolve();
    });
  });
}

Sparky.task('dist', async(context) => {
  context.isProduction = true;
  for (const module of modules) {
    await build(context, module, ['es6', 'esnext']);
  }
});

Sparky.task('npmpublish', async() => {
  for (const module of modules) {
    await npmPublish({path: `./packages/${module}/dist`});
  }
});

async function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const publish = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: __dirname
    });
    publish.on('close', function(code) {
      if (code !== 0) {
        return reject('Error detected running command...');
      }
      return resolve();
    });
  });
}

Sparky.task('prepublish', async() => {
  let json;
  for (const module of modules) {
    json = await bumpVersion(`./packages/${module}/package.json`, {type: 'beta'});
  }
  let version = `v${json.version}`;
  // await run('git', ['commit', '-a', '-m', version]);
  // await run('git', ['tag', '-a', version, '-m', version]);
});

Sparky.task('clean', async() => {
  for (const module of modules) {
    await clean(module);
  }
});

Sparky.task('default', ['clean', 'dist'], () => { });

Sparky.task('publish', ['clean', 'prepublish', 'dist', 'npmpublish'], () => { });
Sparky.task('publish-only', ['npmpublish'], () => { });
Sparky.task('version', ['clean', 'prepublish'], () => { });
