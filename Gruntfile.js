module.exports = function (grunt) {
    grunt.initConfig({
            appConfig: grunt.file.readJSON('bower.json') || {},
            less: {
                dist: {
                    files: [
                        {
                            expand: true,
                            cwd: "src/less/",
                            src: ["*.less"],
                            dest: "dist/",
                            ext: ".css"
                        }
                    ]
                }
            },
            cssmin: {
                options: {
                    advanced: false,
                    rebase: false
                },
                dist: {
                    files: [
                        {
                            expand: true,
                            cwd: "dist/",
                            src: ["!*.min.css", "*.css"],
                            dest: "dist/",
                            ext: ".min.css"
                        }
                    ]
                }

            },
            uglify: {
                main: {
                    options: {
                        banner: '<%= banner %>',
                        compress: {
                            drop_console: true
                        }
                    },
                    files: {
                        'dist/angular-image-edit.min.js': ['dist/angular-image-edit.js']
                    }
                }
            },
            autoprefixer: {
                options: {
                    browsers: ['last 5 versions', 'Safari >= 5', 'iOS >= 5', 'Android >= 2', 'ie >= 9', 'opera >= 12', 'Firefox >= 20', 'Chrome >= 20']
                },
                dist: {
                    expand: true,
                    flatten: true,
                    src: 'dist/*.css',
                    dest: 'dist/'
                }
            },
            banner: '/*! <%= appConfig.name %> - version <%= appConfig.version %> - ' +
            '<%= grunt.template.today("dd-mm-yyyy") %>\n' +
            ' * <%= appConfig.description %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= appConfig.authors %> \n'+
            ' * Licensed under the MIT\n*/\n',
            usebanner: {
                dist: {
                    options: {
                        position: 'top',
                        banner: '<%= banner %>'
                    },
                    files: {
                        src: ['dist/angular-image-edit.js']
                    }
                }
            },

        }
    );

    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['usebanner', 'less', 'autoprefixer', 'uglify', 'cssmin']);
};
