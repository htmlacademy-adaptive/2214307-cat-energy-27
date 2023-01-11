import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import {deleteAsync} from 'del';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import htmlmin from 'gulp-htmlmin';
import webp from 'gulp-webp';


// Styles
export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
};

//minify html
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
};

//minify and rename js
const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

//Reload our browser
const reload = (done) => {
  browser.reload();
  done();
};

// delete our build
const clean = () => {
  return deleteAsync('build');
};

//Optimize img and create webp
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(squoosh())
  .pipe(webp())
  .pipe(gulp.dest('build/img'));
};

//copy image to build
const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(gulp.dest('build/img'))
};

//optimize svg
const svg = () =>
gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'));

    //create sprite
       const sprite = () => {
      return gulp.src('source/img/*.svg')
      .pipe(svgo())
      .pipe(svgstore({
      inlineSvg: true
      }))
      .pipe(rename('sprite.svg'))
      .pipe(gulp.dest('build/img'));
      }

// copy files to build
const copy = (done) => {
  gulp.src([
    'source/fonts/**/*.{woff2,woff}',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

export const build = gulp.series(
  clean, copy, copyImages,

  gulp.parallel(
styles, html, scripts, svg, sprite,
  ),
);

export default gulp.series(
  clean, copy, optimizeImages, copyImages,

  gulp.parallel(
styles, html, scripts, svg, sprite,
  ),

  gulp.series(
    server, watcher,
  )
);
