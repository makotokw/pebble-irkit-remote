Pebble to IRKit
===================

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
