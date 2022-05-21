const gulp = require('gulp'),
      sass = require('gulp-sass')(require('sass')),
      sourcemaps = require('gulp-sourcemaps'),
      autoprefixer = require('gulp-autoprefixer'),
      git = require('gulp-git'),
      moment = require('moment'),
      sassdoc = require('sassdoc');

const sass_src = ['./scss/**/*.sass', './scss/**/*.scss', '!./scss/docs/**/*.scss'];
const sass_dst = './css';
const sass_opt = {
        errLogToConsole: true,
        outputStyle: 'expanded'
      };

function copy() {
  return gulp
  .src('input/*.js')
  .pipe(gulp.dest('output/'));
}

function git_commit_auto(){
  var commitMessage = moment().format('hh:mm:ss on dddd D-MMM-yyyy');
  console.log('Commiting code at' + commitMessage );
  return gulp
  .src('./')
  .pipe(git.add())
  .pipe(git.commit(commitMessage));
}

function saas_compile() {
  var sassdoc_options = {
    dest: 'scss/docs',
    verbose: true,
    display: {
      access: ['public', 'private'],
      alias: true,
      watermark: false,
    }
  };

  return gulp
  .src(sass_src)
  // .pipe(sassdoc(sassdoc_options));
  .pipe(sass(sass_opt).on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(autoprefixer())
  .pipe(gulp.dest(sass_dst));
}

function sass_docs() {
  var options = {
    dest: 'scss/docs',
    verbose: true,
    display: {
      access: ['public', 'private'],
      alias: true,
      watermark: false,
    }
  };
  var stream = sassdoc(options);

  gulp.src(sass_src)
    .pipe(stream)
    .on('end', function () {
      console.log('End of parsing phase');
    });

  return stream.promise.then(function () {
    console.log('End of documentation process');
  });
}

function watcher() {
  // You can use a single task
  // watch('src/*.css', css);
  // Or a composed task
  gulp.watch(sass_src, gulp.series(saas_compile, sass_docs, git_commit_auto ))
  .on('change', function(path, event) {
    console.log('File ' + path + ' was changed. running tasks...');
  });
}

exports.default = gulp.series(saas_compile, sass_docs, git_commit_auto, watcher);
exports.watch = watcher;