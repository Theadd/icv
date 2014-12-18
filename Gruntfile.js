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
          wrap: {
            startFile: "src/js/HEADER",
            end: "}());"
          },
          out: 'assets/js/icv.js',
          skipModuleInsertion: true
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/js/*.js'],
        tasks: ['requirejs'],
        options: {
          spawn: false,
          interrupt: true
        }
      },
      styles: {
        files: ['src/less/**'],
        tasks: ['less'],
        options: {
          spawn: true,
          interrupt: true
        }
      }
    },
    less: {
      development: {
        options: {
          paths: ["src/less"]
        },
        files: {
          "assets/css/icv.css": "src/less/icv.less",
          "assets/css/base.css": "src/less/base.less"
        }
      },
      production: {
        options: {
          paths: ["src/less"],
          compress: true
        },
        files: {
          "assets/css/icv.min.css": "src/less/icv.less",
          "assets/css/base.min.css": "src/less/base.less"
        }
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['requirejs', 'watch', 'less']);

};