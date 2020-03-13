const {
  src, task, dest, series, parallel,
} = require('gulp');
const path = require('path');
const camelCase = require('camelcase');
const browserify = require('browserify');
const fs = require('fs');
const clean = require('gulp-clean');
const babelify = require('babelify');
const stream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const watch = require('gulp-watch');
const rev = require('gulp-rev');
const uglify = require('gulp-uglify');
const through = require('through2');
const stylus = require('gulp-stylus');
const {transform} = require('babel-core');
const minify = require('html-minifier').minify;
let gitVersion = '';
try {
  const gitHead = fs.readFileSync('.git/HEAD', 'utf-8').trim();
  // eslint-disable-next-line prefer-destructuring
  gitVersion = gitHead.split('/')[2];
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('no git version');
}

if (!gitVersion) {
  try {
    gitVersion = cp.execSync(lastTagCommand, { cwd: '.' }).toString().replace(/\s/g, '');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('no git tag');
  }
}

task('clean', () => src([path.join(__dirname, '/app/public/dist'), path.join(__dirname, '/app/public/static/data/rev-manifest.json')], {
  read: false,
  allowEmpty: true
})
  .pipe(clean(
    {force: true},
  )));

async function css() {
  const cssPath = path.join(__dirname, 'node_modules/BlockChain-ui/static/css/common.styl');
  src(cssPath)
    .pipe(stylus({}))
    .pipe(dest(path.join(__dirname, 'app/dist/static/index')))
}

async function js() {
  const pagePath = path.join(__dirname, '/app/public/static/pages/');
  const paths = fs.readdirSync(pagePath);
  paths.forEach((item) => {
    const fileName = item.replace('.js', '');
    browserify({
      entries: path.join(pagePath, item),
      debug: true,
    })
      .transform(babelify.configure({
        presets: ['@babel/preset-env'],
      }))
      .bundle()
      .pipe(stream(`${camelCase(fileName)}.js`))
      .pipe(buffer())
      .pipe(dest(path.join(__dirname, '/app/public/dist')))
      .pipe(slove());
  });
}

const pages = path.join(__dirname, '/app/view/template/modules/**');
const modules = path.join(__dirname, 'app/view/src/modules/*.js');

const watchFile = () => watch([pages, modules],
  {}, series(buildTemplate));

function slove() {
  return through.obj((file, enc, cb) => {
    const fileName = file.relative;
    let manifest = {};
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '/app/public/static/data/rev-manifest.json')), 'utf-8');
    } catch (e) {

    }
    manifest[fileName] = fileName;
    fs.writeFileSync(path.join(__dirname, '/app/public/static/data/rev-manifest.json'), JSON.stringify(manifest));
    cb();
  });
}

async function buildJS() {
  const modulesPath = path.join(__dirname, '/app/view/src/modules/');
  const modulesPaths = fs.readdirSync(modulesPath);
  modulesPaths.forEach((item) => {
    const pagePath = path.join(modulesPath, item);
    const paths = fs.readdirSync(pagePath);
    paths.forEach((filePath) => {
      const fileName = filePath.replace('.js', '');
      browserify({
        entries: path.join(pagePath, filePath),
      })
        .transform(babelify)
        .bundle()
        .pipe(stream(`${camelCase(fileName)}.js`))
        .pipe(buffer())
        //  .pipe(uglify())
        //.pipe(rev())
        .pipe(dest(path.join(__dirname, '/app/dist/static/index')))
      /*  .pipe(rev.manifest({
          path: path.join(__dirname, '/app/public/static/data/rev-manifest.json'),
          merge: true,
        }))
        .pipe(dest(path.join(__dirname, '')));*/
    });
  });

}

function compassFiles(paths, templatePath, outputPath) {
  paths.forEach((item) => {
    const intoPath = path.join(outputPath, item);
    const filePath = path.join(templatePath, item);
    if (fs.statSync(filePath).isDirectory()) {
      if (!fs.existsSync(intoPath)) {
        fs.mkdirSync(intoPath);
      }
      const dirs = fs.readdirSync(filePath);
      compassFiles(dirs, filePath, intoPath);
    } else {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (item.indexOf('index') === -1) {
        const scriptStart = content.indexOf('<script>') + 8;
        const scriptEnd = content.indexOf('</script>');
        const scriptContent = content.substring(scriptStart, scriptEnd);
        content = content.replace(scriptContent, transform(scriptContent, {
          minified: true,
          comments: false,
        }).code);
        content = minify(content, {
          minifyCSS: true,
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          html5: true,
          processConditionalComments: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
          trimCustomFragments: true,
          useShortDoctype: true,
        });
      }else{
        const JSPath = path.join(__dirname, './node_modules/BlockChain-ui/static/js/html-init.js');
        const inlineJs = fs.readFileSync(JSPath, 'utf-8');
        const utilsJS = fs.readFileSync(path.join(__dirname, './node_modules/BlockChain-ui/lib/utils.js'), 'utf-8');
        const dialogJS = fs.readFileSync(path.join(__dirname, 'app/view/src/modules/dialog.js'), 'utf-8');
        const script = transform((inlineJs + utilsJS + dialogJS), {
          minified: true,
          comments: false,
        }).code;
        content = content.replace('<script inline-html></script>', `<script>window.evn = "${process.env.NODE_ENV}";window.sysVersion = "${gitVersion}";window.updateDate="${new Date()}"; ${script}</script>`);
      }
      fs.writeFileSync(intoPath, content);
    }
  });
}

async function buildTemplate() {
  const templatePath = path.join(__dirname, 'app/view/template');
  const outputPath = path.join(__dirname, 'app/build/template');
  const dirs = fs.readdirSync(templatePath);
  compassFiles(dirs, templatePath, outputPath);
};


/*exports.dev = parallel(js, watchFile);

exports.build = parallel('clean', buildJS);*/

exports.test = parallel(buildTemplate);
exports.dev = parallel(buildTemplate, watchFile);
exports.build = parallel(buildJS);
