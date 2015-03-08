module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n',
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },
    concat: {
      options: {
        // separator: ';',
        banner: '<%= banner %>'
      },
      dist: {
        src: [
          'intersect/intersect.js',
          'src/axis2d.js',
          'src/axis2d.world.js',
          'src/axis2d.grid.js',
          'src/axis2d.collider.js',
          'src/axis2d.debugdraw.js'
        ],
        dest: 'build/axis2d.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      build: {
        src: 'build/axis2d.js',
        dest: 'build/axis2d.min.js'
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', [
    'jshint',
    'concat',
    'uglify'
  ]);

};
