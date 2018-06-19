const gulp = require('gulp');
const pug = require('gulp-pug');

gulp.task('pug', () => {
    return gulp.src(['./views/*.pug', '!./views/_*.pug'])
               .pipe(pug({
                   pretty: true
               }))
               .pipe(gulp.dest('./public/'));
});
