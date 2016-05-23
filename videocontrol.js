(function() {

  PlayerControl = {};
  PlayerControl = function(options) {

    var startplay = false;

    var playerOptions = {
      hls: {
        withCredentials: true
      },
      flash: {
        swf: 'js/video-js.swf'
      },
      debug: false,
      //poster: 'black_128.png',
      plugins: {
        ottPlayerLibrary: {
          resumeSkipMidroll: true,
          debug: false,
          requestUrl: '',
          skipTime: 5,
          allowSkip: true
        }
      }
    };

    var player = videojs('videoplayer', playerOptions).ready(function() {

      var sendArc = function(type, contentId, offset, callback) {

        var req = new XMLHttpRequest();
        var url = 'arc.php';

        url = url + '?type=' + type + '&pid=' + contentId + '&offset=' + offset;
        req.open('GET', url, true);
        if (!(typeof callback === 'undefined')) {
          req.onload = function() {
            if (req.status >= 200 && req.status < 400) {
              // Success!
              var resp = req.responseText;
              callback(resp, req);
            } else {
              // We reached our target server, but it returned an error
            }
          };
        }
        req.send(null);
      };


      var mPlayer = this;
      var content = {
        // support Ad
        vmap: 'http://' + options.ad_ip + '/ad-server/index.php?r=vmap/gen&pid=' + options.contentid,
        src: [{
          type: 'application/x-mpegURL',
          src: options.contenturl
        }]
      };

      var cTime = 0;
      var off = parseInt(options.offset);
      if (off > 0) {
        var r = confirm("Play from the previous record ?");
        if (r === false)
          this.ottPlayerLibrary.startOffset(0);
        else
          this.ottPlayerLibrary.startOffset(off);
      }

      //this.ottPlayerLibrary.loadContent(content);
      var loginData = {
        url: 'http://' + options.drm_ip + '/php/login.php',
        type: 'POST',
        data: {
          ID: options.user,
          PWD: options.passwd
        }
      };

      this.ottPlayerLibrary.login(loginData, function(data, status, xhr) {
        mPlayer.ottPlayerLibrary.loadContent(content);
      });

      mPlayer.one('timeupdate', function(event) {
        if (!mPlayer.inAdMode && startplay === false) {
          sendArc('play', options.contentid, options.offset);
        }
        startplay = true;
      });

      this.one('timeupdate', function() {
        setTimeout(function() {
          mPlayer.on('play', function(event) {
            if (!mPlayer.inAdMode && startplay === false) {
              sendArc('play', options.contentid, options.offset);
            }
            startplay = true;
          });

          mPlayer.on('pause', function() {
            if (!mPlayer.inAdMode) {
              sendArc('stop', options.contentid, mPlayer.currentTime());
            }
          });

          mPlayer.on('timeupdate', function() {
            if (!mPlayer.inAdMode)
              cTime = mPlayer.currentTime();
          });

          mPlayer.on('ended', function(event) {
            if (!mPlayer.inAdMode && mPlayer.currentTime() !== 0) {
              sendArc('stop', options.contentid, mPlayer.currentTime());
              startplay = false;
            }
          });

          // Below uses jQuery to catch up exit event. Add ready delay for them.
          $(document).ready(function() {
            $(window).on('unload', function() {
              sendArc('stop', options.contentid, cTime);
            });

            $(window).on('beforeunload', function() {
              sendArc('stop', options.contentid, cTime);
            });

            // For Safari Mobile
            $(window).on('pagehide', function() {
              sendArc('stop', options.contentid, cTime);
            });
          });

        }, 2000);
      });
      return player;
    });
    document.player = player;
  };

})();
