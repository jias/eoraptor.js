module.exports = function(grunt) {


    grunt.initConfig({
        concat: {
            js: {
                options: {
                    separator: ';'
                },
                src: [
                    'javascript/*.js'
                ],
                dest: 'public/js/main.min.js'
            },
        },
        uglify: {
            options: {
                // mangle: false
            },
            js: {
                files: {
                    'build/eoraptor.min.js': ['src/eoraptor.js']
                }
            }
        },
        watch: {
            html: {
                files: ['*.html'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['*.js'],
                // tasks: ['concat:js', 'uglify:js'],
                options: {
                    livereload: true,
                }
            },
            css: {
                files: ['*.css'],
                // tasks: ['less:style'],
                options: {
                    livereload: true,
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('watch', ['watch']);
    grunt.registerTask('min', ['uglify']);

};