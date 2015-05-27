IRKit Remote as Pebble Watchapp
===================

Send IR signal to [IRKit](http://getirkit.com/). (IRKit device is IR remote controller and is seller in only Japan)

![](https://dl.dropboxusercontent.com/u/8932138/screenshot/pebble/pebble-irkit-remote/pebble-irkit-remote_1.0.png)

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
npm install
grunt pebbleDebugBuild
grunt pebbleInstall
```

### Develop settings page

```
npm install
bower install
grunt settingsDebug
```

Modify ``irkitConfig.settingsUrl`` on ``src/js/pebble-js-app.js`` to connect localhost.

### Deploy settings page

```
grunt settingsBuild
git commit dist
git subtree push --prefix dist origin gh-pages
```
