# Video.js Advertisement Scheduler

A linear advertisement schedule plugin for [Video.js 4.x and 5.x](http://videojs.com/). With ad scheduler, the Video.js player can accept VMAP v1.0.1 schedule document while content playing, enables player to play preroll, midroll, and postroll inline advertisements.

> This project is under development and will change frequencies without notice.

## Getting Started

Before use plugin works with exist Video.js enabled page, you'll need external VAST&VMAP parser for advertisement document information extraction. Here recommended to use [vast-client-js](https://github.com/dailymotion/vast-client-js) from dailymotion and [vmap-client-js](https://github.com/stevennick/vmap-client-js) created by me. This plugin also requires videojs-contrib-ads plugin has installed.

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<script src="vast-client.js"></script>
<script src="vmap-client.js"></script>
<script src="videojs.ads.js"></script>
<script src="videojs-ad-scheduler.js"></script>
<script>
  var options = {
    plugins: {
      // You don't need to manually enable ads plugin,
      // the ad scheduler will do the same work for you.
      ottAdScheduler: {
        serverUrl: '(Your VMAP advertisement access URL)'  // One of the usage
      }
    }
  };
  videojs(document.querySelector('video'), options, null).ready(function() {
    this.src([{src:"(Your main video content)", type:"video/mp4"}]);
    // Another usage to load VMAP document. Select one of them to enable
    // linear advertisement.
    this.ottAdScheduler.requestUrl('(Your VMAP advertisement access URL)');
    this.play();
  });
</script>
```

You can also use the regular video.js src function to assign media content. Once video played, video.js will schedule ad breaks and play ads described in VMAP/VAST documents.

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You need pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### serverUrl(url)
Type: `String`
Default: ""
*Required*

Setup VMAP requests  URL, which will use in content video.

#### allowSkip(skippible)
Type: `Boolean`
Default: True
*Optional*

Allow user skip each ad content. This option will NOT override ad break instructions defined in the VAST document if ad document setup is not skippable.

#### skipTime(time)
Type: `Integer`
Default: 5 (Seconds)
*Optional*

Allow user skip each ad content after ad content is played over specified seconds. This option will NOT override ad break instructions defined in the VAST document if ad document setup is not skippable.

#### startOffset(seconds)
Type: `Integer`
Default: 0 (Seconds)
*Optional*

Allow player resume playback from given time offset, the value must be in seconds. This startOffset function must call before loading actual content, otherwise, the player offset may not operate corrected.

#### resumeSkipMidroll(skipAdIfResume)
Type: `Boolean`
Default: false
*Optional*

Allow control player to skip midrolls that setup before given startOffset. Preroll advertisements will not affect by this setting. This resumeSkipMidroll function must call before loading VMAP or will still not skip midroll ads.

### Methods

This plugin added options as same name methods, let the user be able to change options in ad scheduler runtime. Once you retrieve the player runtime, use `player.ottAdScheduler` namespace to access them.

```javascript
    player.ottAdScheduler.serverUrl();       // Get current VMAP request URL
    player.ottAdScheduler.serverUrl(foo);    // Setup VMAP request URL as foo
```

## Development
### Requirement
* npm
* bower
* grunt

### Steps
1. checkout project or [download zip file](archive/master.zip).
2. cd into extracted folder.
3. Setup environment: `npm install && bower install`
4. Build dependency libraries `grunt mkdir && grunt shell`
5. Build distributed version: `grunt`
6. Run demo locally: `grunt serve`

## Release History
 - 0.1.0: Upgrade library to Video.js v5.10.x and Video.js-contrib-ads plugin v3.2.0 compatible.
 - 0.0.2: Compassed version; remove jQuery, bootstrap, and external skin dependencies.
 - 0.0.1: Initial release.

## Author
Stevennick Ciou

## License

Copyright (c) 2015 Stevennick Ciou
All rights reserved.
Detialed license, please see the [LICENSE](LICENSE) file.

