/*! ott-ad-scheduler - v0.0.0 - 2015-5-14
 * Copyright (c) 2015 Stevennick Ciou
 * Licensed under the MIT license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
    serverUrl: '',
    userId: '',
    contentId: '',
    option: true,
    // seconds before skip button shows, negative values to disable skip button altogether
    skipTime: 5,
    allowSkip: true
  },
  ottAdScheduler;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  ottAdScheduler = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options), player = this;

    if(player.ads === undefined) {
      window.console.error('This plugin requires videojs-contrib-ads, plugin not initialized');
      return null;
    } else {
      // Initialize ads framework
      // player.ads();
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

    // VMAP.client.get('/test/PlayerTestVMAP.xml', null, function(cb) {
    //   // Do vmap related operations
    //   console.log(JSON.stringify(cb));
    //   var adBreaks = cb.adbreaks;
    //   for (var index=0; index < adBreaks.length; index++) {
    //     if (adBreaks[index].isWrapper == false && adBreaks[index].vastAdData != undefined) {
    //       DMVAST.client.parse(adBreaks[index].vastAdData[1], adBreaks[index].vastAdData[0].baseURI, null, function(vast) {
    //         // Do vast related operations
    //         console.log(JSON.stringify(vast));
    //       });
    //     }
    //   }
    // });

    /**
     * Parse time offset value and return absoluted integer for insert seconds.
     * @param  {[string]} time          input time for pasrse.  vaild strings are 'start', 'end', 'n%' (0<=n<=100), 'hh:mm:ss.mmm' or '#m' (sequence)
     * @param  {[integer]} adBreakSize   Required for '#m' type, used to calculate offset position.
     * @param  {[integer]} contentLength Required for 'n%', '#m' and 'end', used to calculate vaild time. Only acceptable in seconds.
     * @return {[integer]}               Calculated time offset, in seconds.
     */
    var parseTimeOffset = function(time, adBreakSize, contentLength) {
      var value = 0;
      if (time.search(/start/) == 0) {
        value = 0;
      } else if (time.search(/end/) == 0) {
        value = contentLength;
      } else if (time.search(/\d+%/) == 0 && contentLength != undefined) {
        var percent = time.match(/\d+/)[0];
        value = (percent / 100) * contentLength;
      } else if (time.search(/\d+:\d+:\d+(.\d+|)/) == 0) {
        var times = time.match(/\d+/g);
        var seconds = times[0] * 3600 + times[1] * 60 + times[2];
        if (times.length == 4) {
          seconds += times[3] / 1000;
        }
        value = seconds;
      } else if (time.search(/#\d+/) == 0 && contentLength != undefined && adBreakSize != undefined) {
        var position = time.match(/\d+/)[0];
        if (position == 0) {
          console.error("Position can not be zero.");
          return -1;
        } else if (position > adBreakSize) {
          console.error("Position value is out of AdBreaks range.");
          return -1
        }
        value = ((position / adBreakSize) / 100) * contentLength;
      } else {
        console.error("Error time format or not enough information to determine correct adbreak time.");
        return -1;
      }
      return Number(value);
    };

    var adBreaks;
    var adBreaksTimeArray = [];
    var currentAdBreak = 0;

    player.on('contentupdate', function() {
      // Load AD URL
      var requestUrl = settings.serverUrl + '?uid=' + encodeURIComponent(settings.userId) + "&cid=" + encodeURIComponent(settings.contentId);
      var options;
      // NOTE: player duration is zero until media is playing.
      var contentLength = player.duration();

      var callback = function(ads) {
        console.log(JSON.stringify(ads));
        // parse all abreaks to determine if there has preroll AD
        adBreaks = ads.adbreaks;
        for (var index = 0; index < adBreaks.length; index++) {
          adBreaks[index].timeOffset = parseTimeOffset(adBreaks[index].timeOffset, adBreaks.length, contentLength);
          adBreaksTimeArray.push(adBreaks[index].timeOffset);
        }
        console.log(JSON.stringify(adBreaks));



      };
      var inst = VMAP.client.get(requestUrl, options, callback);

      // if (true) {
      //   player.trigger('adsready');
      // }
    });



    var playVastCreatives = function(ad) {

    };

    var playVastAds = function(vast) {
      for(var vindex = 0; vindex < vast.ads.length; vindex++) {
        var ad = vast.ads[vindex];

        for (var index = 0; index < ad.creatives.length; index++) {
          var creative = ad.creatives[index];
          switch(creative.type) {
            case 'linear':
            // Linear AD
            // Select available player tech for playing
            for (var typeIndex = 0; typeIndex < creative.mediaFiles.length; typeIndex++) {
              var mediaFile = creative.mediaFiles[typeIndex];
              // TODO: Temporary only allow mp4 for AD playback. Need to extend to support all available tech.
              if (mediaFile.mimeType != 'video/mp4') { continue; }
              // TODO: Init tracker and attach events to player
              // var tracker = new DMVAST.tracker()
              // Put player into AD Mode

              var originsrc = player.src();
              var originPos = player.duration();
              player.ads.startLinearAdMode();
              player.src(mediaFile.fileURL);
              player.play();
              // player.one('durationchange', function() {

              // });
              // player.one('ended', player.ottAdScheduler.exitVastCreatives(index));
              player.one('error', function() {
                player.ads.endLinearAdMode();
                player.src(originsrc);
                player.seekTo(originPos);
                player.play();
              });
              player.one('ended', function() {
                player.ads.endLinearAdMode();
                player.src(originsrc);
                player.seekTo(originPos);
                player.play();
              });
            }
            break;
            case 'non-linear':
            // TODO
            break;
            case 'companion':
            // TODO
            break;
            default:
            // DO Nothing
            break;
          }
        }

      }
    };

    // Hook time objects to determine if one of adbreak reached.
    player.on('timeupdate', function() {

      if (adBreaks == undefined) { return; }

      console.log("updated " + player.currentTime());
      if (player.currentTime() >= adBreaks[currentAdBreak].timeOffset) {
        // Prepare for AD time
        var vastCallback = function(vast) {
          // Do vast related operations
          // console.log(JSON.stringify(vast));
          player.pause();
          console.log("playAD #" + currentAdBreak);
          playVastAds(vast);
          currentAdBreak++;
        };

        if (adBreaks[currentAdBreak].isWrapper == false && adBreaks[currentAdBreak].vastAdData != undefined) {
          DMVAST.client.parse(adBreaks[currentAdBreak].vastAdData[1], adBreaks[currentAdBreak].vastAdData[0].baseURI, null, vastCallback);
        } else if (adBreaks[currentAdBreak].isWrapper == true) {
          DMVAST.client.get(adBreaks[currentAdBreak].adTagURI, null, vastCallback);
        }
      }
    });

    player.on('play', function() {

    });

    // TODO: write some amazing plugin code
    player.on('vast-ready', function() {
      // Fetch ad URL
      player.trigger('adsready');
    });

    // player.on('readyforpreroll', function() {
    //   // Fetch AD URL
    //   // Enter AD Mode
    //   player.ads.startLinearAdMode();
    //   // Play linear ad content
    //   player.src('http://cfvod.kaltura.com/pd/p/777122/sp/77712200/serveFlavor/entryId/0_vriq23ct/v/1/flavorId/0_g0vnoj5i/name/a.mp4');
    //   player.one('durationchange', function() {
    //     player.play();
    //   });

    //   // Hook player AD ended state to close LinearAdMode
    //   // player.one('ended', function() {
    //   //   player.ads.endLinearAdMode();
    //   // });

    // });

  // player.trigger('contentupdate');
  return this;
  };

  ottAdScheduler.prototype = {

    fetchVMAP: function() {

    },

    exitVastCreatives: function(index) {
      player.ads.endLinearAdMode();
    },

    __void: function() {

    }
  };

  // register the plugin
  videojs.plugin('ottAdScheduler', ottAdScheduler);
})(window, window.videojs);
