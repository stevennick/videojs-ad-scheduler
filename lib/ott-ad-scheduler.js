/*! ott-ad-scheduler - v0.0.0 - 2015-5-14
 * Copyright (c) 2015 Stevennick Ciou
 * Licensed under the MIT license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
        option: true,
        // seconds before skip button shows, negative values to disable skip button altogether
        skip: 5
      },
      ottAdScheduler;

  var adScheduler = function (player, settings) {
    return {

      getVMAP: function(url) {
        return null;
      },

      getVAST: function(index) {
        return null;
      }
    };
  };

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  ottAdScheduler = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this;

    if(player.ads === undefined) {
      window.console.error('This plugin requires videojs-contrib-ads, plugin not initialized');
      return null;
    } else {
      // Initialize ads framework
      player.ads();
    }

    // TODO: write some amazing plugin code
    player.on('vast-ready', function() {
      // Fetch ad URL
      player.trigger('adsready');
    });

    player.on('readyforpreroll', function() {
      player.ads.startLinearAdMode();
      // Play linear ad content
      player.src('http://cfvod.kaltura.com/pd/p/777122/sp/77712200/serveFlavor/entryId/0_vriq23ct/v/1/flavorId/0_g0vnoj5i/name/a.mp4');
      player.one('durationchange', function() {
        player.play();
      });

      player.one('ended', function() {
        player.ads.endLinearAdMode();
      });
    });
  };

  // register the plugin
  videojs.plugin('ottAdScheduler', ottAdScheduler);
})(window, window.videojs);
