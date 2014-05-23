module.exports = function(grunt) {

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
        options: {
            banner: '/*! <%=pkg.name %> v<%=pkg.version %> <%=grunt.template.today("yyyy-mm-dd")%> <%=pkg.author.name%> <%=pkg.homepage%> */\n'
        },
        eoraptor: {
            files: {
                'build/eoraptor.min.js': ['build/eoraptor.js']
            }
        }
    },
    replace: {
        eoraptor: {
            src: ['src/eoraptor.js'],
            dest: 'build/eoraptor.js',
            replacements: [{
                from: '#VERSION#',
                to: '<%=pkg.version%>'
            }, {
                from: '#UPDATE#',
                to: '<%=grunt.template.today("yyyy-mm-dd") %>'
            }, {
                from: '#DESCRIPTION#',
                to: '<%=pkg.description%>'
            }]
        }
    },
    watch: {
        js: {
            files: [
                'src/eoraptor.js', 
                'test/test.html', 
                'test/test.js',
                'test/dev.html', 
                'test/dev.js'
            ],
            // tasks: ['concat:js', 'uglify:js'],
            options: {
                livereload: true,
            }
        }
    },
    eoraptor_jst: {
        cmd: {
            options: {
                namespace: 'tpl',
                module: false,
                ext: 'tpl.html'
            },
            files: {
                'tpl/tpl.js': ['tpl/*.tpl.html']
            },
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-text-replace');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('eoraptor-jst');

grunt.registerTask('default', ['replace','uglify']);
grunt.registerTask('tpl', ['eoraptor_jst']);

};
