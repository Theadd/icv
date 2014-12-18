/*
 * grunt-contrib-requirejs
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    requirejs: {
      compile: {
        options: {
          appDir: "",
          baseUrl: 'src/js',
          name: 'main',
          include: ["graph", "generator", "style", "eventhandler"],
          //OPTIMIZE VALUES:
          //- "uglify": (default) uses UglifyJS to minify the code.
          //- "uglify2": in version 2.1.2+. Uses UglifyJS2.
          //- "closure": uses Google's Closure Compiler in simple optimization mode to minify the code. Only available if running the optimizer using Java.
          //- "closure.keepLines": Same as closure option, but keeps line returns in the minified files.
          //- "none": no minification will be done.
          optimize: "none",
          wrap: true,
          out: 'assets/js/icv.js',
          skipModuleInsertion: true
        }
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['requirejs']);

};