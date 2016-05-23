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
    flash: {
        swf: 'dist/video-js.swf'
    },
    poster: 'dist/black_128.png',
    plugins: {
        ottPlayerLibrary: {
            requestUrl: '',
            skipTime: 0,
            allowSkip: true
        }
    }
};

var player = videojs('video', options).ready(function() {
    var mPlayer = this;
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
        mPlayer.ottPlayerLibrary.loadContent(content);
    }
});
