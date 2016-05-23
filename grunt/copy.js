module.exports = {
  main: {
    files: [
      // Bootstrap
      {expand: true, src:'<%= bower_components %>/bootstrap/dist/js/bootstrap.js', dist: '/lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/bootstrap/dist/fonts/*', dist: 'lib/fonts/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/bootstrap/dist/css/*.min.css', dist: 'lib/css/', filter: 'isFile'},

      // jQuery
      {expand: true, src:'<%= bower_components %>/jquery/dist/jquery.js', dist: 'lib/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/vast-client/vast-client.js', dist: 'lib/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/vmap-client/vmap-client.js', dist: 'lib/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/videojs/dist/video-js/video.dev.js', dist: 'lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs/dist/video-js/video-js.swf', dist: 'lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs/dist/video-js/video-js.css', dist: 'lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs/dist/video-js/font/*', dist: 'lib/font/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs/dist/video-js/lang/*', dist: 'lib/lang/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/videojs-contrib-ads/dist/videojs.ads.js', dist: 'lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs-contrib-ads/dist/videojs.ads.css', dist: 'lib/', filter: 'isFile'},
      {expand: true, src:'<%= bower_components %>/videojs-contrib-hls/dist/videojs.hls.js', dist: 'lib/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/videojs-contrib-media-sources/src/videojs-media-sources.js', dist: 'lib/', filter: 'isFile'},

      {expand: true, src:'<%= bower_components %>/videojs-sublime-skin/dist/videojs-sublime-skin.css', dist: './lib/', filter: 'isFile'},
    ]
  }
};
