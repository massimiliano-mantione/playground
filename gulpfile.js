var gulp = require('gulp');
var mjs = require('gulp-mjs');
var browserify = require('gulp-browserify');
var nodemon = require('gulp-nodemon');
var Combine = require('stream-combiner');

var paths = {
  client: ['client.mjs'],
  server: ['server.mjs'],
  couch:  ['couch.mjs']
};

function withErrorHandling() {
  var combined = Combine.apply(null, arguments);
//  combined.on('error', function(err) { console.warn(err.message); });
  return combined;
}

gulp.task('client', function() {
  return withErrorHandling(
    gulp.src(paths.client),
    mjs(),
    browserify({debug: true}),
    gulp.dest('.'));
});

gulp.task('server', function() {
  return withErrorHandling(
    gulp.src(paths.server),
    mjs({debug: true}),
    gulp.dest('.'));
});

gulp.task('couch', function() {
  return withErrorHandling(
    gulp.src(paths.couch),
    mjs({debug: true}),
    gulp.dest('.'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.client, ['client']);
  gulp.watch(paths.server, ['server']);
  gulp.watch(paths.couch, ['couch']);
  nodemon({script: 'server.js'});
});

gulp.task('default', ['client', 'server', 'couch']);
