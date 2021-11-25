var gulp        = require('gulp');
var del         = require("del");

gulp.task("clean", () =>  {
    return del([ "bot/*", "update-commands.*", "index.*" ])
});