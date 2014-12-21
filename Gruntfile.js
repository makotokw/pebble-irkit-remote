'use strict';
module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths for the application
  var appConfig = {
  };

  grunt.initConfig({
    // Project settings
    app: appConfig,
    exec: {
      pebble_build: {
        cmd: 'pebble build'
      },
      pebble_install: {
        cmd: 'pebble install'
      }
    }
  });

  grunt.registerTask('build', [
    'exec:pebble_build'
  ]);

  grunt.registerTask('install', [
    'exec:pebble_build'
  ]);

  grunt.registerTask('default', ['build']);
};