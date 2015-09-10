module.exports = {

  bower: {
    command: 'bower install'
  },

  // does not need to compile.
  videojs: {
    command: [
      // 'npm install',
      // 'bower install',
      // 'grunt'
    ].join('&&'),
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/videojs'
      }
    }
  },

  // Since bower version does not contains jshintrc, we can only define each tasks sepaeately.
  videojs_contrib_ads: {
    command: [
      // 'npm install',
      // 'bower install',
      'grunt clean',
      'grunt concat',
      'grunt uglify'
    ].join(' && '),
    // command: 'grunt',
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/videojs-contrib-ads'
      }
    }
  },

  videojs_contrib_hls: {
    command: [
      'npm install',
      'bower install',
      'grunt'
    ].join('&&'),
    // command: 'grunt',
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/videojs-contrib-hls'
      }
    }
  },

  // Do not need to compile
  videojs_contrib_media_sources: {
    command: [
      // 'npm install',
      // 'bower install',
      // 'grunt'
    ].join('&&'),
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/videojs-contrib-media-sources'
      }
    }
  },

  // Do not need to compile
  videojs_sublime_skin: {
    command: [
      // 'npm install',
      // 'bower install',
      // 'grunt'
    ].join('&&'),
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/videojs-sublime-skin'
      }
    }
  },

  // use precompiled version instead of source version
  vmap_client_js: {
    command: [
      // 'npm run test',
      // 'npm run bundle'
    ].join('&&'),
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/vmap-clinet-js'
      }
    }
  },

  // use precompiled version instead of source version
  vast_client_js: {
    command: [
      // 'npm run test',
      // 'npm run bundle'
    ].join('&&'),
    options: {
      stderr: true,
      execOptions: {
        cwd: './bower_components/vast-clinet-js'
      }
    }
  },

  copylib: {
    command: [
      'cp <%= bower_components %>/bootstrap/dist/js/bootstrap.js ./lib/',
      'cp <%= bower_components %>/bootstrap/dist/fonts/* ./lib/fonts/',
      'cp <%= bower_components %>/bootstrap/dist/css/*.min.css ./lib/css/',
      'cp <%= bower_components %>/jquery/dist/jquery.js ./lib/',
      'cp <%= bower_components %>/vast-client-js/vast-client.js ./lib/',
      'cp <%= bower_components %>/vmap-client-js/vmap-client.js ./lib/',
      'cp <%= bower_components %>/videojs/dist/video-js/video.js ./lib/',
      'cp <%= bower_components %>/videojs/dist/video-js/video-js.swf ./lib/',
      'cp <%= bower_components %>/videojs/dist/video-js/video-js.css ./lib/',
      'cp <%= bower_components %>/videojs/dist/video-js/font/* ./lib/font/',
      'cp <%= bower_components %>/videojs/dist/video-js/lang/* ./lib/lang/',
      'cp <%= bower_components %>/videojs-contrib-ads/dist/videojs.ads.js ./lib/',
      'cp <%= bower_components %>/videojs-contrib-hls/dist/videojs.hls.js ./lib/',
      'cp <%= bower_components %>/videojs-contrib-media-sources/src/videojs-media-sources.js ./lib/',
      'cp <%= bower_components %>/videojs-sublime-skin/dist/videojs-sublime-skin.css ./lib/',
    ].join('&&')
  }

};
