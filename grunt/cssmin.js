module.exports = {
  options: {
//    banner: '/* ott-ad-scheduler 0.0.0 | Stevennick Ciou | MIT Licensed */'
  },
  target: {
    files: {
      '<%= plugin.dist %>/<%= pkg.name %>.min.css': ['<%= concat.css.dest %>']
    }
  }
};
