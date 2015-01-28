Pebble to IRKit
===================

Send IR signal to [IRKit](http://getirkit.com/). (IRKit device is IR remote controller and is seller in only Japan)

![](https://dl.dropboxusercontent.com/u/8932138/screenshot/pebble/pebble2irkit/pebble2irkit_1.0.png)

## Development

### Requirements

* Pebble SDK
* Node.JS
* Bower
* Ruby, Compass

### Directory Structure

```
/
├── bower_components    settings page third party packages
├── build               watchapp built
├── dist                settings page built
├── node_modules        build tools
├── resources           watchapp resources
├── src                 watchapp source
└── web                 settings page source
```

### Develop watchapp

```
grunt pebbleDebugBuild
grunt pebbleInstall
```

### Develop settings page

```
grunt settingsDebug
```

Modify ``irkitConfig.settingsUrl`` on ``src/js/pebble-js-app.js`` to connect localhost.

### Deploy settings page

```
git commit dist
git subtree push --prefix dist origin gh-pages
```
