module.exports = {
  options: {
    port: 9000,
    // Change this to '0.0.0.0' to access the server from outside.
    hostname: '0.0.0.0',
    livereload: 35729
  },
  livereload: {
    options: {
      open: true,
      // middleware: function(connect) {
      //   return [
      //     connect.static('.tmp'),
      //     connect().use(
      //       '/bower_components',
      //       connect.static('/bower_components')
      //     ),
      //     connect.static(appConfig.app)
      //   ];
      // },
      base: '<%= plugin.configPath %>'
    }
  },
  dist: {
    options: {
      open: true,
      base: '<%= plugin.configPath %>'
    }
  }
};
