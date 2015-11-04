/*! ott-player-library - v0.0.0 - 2015-6-11
 * Copyright (c) 2015 Stevennick Ciou
 * Copyright(C) 2015 ITRI, All Rights Reserved. */
(function(window, videojs) {
  'use strict';

  var defaults = {
    poster: 'black_128.png',
    requestUrl: '',
    option: true,
    // seconds before skip button shows, negative values to disable skip button altogether
    skipTime: 5,
    allowSkip: true,
    jsNameSpace: 'appHandler'
  },
  ottPlayerLibrary;

  ottPlayerLibrary = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options);
    var player = this;

    // Check if necessarily libraries are loaded correctly.
    if(player.ads === undefined) {
      window.console.error('This plugin requires videojs-contrib-ads, plugin not initialized');
      return null;
    } else {
      player.ads(options);
    }
    if (VMAP === undefined) {
      window.console.error('This plugin requires vmap-client-js, plugin not initialized');
      return null;
    }
    if (DMVAST === undefined) {
      window.console.error('This plugin requires vast-client-js, plugin not initialized');
      return null;
    } else {
      if (DMVAST.client.parse === undefined) {
        window.console.error('This plugin requires extra extensions managed by stevennick/vast-client-js, plugin not initialized');
        return null;
      }
    }
    // if (player.hls === undefined) {
    //   window.console.error("This plugin require videojs-contrib-hls and videojs-contrib-media-sources extensions, plugin not initialized.");
    //   return null;
    // }
    if (player.ottAdScheduler === undefined) {
      window.console.error('This plugin require ott-ad-scheduler extensions, plugin not initialized.');
      return null;
    } else {
      player.ottAdScheduler(settings);
    }

    // Hack: Fix aspectRatio error.
    // player.ready(function(){
    //   var pl = this;
    //   // Get current player width
    //   var width = pl.el().offsetWidth;
    //   pl.on('play', function() {
    //     var mwidth = width;
    //     var origPos = player.currentTime();
    //     var ratioFix = function() {
    //       if (origPos < pl.currentTime()) {
    //         player.off('timeupdate', ratioFix);
    //         var twidth = mwidth;
    //         var activeHack = function() {
    //           var iWidth = twidth;
    //           player.dimensions(iWidth - 1);
    //           setTimeout(function() {
    //             player.dimensions(iWidth);
    //           }, 1);
    //         };
    //         setTimeout(activeHack, 100);
    //       }
    //     };
    //     player.on('timeupdate', ratioFix);
    //   });
    // });
    // Hack code end here.

    player.ready(function(event) {
      if (player.inAdMode === false && window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].onReady();
      }
    });

    player.on('timeupdate', function(event) {
      if (player.inAdMode === false && window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].timeUpdateEvent(player.currentTime());
      }
    });

    player.on('durationchange', function(event) {
      if (player.inAdMode === false && window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].updateDurationEvent(player.duration());
      }
    });

    player.on('adstart', function(event) {
      if (window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].adStartEvent();
      }
    });

    player.on('adend', function(event) {
      if (window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].adEndEvent();
      }
    });

    var onCompletion = function(event) {
      // console.log('OnCompletion Triggered by AD integration.');
      if (player.inAdMode === false && window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].onCompletion();
      }
    };

    player.on('onCompletion', onCompletion);

//     player.on('ended', function(event) {
//       if (player.inAdMode == false) {
//         if (player.ottAdScheduler.hasPostroll) {
//           if (window[settings.jsNameSpace] != undefined) {
//             console.log("OnCompletion Triggered Directly.");
//             window[settings.jsNameSpace].onCompletion();
//           }
//         }
//       }
// //      if (player.inAdMode == false && window[settings.jsNameSpace] != undefined) {
// //        window[settings.jsNameSpace].onCompletion();
// //      } else {
// ////        player.one('onCompletion', onCompletion);
// //      }
//     });

    player.on('error', function(event) {
      if (window[settings.jsNameSpace] !== undefined) {
        window[settings.jsNameSpace].onError(event);
      }
    });

//    player.on('progress', function(event) {   // Fired while the user agent is downloading media data
//      if (window[settings.jsNameSpace] != undefined) {
//        window[settings.jsNameSpace].onError();
//      }
//    });

//    player.on('seeking', function(event) {
//      if (player.inAdMode == false && window[settings.jsNameSpace] != undefined) {
//        window[settings.jsNameSpace].onSeeking();
//      }
//    });
//
//    player.on('seeked', function(event) {
//      if (player.inAdMode == false && window[settings.jsNameSpace] != undefined) {
//        window[settings.jsNameSpace].onSeeked();
//      }
//    });

    // replace initializer to adscheduler namespace.
    player.ottPlayerLibrary = {

      /**
       * player login for DRM decryption use.
       * @param  {[type]}   options       [description]
       * @param  {Function} callback      [description]
       * @param  {[type]}   errorCallback [description]
       * @return {[type]}                 [description]
       */
      login: function(options, callback, errorCallback) {
        // var settings = videojs.util.mergeOptions(default, options);
        // For backward compatiable
        var data = options.data;
        var s = [];
        var d = '';
        var add = function( key, value ) {
          value = typeof value === 'function' ? value() : (value === null ? '' : value);
          s[ s.length ] = encodeURIComponent( key ) + '=' + encodeURIComponent( value );
        };
        // Below uses ECMAScript5 or newer.
        var keys = Object.keys(data);
        var index;
        for(index = 0 ; index < keys.length ; index++) {
          add( keys[index], data[keys[index]] );
        }
        // Rebuild query parameters.
        for(index = 0 ; index < s.length ; index++) {
          if(index === 0) {
            d = s[index];
          } else {
            d = d + '&' + s[index];
          }
        }
        //
        var xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.withCredentials = true;
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 400) {
            // Success!
            var resp = xhr.responseText;
            callback(resp);
          } else {
            // We reached our target server, but it returned an error
          }
        };
        xhr.onerror = errorCallback;
        xhr.send(d);
        // options.url = options.url + '?' +jQuery.param(options.data, false);
        // jQuery.ajax({
        //   url: options.url,
        //   type: options.type,
        //   data: options.data,
        //   xhrFields: {
        //     withCredentials: options.withCredentials
        //   }
        // }).success(callback).fail(errorCallback);
      },

      /**
       * Allow player resume playback from given time offset, value must be in seconds. This startOffset function must call before loading actual content, otherwise, player offset may not operate corrected.
       * @param  {[integer]} offset time offset in seconds
       * @return {[type]}        Return current settings, or player object for chain use.
       */
      startOffset: function(offset) {
        if (offset) {
          player.ready(function() {
            player.ottAdScheduler.startOffset(offset);
          });
        } else {
          return player.ottAdScheduler.startOffset();
        }
      },

      /**
       * Allow control player to skip midrolls that setup before given startOffset. Preroll advertisements will not affected by this setting. This resumeSkipMidroll function must call before loading VMAP or will still not skip midroll ads.
       * @param  {[Boolean]} option true for skip midrolls perior startoffset; false for not skip. If false, all midroll ads perior starOffset will play instantly before resume content playback.
       * @return {[type]}        Return current settings, or player object for chain use.
       */
      resumeSkipMidroll: function(option) {
        if (option) {
          player.ready(function() {
            player.ottAdScheduler.resumeSkipMidroll(option);
          });
        } else {
          return player.ottAdScheduler.resumeSkipMidroll();
        }
      },

      /**
       * Load playback content and vmap content.
       * @param  {Object} options for contents, with following format: {src:[{src: ..., type: ...}], vmap: '...'};
       * @return {[type]}         [description]
       */
      loadContent: function(options) {
        player.ready(function() {
          player.ottPlayerLibrary.VMAPSrc(options.vmap);
          player.src(options.src);
          player.play();
        });
      },

      VMAPSrc: function(src) {
        player.ottAdScheduler.requestUrl(src);
      },

      src: function(src) {
        player.src([{src: src, type: 'application/x-mpegURL'}]);
      },

      play: function() {
        player.play();
      },

      pause: function() {
        player.pause();
      },

      duration: function() {
        return player.duration();
      },

      currentTime: function(time) {
        return player.currentTime(time);
      },

      controls: function(controls) {
        return player.controls(controls);
      },

      dispose: function() {
        player.dispose();
      }
    };

  };

  // register the plugin
  videojs.plugin('ottPlayerLibrary', ottPlayerLibrary);
})(window, window.videojs);
