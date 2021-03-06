/*global module:false*/
module.exports = function (grunt) {
  'use strict';

  var licenseBanner = '/*!' + '\n' +
    'The MIT License (MIT)' + '\n' +
    'http://opensource.org/licenses/MIT' + '\n\n' +
    'Copyright (c) 2014 Wingify Software Pvt. Ltd.' + '\n' +
    'http://wingify.com' + '\n' +
    '*/\n\n' +
    'var VWO = window.VWO || {}; \n';

  var fs = require('fs');
  var execSync = require('exec-sync');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    concat: {
      options: {
        separator: '\n',
        process: function (src) {
          return licenseBanner + '(function(){\n' +
            src + '\n})();';
        }
      },
      domComparator: {
        dest: 'dist/dom-comparator.js',
        src: ['src/*.js']
      },
      unit: {
        dest: 'test/unit-tests.js',
        src: ['test/unit/*.spec.js']
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js'],
        tasks: ['concat']
      },
      tests: {
        files: ['test/unit/*.spec.js'],
        tasks: ['concat', 'testem']
      },
      options: {
        spawn: false, // don't spawn another process
        livereload: true // runs livereload server on 35729
      }
    },
    uglify: {
      options: {
        mangle: false,
        wrap: 'closure',
        banner: licenseBanner,
        sourceMap: true,
        sourceMapIncludeSources: true
      },
      domComparator: {
        files: {
          'dist/dom-comparator.min.js': 'src/*.js'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('testem', function () {
    var testemConfig = {
      'test_page': 'test/test-index.html',
      'launch_in_ci': ['Chrome']
    };
    fs.writeFileSync('testem.json', JSON.stringify(testemConfig), {
      encoding: 'utf8'
    });
    var output = execSync('./node_modules/testem/testem.js ci');
    grunt.log.writeln(output);
    if (output.indexOf('not ok') >= 0) {
      grunt.fail.fatal('one or more tests failed');
    }
  });

  grunt.registerTask('default', ['concat', 'uglify']);
};