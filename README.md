# Ott Ad Scheduler

A advertisement schedule plugin for video.js.

This project is under development and will change frequences without notice.

## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<script src="ott-ad-scheduler.js"></script>
<script>
  videojs(document.querySelector('video')).ottAdScheduler();
</script>
```

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### option
Type: `boolean`
Default: true

An example boolean option that has no effect.

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
`grunt test`

## Release History

 - 0.1.0: Initial release
