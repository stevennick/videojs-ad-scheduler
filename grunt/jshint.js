module.exports = {
  gruntfile: {
    options: {
      node: true
    },
    src: ['Gruntfile.js', 'grunt/**/*.js']
  },
  src: {
    options: {
      jshintrc: '.jshintrc'
    },
    src: ['src/**/*.js']
  },
  test: {
    options: {
      jshintrc: '.jshintrc'
    },
    src: ['test/**/*.js']
  }
};
