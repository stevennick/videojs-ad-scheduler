module.exports = {
  bower: {
    files: ['bower.json'],
    tasks: ['wiredep']
  },
  js: {
    files: ['<%= plugin.app %>/{,*/}*.js'],
    tasks: ['newer:jshint:all', 'wiredep'],
    options: {
      livereload: '<%= connect.options.livereload %>'
    }
  },
  gruntfile: {
    files: '<%= jshint.gruntfile.src %>',
    tasks: ['jshint:gruntfile']
  },
  src: {
    files: '<%= jshint.src.src %>',
    tasks: ['jshint:src', 'qunit'],
    options: {
      livereload: '<%= connect.options.livereload %>'
    }
  },
  test: {
    files: '<%= jshint.test.src %>',
    tasks: ['jshint:test', 'qunit']
  },
  livereload: {
    options: {
      livereload: '<%= connect.options.livereload %>'
    },
    files: [
      '<%= plugin.src %>/{,*/}*.js',
      '<%= plugin.src %>/../lib/{,*/}*',
      '<%= plugin.src %>/../ott-player.html',
      '<%= plugin.src %>/../example.html',
      '<%= plugin.src %>/../dist-player.html'
    ]
  }
};
