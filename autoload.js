function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var options = {
    debug: true,
    html5: {
        hls: {
            withCredentials: false
        }
    },
};

var player = videojs('video', options).ready(function() {
    var mPlayer = this;
    var tech = mPlayer.tech({
        IWillNotUseThisInPlugins: true
    });
    tech.on('loadstart', function(event) {
        if (tech.hls != undefined) {
            tech.hls.xhr.beforeRequest = function(options) {
                // Only apply CROS cookie for key request, not for content
                if (options.uri.match(/(\.ts|\.m3u8)$/gi) === null) {
                    options.withCredentials = true;
                } else {
                    options.withCredentials = false;
                }
                return options;
            };
        }
    });
    var videoSrc = getParameterByName('vSrc');
    var mapSrc = getParameterByName('mapSrc');
    if (mapSrc == null) {
        mapSrc = "";
    }
    if (videoSrc != null) {
        var content = {
            vmap: mapSrc,
            src: [{
                src: videoSrc,
                type: 'application/x-mpegURL'
            }]
        };
        mPlayer.src(content.src);
        mPlayer.play();
    }
});
