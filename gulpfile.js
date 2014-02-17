var gulp = require('gulp');
var mjs = require('gulp-mjs');
var browserify = require('gulp-browserify');

var paths = {
  client: ['client.mjs']
};

gulp.task('client', function() {
  return gulp.src(paths.client)
    .pipe(mjs())
    .pipe(browserify({debug: true}))
    .pipe(gulp.dest('build'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.client, ['client']);
});

gulp.task('default', ['client']);
