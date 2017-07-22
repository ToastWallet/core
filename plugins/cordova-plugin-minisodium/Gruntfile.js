module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jsvalidate: {
			options: {
				globals: {},
				esprimaOptions: {},
				verbose: true
			},
			src: ['www/MiniSodium.js'],
			tests: ['tests/**/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-jsvalidate');

	grunt.registerTask('default', ['jsvalidate']);

};
