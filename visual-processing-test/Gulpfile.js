var fs = require('fs')
   ,gulp = require('gulp')
   ,babel = require('gulp-babel')
   ,concat = require('gulp-concat');
 


gulp.task('babel', function(){
	var react = babel({
		presets: ['react']
	}).on('error', function(err){
    	console.log(err);
    });

    gulp.src(['./js/src/use-strict.js', './js/src/classes/*.js', './js/src/main.js'])
        .pipe(react)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./js/dist'));
});

gulp.task('images', function(){
	var images = {};
	var types = ['templates', 'stimuli'];
	var categories = ['people', 'animals'];
	for(var i in types){
		var type = types[i];
		for(var j in categories){
			var category = categories[j];
			var files = fs.readdirSync('res/images/'+type+'/'+category);
			for(var k in files){
				var file = files[k];
				if(!images[type]) images[type] = {};
				if(!images[type][category]) images[type][category] = [];
				images[type][category].push(file);
			}
		}
	}
	fs.writeFile('./js/dist/images.js', 'var VPT_IMAGES = '+JSON.stringify(images), function(err){
		if(err) throw err;
	}); 
});

gulp.task('watch', function(){
	gulp.watch('./js/src/app.js', ['babel']);
});
