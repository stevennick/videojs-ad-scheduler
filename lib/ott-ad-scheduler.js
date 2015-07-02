/*! ott-ad-scheduler - v0.0.0 - 2015-5-14
 * Copyright (c) 2015 Stevennick Ciou
 * Licensed under the MIT license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
    // serverUrl: '',
    // userId: '',
    // contentId: '',
    requestUrl: '',
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


    var source = '';
    var requestUrl;
    var adBreaks;
    var adBreaksTimeArray = [];
    var currentAdBreak = 0;
    var inAdMode = false;
    this.inAdMode = inAdMode;
    this.hasPostroll = false;

    /**
     * Reset all objects to accept new request content.
     * @return {[type]} [description]
     */
    var resetAdStatus = function() {
      source = '';
      requestUrl = {};
      adBreaks = {};
      adBreaksTimeArray = [];
      currentAdBreak = 0;
      player.inAdMode = false;
      player.off('timeupdate', timeUpdateHandle);
      player.off('ended', offTimeUpdateHandle);
    };


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
        value = -1;
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
          return -100;
        } else if (position > adBreakSize) {
          console.error("Position value is out of AdBreaks range.");
          return -100;
        }
        value = ((position / adBreakSize) / 100) * contentLength;
      } else {
        console.error("Error time format or not enough information to determine correct adbreak time.");
        return -100;
      }
      return value;
    };

    /**
     * This function creates a new anchor element and uses location properties (inherent)
     * to get the desired URL data. Some String operations are used (to normalize results across browsers).
     *
     * Source: http://james.padolsey.com/snippets/parsing-urls-with-the-dom/
     *
     * @param  {String} url source URL to parse.
     * @return {Object}     parsed result for futher uses.
     */
    function parseURL(url) {
      var a =  document.createElement('a');
      a.href = url;
      return {
        source: url,
        protocol: a.protocol.replace(':','').toLowerCase(),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
          var ret = {},
            seg = a.search.replace(/^\?/,'').split('&'),
            len = seg.length, i = 0, s;
          for (;i<len;i++) {
            if (!seg[i]) { continue; }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
          }
          return ret;
        })(),
        file: (a.pathname.match(/\/([^/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
      };
    };

    /**
     * Detect and merge relative URL path to correct external URL. Used in APP-based player library.
     * @param  {String} tagURI         Source URI to detect or correct.
     * @param  {Object} vmapRequestURL Parsed VMAP request URI object, as compare source
     * @return {[type]}                Corrected URL for source URI
     */
    var mergeURL = function(tagURI, vmapRequestURL) {
      var tagURL = parseURL(tagURI);
      if (tagURL.protocol == "file") {
        // relateived href detected, replace original URL host to VMAP location

        if (!tagURL.source.startsWith('/')) {
          // relative host and path, execute additional handles to build vaild path
          var relPath = '/';
          for (var index = 0; index < vmapRequestURL.segments.length - 1; index++) {
            relPath = relPath + vmapRequestURL.segments[index] + '/';
          }
          tagURL.source = relPath + tagURL.source;
        }

        // relative host, absolute path
        if (vmapRequestURL.port == '') {
          return vmapRequestURL.protocol + '://' + vmapRequestURL.host + tagURL.source;
        } else {
          return vmapRequestURL.protocol + '://' + vmapRequestURL.host + ":" + vmapRequestURL.port + tagURL.source;
        }
      } else {
        // Use original URL
        return tagURI;
      }
    };

    // Executes when durationchange event is trigger.
    var updateLastAdBreak = function(event) {
      if (adBreaks[adBreaks.length - 1].timeOffset == 0 && source == player.currentSrc()) {
        adBreaksTimeArray[adBreaksTimeArray.length - 1] = player.duration();
        adBreaks[adBreaks.length - 1].timeOffset = adBreaksTimeArray[adBreaksTimeArray.length - 1];
      }
    };

    /**
     * Used to store adbreak object.
     * @param  {[type]} ads [description]
     * @return {[type]}     [description]
     */
    var vmapCallback = function(ads) {
      if (ads == undefined) { return; }
      // parse all abreaks to determine if there has preroll AD
      // NOTE: player duration is zero until media is playing.
      var contentLength = player.duration();
      adBreaks = ads.adbreaks;
      requestUrl = parseURL(settings.requestUrl);
      // Rebuild adBreaks array in ordered.
      var __startIndex;
      var __endIndex;
      var sortedOffset = [];
      for (var index = 0; index < adBreaks.length; index++) {
        adBreaks[index].timeOffset = parseTimeOffset(adBreaks[index].timeOffset, adBreaks.length, contentLength);
        if (adBreaks[index].timeOffset > -2) {
          // save key into array
          if (adBreaks[index].timeOffset == 0) {
            __startIndex = index;
          } else if (adBreaks[index].timeOffset == -1) {
            __endIndex = index;
          } else {
            // adBreaksTimeArray.push(adBreaks[index].timeOffset);
            sortedOffset.push(index);
          }
        }
      }
      // Insert start and end offsets
      sortedOffset.sort();
      if (__startIndex != undefined) {
        sortedOffset.unshift(__startIndex);
      }
      if (__endIndex != undefined) {
        sortedOffset.push(__endIndex);
      }


      // console.log("Sorted :" + JSON.stringify(sortedOffset));

      // Rebuild adBreaks
      var sortedAdBreaks = [];
      for (var sortId = 0 ; sortId < sortedOffset.length; sortId++) {
        var offset = sortedOffset[sortId];
        sortedAdBreaks.push(adBreaks[offset]);
        adBreaksTimeArray.push(adBreaks[offset].timeOffset);
      }
      // console.log("Original:" + JSON.stringify(adBreaks));
      adBreaks = sortedAdBreaks.slice();
      // console.log("Ordered: " + JSON.stringify(adBreaks));
      // console.log(JSON.stringify(adBreaks));
      source = player.currentSrc();
      player.on('timeupdate', timeUpdateHandle);
      player.one('ended', offTimeUpdateHandle);

      if (adBreaksTimeArray[0] == 0) {
        // player.one('start', function(event) {
          player.trigger('adsready');
        // });
      } else {
        //setup duration change event.
        // player.one('durationchange', updateLastAdBreak);
      }
    };

    var setNewContent = function(contentUpdate) {
      resetAdStatus();
      if (!player.inAdMode && settings.requestUrl != undefined) {
        // Load AD URL
        // var requestUrl = settings.serverUrl + '?uid=' + encodeURIComponent(settings.userId) + "&cid=" + encodeURIComponent(settings.contentId);
        var inst = VMAP.client.get(settings.requestUrl, null, vmapCallback);
      }
    };

    /**
     * Used to fetch VMAP document for AD scheduler map.
     * @param  {[type]} contentUpdate [description]
     * @return {[type]}               [description]
     */
    var contentUpdateHandle = function(contentUpdate) {
      if (player.inAdMode) {
        // Delay content update function until AD finished.
        player.one('ended', function(event) {
          setNewContent(contentUpdate);
        });
      } else {
        setNewContent(contentUpdate);
      }
    };

    /**
     * Control player to play advertisements by VAST document.
     * @param  {Object} player Player object for control
     * @param  {Object} vast   Psrsed VAST document for player use
     * @return {[type]}        [description]
     */
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
              adSource.push({type: mediaFile.mimeType, src: mediaFile.fileURL});
              // TODO: Init tracker and attach events to player
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
      var originsrc = player.currentSrc();
      var originPos = player.currentTime();
      var originType = player.currentType();
      // Set to start AD Mode;
      player.ads.startLinearAdMode();

      var adIndex = 0;

      // var forcetoCurrentTime = function(event, originPos) {
      //   if (player.currentTime() < originPos) {
      //     player.currentTime(originPos);
      //   } else {
      //     player.off('timeupdate', forcetoCurrentTime);
      //   }
      // };

      var startPlayContent = function(event) {

        player.inAdMode = false;
        player.ads.endLinearAdMode();
        //setup duration change event.
        // player.one('durationchange', updateLastAdBreak);
        player.src([{src: originsrc, type: originType}]);
        // seeking for same tech
        player.currentTime(originPos);

        var forceToCurrentTime = function(event) {
          if (player.currentTime() < originPos) {
            player.currentTime(originPos);
          } else {
            // player.dimensions('99.9%');
            // player.dimensions('100%');
            player.off('timeupdate', forceToCurrentTime);
            player.on('timeupdate', timeUpdateHandle);
            player.one('ended', offTimeUpdateHandle);
          }
        };

        player.play().ready(function() {
          player.on('timeupdate', forceToCurrentTime);
        });
        // seeking for different tech (Hack). e.g., HLS (Flash backend) -> html5
        // player.one('timeupdate', function(event) {
        //   player.currentTime(originPos);
        //   player.on('timeupdate', timeUpdateHandle);
        //   player.one('ended', offTimeUpdateHandle);
        // });

      };

      var nextOrEndAd = function(event) {
        // player.trigger('adend');
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
        player.off('ended', offTimeUpdateHandle);
        console.log("Playing #" + (adIndex + 1) + " of " + adPlayList.length);
        player.inAdMode = true;
        player.src(ad);
        player.play();
        // player.trigger('adstart');
        player.one('ended' , nextOrEndAd);
        player.one('error', nextOrEndAd);
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

    /**
     * Handle VAST parser callback.
     * @param  {[type]} vast [description]
     * @return {[type]}      [description]
     */
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

    /**
     * Hook player time update event and handles midrolls & postroll ad trigger.
     * @param  {[type]} timeUpadteEvent [description]
     * @return {[type]}                 [description]
     */
    var timeUpdateHandle = function(timeUpadteEvent) {
      // Skip if in ad mode or adbreaks is empty.
      if (player.inAdMode == true || adBreaks == undefined || adBreaks[currentAdBreak] == undefined ) { return; }

      // Update lastest one adbreak to correct duration.
      // if (adBreaks[adBreaks.length - 1].timeOffset == 0 && source == player.currentSrc()) {
      //   adBreaksTimeArray[adBreaksTimeArray.length - 1] = player.duration();
      //   adBreaks[adBreaks.length - 1].timeOffset = adBreaksTimeArray[adBreaksTimeArray.length - 1];
      // }

      console.log("Main content: " + player.currentTime() + ", next trigger: " + adBreaks[currentAdBreak].timeOffset);

      if (adBreaks[currentAdBreak].timeOffset > 0 && player.currentTime() > adBreaks[currentAdBreak].timeOffset) {
        console.log('Main content trigger play Ad break #' + (currentAdBreak + 1));

        player.off('timeupdate', timeUpdateHandle);
        // Prepare for AD time
        if (adBreaks[currentAdBreak].isWrapper == false && adBreaks[currentAdBreak].vastAdData != undefined) {
          player.inAdMode = true;
          DMVAST.client.parse(adBreaks[currentAdBreak].vastAdData[1], adBreaks[currentAdBreak].vastAdData[0].baseURI, null, vastCallback);
        } else if (adBreaks[currentAdBreak].isWrapper == true) {
          player.inAdMode = true;
          var url = mergeURL(adBreaks[currentAdBreak].adTagURI, requestUrl);
          console.log("Access URL:" + url);
          DMVAST.client.get(url, null, vastCallback);
        }
      } else {
        if (adBreaks[currentAdBreak].timeOffset == -1) {
          console.log("Setup postroll handle");
          // Stop time update handle
          player.off('timeupdate', timeUpdateHandle);
          // Setup Postroll
          this.hasPostroll = true;
          player.one('ended', postrollHandle);
        }
      }
      // Make sure setup postroll only when there is only one ad break for postroll.
      // if (adBreaks.length == currentAdBreak + 1) {

      //   console.log("Setup postroll handle");
      //   // Stop time update handle
      //   player.off('timeupdate', timeUpdateHandle);
      //   // Setup Postroll
      //   player.on('ended', postrollHandle);

      // }
    };

    /**
     * Handle preroll advertisements.
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    var prerollHandle = function(event) {
      player.pause();
      console.log("Preroll triggered.");
      player.off('timeupdate', timeUpdateHandle);

      // Prepare for AD time
      if (adBreaks[currentAdBreak].isWrapper == false && adBreaks[currentAdBreak].vastAdData != undefined) {
        player.inAdMode = true;
        DMVAST.client.parse(adBreaks[currentAdBreak].vastAdData[1], adBreaks[currentAdBreak].vastAdData[0].baseURI, null, vastCallback);
      } else if (adBreaks[currentAdBreak].isWrapper == true) {
        player.inAdMode = true;
        var url = mergeURL(adBreaks[currentAdBreak].adTagURI, requestUrl);
        console.log("Access URL:" + url);
        DMVAST.client.get(url, null, vastCallback);
      }
      // player.trigger('adsready');
    };

    /**
     * Handle postroll advertisements.
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    var postrollHandle = function(event) {
      console.log("Postroll triggered.");
      player.off('timeupdate', timeUpdateHandle);
      player.off('ended', postrollHandle);
      this.hasPostroll = false;
      // Prepare for AD time
      if (adBreaks[currentAdBreak].isWrapper == false && adBreaks[currentAdBreak].vastAdData != undefined) {
        player.inAdMode = true;
        DMVAST.client.parse(adBreaks[currentAdBreak].vastAdData[1], adBreaks[currentAdBreak].vastAdData[0].baseURI, null, vastCallback);
      } else if (adBreaks[currentAdBreak].isWrapper == true) {
        player.inAdMode = true;
        var url = mergeURL(adBreaks[currentAdBreak].adTagURI, requestUrl);
        console.log("Access URL:" + url);
        DMVAST.client.get(url, null, vastCallback);
      }
    };

    var offTimeUpdateHandle = function(event) {
      if (!this.hasPostroll) {
        console.log("Switch off time update handle.");
        player.off('timeupdate', timeUpdateHandle);
        console.log("Trigger completion event.");
        player.trigger("onCompletion");
      } else {
        console.log("Yield completion after postroll handle.");
      }
    };


    // Hook time objects to determine if one of adbreak reached.
    // player.on('contentupdate', function(contentUpdateEvent) { contentUpdateHandle(contentUpdateEvent); });
    // player.on('timeupdate', function(timeUpadteEvent) { timeUpdateHandle(timeUpadteEvent); });
    // player.on('play', function() {  });
    player.on('contentupdate', contentUpdateHandle);
    // player.on('timeupdate', timeUpdateHandle);
    // player.on('play', function() { /* Handle preroll if have */ });
    player.on('readyforpreroll', prerollHandle);

    // replace initializer to adscheduler namespace.
    player.ottAdScheduler = {

      /**
       * Get current VMAP request URL or setup new VMAP request URL.
       * @param  {String} requestUrl [Option] When setup means assign new request VMAP URL to player.
       * @return {[type]}            Return current VMAP request URL if patameter is blank, or player object for chain use.
       */
      requestUrl: function(requestUrl) {
        if (requestUrl == undefined) {
          return settings.requestUrl;
        } else {
          settings.requestUrl = requestUrl;
          return player;
        }
      },

      /**
       * Allow user skip each ad content. This option will NOT override ad break instructions defined in VAST document if ad document setup is not skippable.
       * @param  {Boolean} allowSkip True for allow AD skip, False for negative.
       * @return {[type]}           Return current settings, or player object for chain use.
       */
      allowSkip: function(allowSkip) {
        if (allowSkip == undefined) {
          return settings.allowSkip;
        } else {
          settings.allowSkip = allowSkip;
          return player;
        }
      },

      /**
       * Allow user skip each ad content after ad content is played over specified seconds. This option will NOT override ad break instructions defined in VAST document if ad document setup is not skippable.
       * @param  {Integer} skipTime Waiting durations for skippable ads, in seconds.
       * @return {[type]}          Return current settings, or player object for chain use.
       */
      skipTime: function(skipTime) {
        if (skipTime == undefined) {
          return settings.skipTime;
        } else {
          settings.skipTime = skipTime;
          return player;
        }
      },

      /**
       * Update ad content instanly. Only available when Player is not in ad mode.
       * @return {Object} Player object for chain use.
       */
      contentUpdate: function() {
        contentUpdateHandle();
        return player;
      },

      /**
       * Indicate current player mode.
       * @return {Boolean} True means in AdMode and an advertisement is playing, otherwise, in normal mode.
       */
      isInAdMode: function() {
        return player.inAdMode;
      }
    };

    return this;
  };

  // register the plugin
  videojs.plugin('ottAdScheduler', ottAdScheduler);
})(window, window.videojs);
