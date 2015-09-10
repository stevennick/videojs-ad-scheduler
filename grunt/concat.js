module.exports = {
  options: {
    banner: '<%= banner %>',
    stripBanners: true
  },
  dist: {
    // src: 'src/**/*.js',
    src: [
    'lib/jquery.js',
    'lib/bootstrap.js',
    'lib/vast-client.js',
    'lib/vmap-client.js',
    'lib/video.js',
    'lib/videojs-media-sources.js',
    'lib/videojs.hls.js',
    'lib/videojs.ads.js',
    'src/**/*.js'],
    dest: 'dist/<%= pkg.name %>.js'
  }
};
