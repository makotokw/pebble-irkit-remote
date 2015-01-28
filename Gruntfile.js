/*jshint node:true*/
'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  require('date-utils');

  var path = require('path');

  // watchapp info
  var appInfo = grunt.file.readJSON('appinfo.json');
  appInfo.baseName = path.basename(__dirname);
  appInfo.buildDate = new Date();

  // Configurable paths for the application
  var appConfig = {
    srcPath: 'src',
    buildPath: 'build',
    packagesPath: 'packages'
  };
  var webConfig = {
    srcPath: 'web',
    distPath: 'dist'
  };

  grunt.initConfig({
    // Project settings
    appInfo: appInfo,
    appConfig: appConfig,
    webConfig: webConfig,

    // common
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= appConfig.srcPath %>/js/{,*/}/*.js',
        '<%= webConfig.srcPath %>/scripts/{,*/}*.js'
      ],
      pebble: [
        '<%= appConfig.srcPath %>/js/{,*/}/*.js'
      ],
      web: [
        '<%= webConfig.srcPath %>/scripts/{,*/}*.js'
      ]
    },
    watch: {
      pebblejs: {
        files: ['<%= appConfig.srcPath %>/js/{,*/}/*.js'],
        tasks: ['jshint:pebble']
      },
      webjs: {
        files: ['<%= webConfig.srcPath %>/scripts/{,*/}*.js'],
        tasks: ['jshint:web'],
        options: {
          livereload: true
        }
      },
      sass: {
        files: ['<%= webConfig.srcPath %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['sass:web']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= webConfig.srcPath %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css'
        ]
      }
    },
    clean: {
      app: 'build',
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= webConfig.distPath %>/*',
            '!<%= webConfig.distPath %>/.git*'
          ]
        }]
      },
      web: '.tmp'
    },
    copy: {
      pbw: {
        files: [{
          src: '<%= appConfig.buildPath %>/<%= appInfo.baseName %>.pbw',
          dest: '<%= appConfig.packagesPath %>/<%= appInfo.baseName %>-<%= appInfo.versionLabel %>.pbw'
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= webConfig.srcPath %>',
          dest: '<%= webConfig.distPath %>',
          src: [
            '*.{ico,png,txt}',
            '{,*/}*.html'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '.',
          src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
          dest: '<%= webConfig.distPath %>'
        }]
      }
    },

    // web app
    sass: {
      options: {
        loadPath: 'bower_components'
      },
      web: {
        files: [{
          expand: true,
          cwd: '<%= webConfig.srcPath %>/styles',
          src: ['*.{scss,sass}'],
          dest: '.tmp/styles',
          ext: '.css'
        }]
      }
    },
    useminPrepare: {
      options: {
        dest: '<%= webConfig.distPath %>'
      },
      html: '<%= webConfig.srcPath %>/index.html'
    },
    usemin: {
      options: {
        assetsDirs: [
          '<%= webConfig.distPath %>',
          '<%= webConfig.distPath %>/images',
          '<%= webConfig.distPath %>/styles'
        ]
      },
      html: ['<%= webConfig.distPath %>/{,*/}*.html'],
      css: ['<%= webConfig.distPath %>/styles/{,*/}*.css']
    },
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        hostname: '0.0.0.0'
      },
      development: {
        options: {
          open: true,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(webConfig.srcPath)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%= webConfig.distPath %>',
          livereload: false
        }
      }
    },

    // watch app
    exec: {
      pebbleBuild: {
        cmd: 'pebble build'
      },
      pebbleDebugBuild: {
        cmd: 'pebble build --debug'
      },
      pebbleInstall: {
        cmd: 'pebble install'
      },
      pebbleLogs: {
        cmd: 'pebble logs'
      }
    }
  });

  grunt.registerTask('settingsDebug', [
    'sass:web',
    'connect:development',
    'watch'
  ]);

  grunt.registerTask('settingsBuild', [
    'clean:dist',
    'useminPrepare',
    'sass:web',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'copy:dist',
    'usemin'
  ]);

  grunt.registerTask('pebbleDebugBuild', [
    'exec:pebbleDebugBuild'
  ]);

  grunt.registerTask('pebbleInstall', [
    'exec:pebbleInstall'
  ]);

  grunt.registerTask('pebbleDebugInstall', [
    'exec:pebbleDebugBuild',
    'exec:pebbleInstall'
  ]);
  grunt.registerTask('pebbleLogs', [
    'exec:pebbleLogs'
  ]);

  grunt.registerTask('build', [
    'exec:pebbleBuild',
    'copy:pbw',
    'settingsBuild',
    'connect:dist'
  ]);

  grunt.registerTask('default', ['build']);
};
