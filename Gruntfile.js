module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		watch: {
			scripts: {
				files: ['js/*.js', 'less/*.less', '*.html'],
				tasks: ['build'],
				options: {
					spawn: false
				}
			}
		},

		copy: {
			main: {
				files: [
					{expand: true, src: ['*.html'], dest: 'release/'},
					{expand: true, src: ['img/*'], dest: 'release/'},
					{expand: true, src: ['css/*.css'], dest: 'release/'},
					{expand: true, src: ['vendors/*'], dest: 'release/'},
					{expand: true, src: ['manifest.json'], dest: 'release/'},
					{expand: true, src: ['js/*.js'], dest: 'release/'}
				]
			}
		},

		less: {
			production: {
				options: {
					path: ['css']
				},
				files: {
					'release/css/popup.css':'less/popup.less'
				}
			}
		},

		/*uglify: {
			main: {
				files: [{
					expand: true,
					src: 'js/*.js',
					dest: 'release/'
				},
				{
					expand: true,
					src: 'vendors/*.js',
					dest: 'release/'
				}]
			}
		},*/

		compress: {
			main: {
				options: {
					archive: 'build/<%= pkg.short %><%= pkg.version %>.zip'
				},
				files: [
					{src: ['release/**'], dest: '/'}
				]
			},
			firefox: {
				options: {
					archive: 'build/<%= pkg.short %><%= pkg.version %>_firefox.zip'
				},
				files: [{
					src: ['**/*'],
					cwd: 'release/',
					expand: true
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['less']);
	grunt.registerTask('build', ['copy', 'less']);
	grunt.registerTask('pack', ['compress']);
	grunt.registerTask('release', ['copy', 'less', 'compress']);
};