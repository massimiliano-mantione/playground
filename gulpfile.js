var gulp = require('gulp');
var mjs = require('gulp-mjs');
var browserify = require('gulp-browserify');
var nodemon = require('gulp-nodemon');

var paths = {
  client: ['client.mjs'],
  server: ['server.mjs']
};

gulp.task('client', function() {
  return gulp.src(paths.client)
    .pipe(mjs())
    .pipe(browserify({debug: true}))
    .pipe(gulp.dest('.'));
});

gulp.task('server', function() {
  return gulp.src(paths.server)
    .pipe(mjs({debug: true}))
    .pipe(gulp.dest('.'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.client, ['client']);
  gulp.watch(paths.server, ['server']);
  nodemon({script: 'server.js'});
});

gulp.task('default', ['client', 'server']);
