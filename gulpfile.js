// Node modules
var fs = require('fs');

// Gulp and plugins
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    webServer = require('gulp-webserver'),
    gutil = require('gulp-util'),
    minifyCSS = require('gulp-minify-css'),
    gulpsync = require('gulp-sync')(gulp),
    browserSync = require('browser-sync').create(),
    proxy = require('http-proxy-middleware'),
    rename = require('gulp-rename'),
    pahtExists = require('path-exists'),
    htmlreplace = require('gulp-html-replace'),
    fs = require('fs'),
    path = require('path');

// WebServer
gulp.task('webserver', function() {
    var config = {
        "proxy": {
            "host": "http://test.winbaoxian.com/"
        },
        "host": {
            "port": 3000,
            "host": "127.0.0.1"
        }
    };
    browserSync.init({
        // middleware: [proxy_middleware],
        port: config.host.port,
        server: {
            baseDir: './src/'
        },
        index: './index.html',
        files: './src/**/*.*'
    });
});

gulp.task('css', function() {
    var cssList = ['./src/bower_modules/insurance-lib/src/css/pop.layer.css'];
    return gulp.src(cssList)
        .pipe(minifyCSS())
        .pipe(concat('gexian.css'))
        .pipe(rev())
        .pipe(gulp.dest("./dist/css"))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('./dist/rev/css'));
});
gulp.task('js', function() {
    var jsList = ['./src/bower_modules/insurance-lib/src/js/components/pop.layer.js'];
    return gulp.src(jsList)
        .pipe(uglify())
        .pipe(concat('gexian.js'))
        .pipe(rev())
        .pipe(gulp.dest("./dist/js"))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('./dist/rev/js'));
});

gulp.task('clean', function() {
    return gulp.src(['./dist', './**/.DS_Store'])
        .pipe(clean({
            force: true
        }));
});
gulp.task('rev', function() {
    return gulp.src(['./dist/rev/**/*.json', './src/product/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('./dist/html'));
});
gulp.task('replace', function() {
    return gulp.src('./dist/html/**/*.html')
        .pipe(replace(/\.\.\/\.\.\/css\//g, '//res.winbaoxian.com/legacy/gexian/css/'))
        .pipe(replace(/\.\.\/\.\.\/js\//g, '//res.winbaoxian.com/legacy/gexian/js/'))
        .pipe(replace(/\.\.\/js\//g, '//res.winbaoxian.com/legacy/gexian/js/'))
        .pipe(replace(/\.\.\/css\//g, '//res.winbaoxian.com/legacy/gexian/css/'))
        .pipe(replace(/\'\.\.\/\.\.\/json\/product\.json\'/g, 'productData.data.productJsonUrl'))
        .pipe(gulp.dest('./dist/html'));
});
gulp.task('html', function() {
    return gulp.src('./dist/**/*.html')
        .pipe(htmlreplace({
            'css': '../css/' + require('./dist/rev/css/rev-manifest.json')['gexian.css'],
            'js': '../js/' + require('./dist/rev/js/rev-manifest.json')['gexian.js']
        }))
        .pipe(gulp.dest('./dist/'));
});
