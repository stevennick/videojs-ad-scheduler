module.exports = {
  options: {
    banner: '<%= banner %>'
  },
  dist: {
    src: '<%= concat.js.dest %>',
    dest: 'dist/<%= pkg.name %>.min.js'
  }
};
