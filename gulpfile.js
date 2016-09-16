var gulp = require('gulp');
var ts = require('gulp-typescript');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var server = require('gulp-express');
var exec = require('child_process').exec;
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');


// *** EXPRESS ***
gulp.task('build-express', function () {
    var tsResult = gulp.src('express/**/*.ts')
        .pipe(ts());

    return tsResult.js.pipe(gulp.dest('build_express'));
});

gulp.task('copy_templates', function () {
    return gulp.src('express/**/*.handlebars')
        .pipe(gulp.dest('build_express'));
});

gulp.task('watch-express', ['build-express'], function () {
    gulp.watch('express/**/*', [ 'build-express', 'copy_templates', 'restart-server' ]);
});


// *** REACT ***

gulp.task('build-react', function(cb) {
    webpack(webpackConfig).run(function(err, stats) {
        console.log(stats.toString('minimal'));
        cb();
    });
});

gulp.task('watch-react', function(cb) {
    webpack(webpackConfig).watch({}, function(err, stats) {
        console.log(stats.toString('minimal'));

        // restart server to use new files
        restartServer();
    });
});

// *** SASS ***

gulp.task('build-style', function(cb) {
    del.sync([ 'css/*' ]);
    return gulp
        .src('sass/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('css'));
})

gulp.task('watch-style', ['build-style'], function() {
    gulp.watch('sass/**/*.scss', [ 'build-style' ]);
});


// *** Now all together! ***

gulp.task('build', ['build-style', 'build-express', 'build-react', 'copy_templates']);

gulp.task('serve', ['build'], function () {
    return server.run(['build_express/app.js']);
});

gulp.task('restart-server', function() {
    restartServer();
})

gulp.task('watch', ['watch-express', 'watch-react', 'watch-style']);

gulp.task('default', ['serve', 'watch']);
