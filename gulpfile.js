'use strict'

const gulp = require('gulp')

require('./test/setup/spawn-daemons')
require('./test/factory/factory-tasks')

gulp.task('test:node:before', ['factory:start'])
gulp.task('test:node:after', ['factory:stop'])
gulp.task('test:browser:before', ['factory:start'])
gulp.task('test:browser:after', ['factory:stop'])

require('aegir/gulp')(gulp)
