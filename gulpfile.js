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

task('clean', () => src([path.join(__dirname, '/app/public/dist'), path.join(__dirname, '/app/public/static/data/rev-manifest.json')], { read: false, allowEmpty: true })
  .pipe(clean(
    { force: true },
  )));

async function css(){
  const cssPath = path.join(__dirname, 'node_modules/BlockChain-ui/static/css/common.styl');
  src(cssPath)
    .pipe(stylus({

    }))
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

const pages = path.join(__dirname, 'app/public/static/pages/*.js');
const modules = path.join(__dirname, 'app/public/static/js/modules/*.js');

const watchFile = () => watch([pages, modules],
  {
  }, series(js));

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
  const pagePath = path.join(__dirname, '/app/public/static/pages/');
  const paths = fs.readdirSync(pagePath);
  paths.forEach((item) => {
    const fileName = item.replace('.js', '');
    browserify({
      entries: path.join(pagePath, item),
    })
      .transform(babelify.configure({
        presets: ['@babel/preset-env'],
      }))
      .bundle()
      .pipe(stream(`${camelCase(fileName)}.js`))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(rev())
      .pipe(dest(path.join(__dirname, '/app/public/dist')))
      .pipe(rev.manifest({
        path: path.join(__dirname, '/app/public/static/data/rev-manifest.json'),
        merge: true,
      }))
      .pipe(dest(path.join(__dirname, '')));
  });
}

/*exports.dev = parallel(js, watchFile);

exports.build = parallel('clean', buildJS);*/

exports.test = parallel(css);
