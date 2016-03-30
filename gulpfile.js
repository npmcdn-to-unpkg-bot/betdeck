var argv = require('yargs').argv;

var gulp = require('gulp');
var gutil = require('gulp-util'); // Log output messages

var addsrc = require('gulp-add-src'); // Add another file into pipe
var concat = require('gulp-concat'); // Combine files into one
var changed = require('gulp-changed');
var rename = require('gulp-rename');  // Rename
var clean = require('gulp-clean');  // Deletes files

var inject = require("gulp-inject"); // Inject dependencies into index.html
var minifyHTML = require('gulp-minify-html'); // Minify HTML
var templateCache = require('gulp-angular-templatecache'); // Cache HTML templates

var sass = require('gulp-sass'); // Compile SASS into CSS
var minifyCss = require('gulp-minify-css'); // Minify CSS
var autoprefix = require('gulp-autoprefixer'); // Add missing vendor prefixes

var uglify = require('gulp-uglify'); // Uglify javascript files
var ngAnnotate = require('gulp-ng-annotate'); // Minifies angular code
var stripDebug = require('gulp-strip-debug'); // Remove console and debugger statements

//var imagemin = require('gulp-imagemin');  // Minify images

var connect = require('gulp-connect');  // Sets up server

var size = require('gulp-size'); // Log gulp stats
var jshint = require('gulp-jshint'); // Verify javascript syntax
var bower = require('bower');
var sh = require('shelljs');

var base = "./www/";

var src = {
  html: ['./src/app/*.html', 
        './src/app/**/*.html', 
        './src/app/**/**/*.html', 
        './src/app/**/**/**/*.html' 
        ],
  sass: ['./scss/*.scss'],
  css: [],
  img: ['./src/assets/img/*', './src/assets/img/**/*'],
  fonts: ['./src/assets/fonts/*.ttf', './src/lib/ionic/fonts/*.*'],
  js: ['./src/app/*.js', 
      './src/app/**/*.js', 
      './src/app/**/**/*.js', 
      './src/app/**/**/**/*.js'
      ],
  vendor: {
    js: []
  }
};

var dest = {
  index: base + "index.html",
  html: base + 'app',
  css: base + 'assets/css',
  js: base + 'js',
  img: base + 'assets/img',
  fonts: base + 'assets/fonts'
};

if(argv.dev)
  gulp.task('default', ['connect-dev', 'sass-watch', 'watch']);
else if(argv.prod)
  gulp.task('default', ['connect-prod', 'watch']);
else
  gulp.task('default', ['htmlpage', 'js', 'sass', 'copy-fonts', 'imagemin']);

// Inject dependencies
gulp.task('inject', function(){

});

// Copy all required files
gulp.task('copy-fonts', function(){
  gulp.src(src.fonts)
    .pipe(gulp.dest(dest.fonts));
});

// minify new or changed HTML pages
gulp.task('htmlpage', function() {
  gulp.src(src.html)  
    .pipe(size())
    //.pipe(changed(dest.html))
    .pipe(minifyHTML({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe(size())
    .pipe(gulp.dest(dest.html))
    .on('end', function(){
      gutil.log(gutil.colors.cyan("HTML Minification complete!"));
    });
});

gulp.task('cacheHtml', function(){
  gulp.src(src.html)
    .pipe(minifyHTML({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe(templateCache())
    .pipe(gulp.dest(dest.js))
    .on('end', function(){
      gutil.log(gutil.colors.cyan("Template caching complete!"));
    });
});

// minify css task
gulp.task('sass', function() {
  gulp.src(src.sass)
    .pipe(sass())
    .pipe(size())
    .pipe(autoprefix('last 2 versions'))
    .pipe(gulp.dest('./src/assets/css'))
    .pipe(addsrc(src.css))
    .pipe(concat('app.css'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(size())
    .pipe(gulp.dest(dest.css))
    .on('end', function(){
      gutil.log(gutil.colors.cyan("CSS Minification complete!"));
    });
});

// uglify task
gulp.task('js', function() {
  // main app js file
  gulp.src(src.js)
  .pipe(concat("app.js"))
  .pipe(size())
  .pipe(ngAnnotate())
  .pipe(stripDebug())
  .pipe(uglify())
  .pipe(size())
  .pipe(gulp.dest(dest.js))
  .on('end', function(){
    gutil.log(gutil.colors.cyan("App JS Uglification complete!"));
  });

  // create 1 vendor.js file from all vendor plugin code
  /*
  gulp.src(src.vendor.js)
  .pipe(concat("vendor.js"))
  .pipe(size())
  .pipe(ngAnnotate())
  .pipe(uglify())
  .pipe(size())
  .pipe(gulp.dest(dest.js))
  .on('end', function(){
    gutil.log(gutil.colors.cyan("Vendor JS Uglification complete!"));
  });
  */
});

// minify new images

gulp.task('imagemin', function() {
  gulp.src(src.img)
    .pipe(size())
    //.pipe(imagemin())
    .pipe(size())
    .pipe(gulp.dest(dest.img))
    .on('end', function(){
      gutil.log(gutil.colors.cyan("Image minification complete!"));
    });
});

// JS hint task
gulp.task('jshint', function() {
  gulp.src(src.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .on('end', function(){
      gutil.log(gutil.colors.cyan("JSHint complete!"));
    });
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('connect-dev', function() {
  connect.server({
    root: 'src',
    livereload: false
  });
});

gulp.task('connect-prod', function() {
  connect.server({
    root: 'www',
    livereload: true
  });
});


gulp.task('html-watch', function () {
  gulp.src(src.html)
    .pipe(connect.reload());
});

gulp.task('sass-watch', function () {
  gulp.watch(src.sass_modules, ['sass']);
});

gulp.task('watch', function () {
  gulp.watch(src.html, ['htmlpage']);
  gulp.watch(src.sass_modules, ['sass']);
  gulp.watch(src.css, ['sass']);
  gulp.watch(src.js, ['js']);
  gulp.watch(src.vedor, ['js']);
  gulp.watch(src.img, ['imagemin']);
  gulp.watch(src.fonts, ['copy']);
});

// Stats and Things
gulp.task('stats', function () {
  gulp.src('./www/**/*')
  .pipe(size())
  .pipe(gulp.dest('./www'));
});
