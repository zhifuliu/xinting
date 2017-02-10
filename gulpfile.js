// Node modules
var fs = require('fs'),
    path = require('path');

// Gulp and plugins
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    md5 = require('gulp-md5'),
    rev = require('gulp-rev'),
    minifyCSS = require('gulp-minify-css'),
    revCollector = require('gulp-rev-collector'),
    jeditor = require('gulp-json-editor'),
    gulpsync = require('gulp-sync')(gulp),
    browserSync = require('browser-sync').create(),
    proxy = require('http-proxy-middleware'),
    rename = require('gulp-rename'),
    pahtExists = require('path-exists'),
    htmlreplace = require('gulp-html-replace'),
    sass = require('gulp-sass');

// WebServer
gulp.task('webserver', ['auto-sass'], function() {
    var config = {
        "proxy": {
            "host": "http://test.winbaoxian.com/"
        },
        "host": {
            "port": 1314,
            "host": "127.0.0.1"
        }
    };
    var proxy_middleware = proxy(['/api/**'], {
        target: config.proxy.host,
        changeOrigin: true
    });
    browserSync.init({
        open:'external',
        middleware: [proxy_middleware],
        port: config.host.port,
        server: {
            baseDir: './src/'
        },
        host: config.host.host,
        index: './index.html',
        files: './src/**/*.*'
    });
});

gulp.task('auto-sass', ['sass'], function() {
    gulp.watch('./src/css/*.scss', ['sass']);
});
gulp.task('sass', function() {
    return gulp.src('./src/css/*.scss')
        .pipe(
            sass({

            }).on('error', sass.logError)
        )
        .pipe(gulp.dest('./src/css'));
});
gulp.task('css', function() {
    var cssList = ['./src/css/styles.css'];
    return gulp.src(cssList)
        .pipe(minifyCSS())
        .pipe(concat('group_management.css'))
        .pipe(rev())
        .pipe(gulp.dest("./dist/css"))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('./dist/rev/css'));
});

gulp.task('js', function() {
    var jsList = ['./src/bower_modules/jquery/dist/jquery.js', './src/bower_modules/underscore/underscore.js', './src/bower_modules/vue/dist/vue.js', './src/bower_modules/moment/moment.js'];
    return gulp.src(jsList)
        .pipe(uglify())
        .pipe(concat('group_management.js'))
        .pipe(rev())
        .pipe(gulp.dest("./dist/js"))
        .pipe(rev.manifest({
            merge: true
        }))
        .pipe(gulp.dest('./dist/rev/js'));
});

gulp.task('clean', function() {
    return gulp.src(['./dist', './**/.DS_Store', './src/css/*.css'])
        .pipe(clean({
            force: true
        }));
});
gulp.task('rev', function() {
    return gulp.src(['./dist/rev/**/*.json', './src/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('./dist'));
});
gulp.task('replace', function() {
    return gulp.src('./dist/html/**/*.html')
        .pipe(replace(/\.\.\/\.\.\/css\//g, '//res.winbaoxian.com/legacy/group_management/css/'))
        .pipe(replace(/\.\.\/\.\.\/js\//g, '//res.winbaoxian.com/legacy/group_management/js/'))
        .pipe(replace(/\.\.\/js\//g, '//res.winbaoxian.com/legacy/group_management/js/'))
        .pipe(replace(/\.\.\/css\//g, '//res.winbaoxian.com/legacy/group_management/css/'))
        .pipe(replace(/\'\.\.\/\.\.\/json\/product\.json\'/g, 'productData.data.productJsonUrl'))
        .pipe(gulp.dest('./dist/html'));
});
gulp.task('html', function() {
    return gulp.src('./dist/**/*.html')
        .pipe(htmlreplace({
            'css': './css/' + require('./dist/rev/css/rev-manifest.json')['group_management.css'],
            'js': './js/' + require('./dist/rev/js/rev-manifest.json')['group_management.js']
        }))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('default', gulpsync.sync(['build:dist']));
gulp.task('build:dist', gulpsync.sync(['clean', 'js', 'sass', 'css', 'rev', 'html']));
