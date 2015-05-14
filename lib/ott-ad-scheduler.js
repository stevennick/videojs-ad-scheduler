/*! ott-ad-scheduler - v0.0.0 - 2015-5-14
 * Copyright (c) 2015 Stevennick Ciou
 * Licensed under the MIT license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
        option: true
      },
      ottAdScheduler;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  ottAdScheduler = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this;

    // TODO: write some amazing plugin code
  };

  // register the plugin
  videojs.plugin('ottAdScheduler', ottAdScheduler);
})(window, window.videojs);
