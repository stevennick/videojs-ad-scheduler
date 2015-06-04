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

    var settings = videojs.util.mergeOptions(defaults, options);
    var player = this;

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


    //////////////////////////////////////////////////////
    /// Main Program
    //////////////////////////////////////////////////////


    var adBreaks;
    var adBreaksTimeArray = [];
    var currentAdBreak = 0;
    var inAdMode = false;
    this.inAdMode = inAdMode;


    /**
     * Parse time offset value and return absoluted integer for insert seconds.
     * @param  {[string]} time          input time for pasrse.  vaild strings are 'start', 'end', 'n%' (0<=n<=100), 'hh:mm:ss.mmm' or '#m' (sequence)
     * @param  {[integer]} adBreakSize   Required for '#m' type, used to calculate offset position.
     * @param  {[integer]} contentLength Required for 'n%', '#m' and 'end', used to calculate vaild time. Only acceptable in seconds.
     * @return {[integer]}               Calculated time offset, in seconds.
     */
    var parseTimeOffset = function(time, adBreakSize, contentLength) {
      var value = 0;
      adBreakSize = parseInt(adBreakSize);
      contentLength = parseInt(contentLength);
      if (time.search(/start/) == 0) {
        value = 0;
      } else if (time.search(/end/) == 0) {
        value = contentLength;
      } else if (time.search(/\d+%/) == 0 && contentLength != undefined) {
        var percent = time.match(/\d+/)[0];
        value = (percent / 100) * contentLength;
      } else if (time.search(/\d+:\d+:\d+(.\d+|)/) == 0) {
        var times = time.match(/\d+/g);
        var seconds = parseInt(times[0]) * 3600 + parseInt(times[1]) * 60 + parseInt(times[2]);
        if (times.length == 4) {
          seconds += parseInt(times[3]) / 1000;
        }
        value = seconds;
      } else if (time.search(/#\d+/) == 0 && contentLength != undefined && adBreakSize != undefined) {
        var position = parseInt(time.match(/\d+/)[0]);
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
      return value;
    };

    var vmapCallback = function(ads) {
      // console.log(JSON.stringify(ads));
      // parse all abreaks to determine if there has preroll AD
      // NOTE: player duration is zero until media is playing.
      var contentLength = player.duration();
      adBreaks = ads.adbreaks;
      for (var index = 0; index < adBreaks.length; index++) {
        adBreaks[index].timeOffset = parseTimeOffset(adBreaks[index].timeOffset, adBreaks.length, contentLength);
        adBreaksTimeArray.push(adBreaks[index].timeOffset);
      }
      console.log(JSON.stringify(adBreaks));
    };

    var contentUpdateHandle = function(contentUpdate) {
      if (!player.inAdMode) {
        // Load AD URL
        var requestUrl = settings.serverUrl + '?uid=' + encodeURIComponent(settings.userId) + "&cid=" + encodeURIComponent(settings.contentId);
        var inst = VMAP.client.get(requestUrl, null, vmapCallback);
      }
    };


    var playVastAds = function(player, vast) {

      var adPlayList = [];

      for(var vindex = 0; vindex < vast.ads.length; vindex++) {
        var ad = vast.ads[vindex];

        for (var index = 0; index < ad.creatives.length; index++) {
          var creative = ad.creatives[index];
          switch(creative.type) {
            case 'linear':
            // Linear AD
            // Select available player tech for playing
            var adSource = [];
            for (var typeIndex = 0; typeIndex < creative.mediaFiles.length; typeIndex++) {
              var mediaFile = creative.mediaFiles[typeIndex];
              // TODO: Temporary only allow mp4 for AD playback. Need to extend to support all available tech.
              adSource.push({type: mediaFile.mimeType, src: mediaFile.fileURL});
              // adSource.push(mediaFile.fileURL);
              // TODO: Init tracker and attach events to player
              // var tracker = new DMVAST.tracker()
              // Put player into AD Mode
              // player.one('durationchange', function() {

              // });
              // player.one('ended', player.ottAdScheduler.exitVastCreatives(index));

            }
            // TODO: add external data (Tracker, etc...)
            adPlayList.push({src: adSource});

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


      // Log current states.
      var originsrc = player.src();
      var originPos = player.currentTime();
      // Set to start AD Mode;
      player.ads.startLinearAdMode();

      var adIndex = 0;

      var startPlayContent = function(event) {

        player.inAdMode = false;
        player.ads.endLinearAdMode();
        player.src(originsrc);
        player.currentTime(originPos);
        player.on('timeupdate', timeUpdateHandle);
        player.play();
        // Correct end play content
        // if (adBreaks[adBreaks.length - 1].timeOffset == 0) {
        //   adBreaksTimeArray[adBreaksTimeArray.length - 1] = player.duration();
        //   adBreaks[adBreaks.length - 1].timeOffset = adBreaksTimeArray[adBreaksTimeArray.length - 1];
        // }
      };

      var nextOrEndAd = function(event) {
        adIndex++;
        player.off('ended' , nextOrEndAd);
        player.off('error', nextOrEndAd);

        if (adIndex >= adPlayList.length) {
          // No present AD to play
          player.inAdMode = false;
          startPlayContent(event);
        } else {
          // Play AD
          startPlayAd(adPlayList[adIndex].src);
        }
      };

      var startPlayAd = function(ad) {
        console.log("Playing #" + (adIndex + 1) + " of " + adPlayList.length);
        player.one('ended' , nextOrEndAd);
        player.one('error', nextOrEndAd);
        player.inAdMode = true;
        player.src(ad);
        player.play();
      };

      console.log("Total " + adPlayList.length + " ads in this ad break.");

      if (adIndex == 0 && adPlayList.length > adIndex) {
        // Start playing AD
        startPlayAd(adPlayList[adIndex].src);
      } else {
        // startPlayContent()
        // Do nothing
      }

    };

    var vastCallback = function(vast) {
      // Do vast related operations
      // console.log(JSON.stringify(vast));
      // TODO: add error handle
      // console.log(JSON.stringify(vast));
      player.pause();
      console.log("Play Ad break #" + (currentAdBreak + 1));
      playVastAds(player, vast);
      currentAdBreak++;
    };

    var timeUpdateHandle = function(timeUpadteEvent) {
      // Skip if in ad mode or adbreaks is empty.
      if (player.inAdMode == true || adBreaks == undefined || adBreaks[currentAdBreak] == undefined ) { return; }
      console.log("Main content: " + player.currentTime() + ", next trigger: " + adBreaks[currentAdBreak].timeOffset);

      if (player.currentTime() > adBreaks[currentAdBreak].timeOffset) {
        console.log('Main content trigger play Ad break #' + (currentAdBreak + 1));

        player.off('timeupdate', timeUpdateHandle);
        // Prepare for AD time
        if (adBreaks[currentAdBreak].isWrapper == false && adBreaks[currentAdBreak].vastAdData != undefined) {
          player.inAdMode = true;
          DMVAST.client.parse(adBreaks[currentAdBreak].vastAdData[1], adBreaks[currentAdBreak].vastAdData[0].baseURI, null, vastCallback);
        } else if (adBreaks[currentAdBreak].isWrapper == true) {
          player.inAdMode = true;
          DMVAST.client.get(adBreaks[currentAdBreak].adTagURI, null, vastCallback);
        }
      } else {
        // Pending until next adbreak.
        // Update lastest one adbreak to correct duration.
        if (adBreaks[adBreaks.length - 1].timeOffset == 0) {
          adBreaksTimeArray[adBreaksTimeArray.length - 1] = player.duration() - 0.5;
          adBreaks[adBreaks.length - 1].timeOffset = adBreaksTimeArray[adBreaksTimeArray.length - 1];
        }
      }
    };


    // Hook time objects to determine if one of adbreak reached.
    // player.on('contentupdate', function(contentUpdateEvent) { contentUpdateHandle(contentUpdateEvent); });
    // player.on('timeupdate', function(timeUpadteEvent) { timeUpdateHandle(timeUpadteEvent); });
    // player.on('play', function() {  });
    player.one('contentupdate', contentUpdateHandle);
    player.on('timeupdate', timeUpdateHandle);
    player.on('play', function() {  });

    return this;
  };

  ottAdScheduler.prototype = {

    // inAdMode: false,

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
