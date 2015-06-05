# Ott Ad Scheduler

A advertisement schedule plugin for video.js.
This project is under development and will change frequences without notice.

## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<script src="ott-ad-scheduler.js"></script>
<script>
  var options = {
    plugins: {
      ads: {}, // For videojs-contrib-ads plugin required.
      ottAdScheduler: {
        serverUrl: '/test/PlayerTestVMAP.xml',  // VMAP location
        userId: 'U00001',                       // Optional user identifier
        contentId: 'c00001'                     // Optional media identifier
      }
    }
  };
  videojs(document.querySelector('video'), options, null).ready(function() {
    this.src([{src:"http://vjs.zencdn.net/v/oceans.mp4", type:"video/mp4"}]);
    this.play();
  });
</script>
```

You can also use regular video.js src function to assign media content. Once video played, video.js will schedule ad breaks and play ads described in VMAP/VAST documents.

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You need pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### serverUrl (Required)
Type: `String`
Default: ""

Setup VMAP request URL, which will used in content video.

#### allowSkip (Optional)
Type: `Boolean`
Default: True

Allow user skip each ad content. This option will NOT override ad break instructions defined in VAST document if ad document setup is not skippable.

#### skipTime (Optional)
Type: `Integer`
Default: 5 (Seconds)

Allow user skip each ad content after ad content is played over specified seconds. This option will NOT override ad break instructions defined in VAST document if ad document setup is not skippable.

### Methods

This plugin added options as same name methods, let user be able to change options in ad scheduler runtime. Once you retrieve the player runtime, use player.ottAdScheduler namespace to access them.

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
3. Setup environment:
`npm install && bower install`
4. Run demo locally:
`grunt serve`

## Release History

 - 0.1.0: Initial release
