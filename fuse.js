const {
  FuseBox,
  JSONPlugin,
  CSSPlugin,
  EnvPlugin,
  SassPlugin,
  QuantumPlugin,
  WebIndexPlugin,
  ImageBase64Plugin
}                  = require('fuse-box');
const parseArgs    = require('minimist');
const rimraf       = require('rimraf');
const path         = require('path');
const fs           = require('fs');
const compression  = require('compression');
const options      = parseArgs(process.argv.slice(2));
const isProduction = (!!options.production || !!options.p);

const fuse = FuseBox.init({
  target:               'browser@esnext',
  homeDir:              './',
  useTypescriptCompiler:true,
  cache:                true,
  hash:                 false,
  sourceMaps:           {app: true, vendor: false},
  output:               'build/$name.js',
  alias: {
    'rewire-core':      '~/packages/rewire-core/src',
    'rewire-ui':        '~/packages/rewire-ui/src',
    'rewire-graphql':   '~/packages/rewire-graphql/src',
    'rewire-common':    '~/packages/rewire-common/src',
    'rewire-grid':      '~/packages/rewire-grid/src'
  },
  plugins:                         [
    JSONPlugin(),
    EnvPlugin({ NODE_ENV: isProduction ? 'production' : 'development' }),
    CSSPlugin(),
    [SassPlugin(), CSSPlugin()],
    WebIndexPlugin({title: 'WorkSight .Next',  path: './', template: 'examples/src/index.html', target: 'index.html' }),
    ImageBase64Plugin(),
    isProduction && QuantumPlugin({target: 'browser', uglify: {keep_fnames: true}, treeshake: true})
  ],
  experimentalFeatures:            true
});

rimraf.sync('build');

function runDevelopmentServer() {
  fuse.dev({root: 'build/', port: 3000}, (server) => {
    const app = server.httpServer.app;
    app.use(compression());
    const dist = path.resolve('./build');

    function sendFile(req, res) {
      const p = path.join(dist, req.url);
      if (fs.existsSync(p)) {
        return res.sendFile(p);
      }
      return res.sendStatus(200);
    }

    app.get('*.js', function(req, res) {
      sendFile(req, res);
    });
    app.get('*.js.map', function(req, res) {
      sendFile(req, res);
    });
    app.get('*', function(req, res) {
      res.sendFile(path.join(dist, 'index.html'));
    });
  });
}

if (isProduction) {
  console.log('Production build detected!');
  if (!!options.s) {
    runDevelopmentServer();
  }
  fuse.bundle('vendor').instructions('~ examples/src/main.ts');
  fuse.bundle('app').instructions('!> [examples/src/main.ts]');
} else {
  runDevelopmentServer();
  fuse.bundle('vendor').instructions('~ examples/src/main.ts');
  fuse.bundle('app').watch('packages/**|examples/src/**').instructions('!> [examples/src/main.ts]').hmr();
}

fuse.run();
