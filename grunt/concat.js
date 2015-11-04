module.exports = {
  options: {
    separator: '\n',
    banner: '<%= banner %>',
    stripBanners: true
  },

  js: {
    // src: 'src/**/*.js',
    src: [
    'lib/vast-client.js',
    'lib/vmap-client.js',
    'lib/video.js',
    'lib/videojs-media-sources.js',
    'lib/videojs.hls.js',
    'lib/videojs.ads.js',
    'src/**/*.js'],
    dest: 'dist/<%= pkg.name %>.js'
  },

  css: {
    src: [
    'lib/video-js.css',
    'lib/videojs.ads.css',
    'src/**/*.css'],
    dest: 'dist/<%= pkg.name %>.css'
  }
};
