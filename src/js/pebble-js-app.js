'use strict';

var appKeys = {
  'menuItem': 0,
  'menuState': 127,
  'commandIndex': 128,
  'commandResult': 129
};

var menuState = {
  loading: 1,
  failed: -1
};

var irkitConfig = {
  settingsUrl: 'http://makotokw.github.io/pebble-irkit-remote/',
  // settingsUrl: 'http://192.168.1.32:9000/', // for debug
  internetHttpApi: 'https://api.getirkit.com/1',
  useDeviceAPI: false, // for local
  privateAddress: '', // for local
  clientKey: '',
  deviceId: '',
  commands: []
};

/**
 * @param {Number} state
 */
function sendMenuState(state) {
  var message = {};
  message[appKeys.menuState] = state;
  Pebble.sendAppMessage(
    message,
    function (e) {
      console.log('Successfully delivered message with transactionId=' + e.data.transactionId);
    },
    function (e) {
      console.log('Unable to deliver message with transactionId=' + e.data.transactionId + ' Error is: ' + e.error.message);
    }
  );
}

/**
 * @param {Number} result
 */
function sendCommandResult(result) {
  var message = {};
  message[appKeys.commandResult] = result;
  Pebble.sendAppMessage(
    message,
    function (e) {
      console.log('Successfully delivered message with transactionId=' + e.data.transactionId);
    },
    function (e) {
      console.log('Unable to deliver message with transactionId=' + e.data.transactionId + ' Error is: ' + e.error.message);
    }
  );
}

/**
 * @param {XMLHttpRequest} xhr
 */
function onApiResponseLoaded(xhr) {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      sendCommandResult(1);
    } else {
      sendCommandResult(0);
    }
  }
}

/**
 * @param {String} message
 */
function postMessageToIRKitByDeviceAPI(message) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://' + irkitConfig.privateAddress + '/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function (/*e*/) {
    onApiResponseLoaded(xhr);
  };
  xhr.onerror = function (/*e*/) {
    sendCommandResult(0);
  };
  xhr.send(message);
}

/**
 * @param {String} message
 */
function postMessageToIRKitByInternetAPI(message) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', irkitConfig.internetHttpApi + '/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function (/*e*/) {
    onApiResponseLoaded(xhr);
  };
  xhr.onerror = function (/*e*/) {
    sendCommandResult(0);
  };
  xhr.send('clientkey=' + irkitConfig.clientKey + '&deviceid=' + irkitConfig.deviceId + '&message=' + message);
}

function sendCommandsToPebble(commands) {
  var message = {};
  for (var i = 0; i < commands.length; i++) {
    message['' + i] = commands[i].name;
  }
  Pebble.sendAppMessage(
    message,
    function (e) {
      console.log('Successfully delivered message with transactionId=' + e.data.transactionId);
    },
    function (e) {
      console.log('Unable to deliver message with transactionId=' + e.data.transactionId + ' Error is: ' + e.error.message);
    }
  );
}

Pebble.addEventListener('appmessage',
  function (e) {
    //noinspection JSUnresolvedVariable
    var commandIndex = e.payload.commandIndex;
    var message = irkitConfig.commands[commandIndex].message;
    console.log('sendCommandByIndex:' + commandIndex);
    if (irkitConfig.useDeviceAPI) {
      postMessageToIRKitByDeviceAPI(message);
    } else {
      postMessageToIRKitByInternetAPI(message);
    }
  });

// --------------------------------------------------------
// Configuration

Pebble.addEventListener(
  'showConfiguration',
  function (/*e*/) {
    Pebble.openURL(irkitConfig.settingsUrl);
  }
);

/**
 * @param {String} configurationText
 * @returns {boolean}
 */
function parserUserConfiguration(configurationText) {
  try {
    var userConfig = JSON.parse(configurationText);
    if (userConfig) {
      console.log(userConfig);
      irkitConfig.useDeviceAPI = userConfig.useDeviceAPI;
      irkitConfig.privateAddress = userConfig.privateAddress || irkitConfig.privateAddress;
      irkitConfig.clientKey = userConfig.clientKey || irkitConfig.clientKey;
      irkitConfig.deviceId = userConfig.deviceId || irkitConfig.deviceId;
      irkitConfig.commands = userConfig.commands || irkitConfig.commands;
      console.log('irkitConfig.commands: ' + irkitConfig.commands.length);
      sendCommandsToPebble(irkitConfig.commands);
      // save
      localStorage.setItem('cachedUserConfigurationText', configurationText);
      return true;
    }
  } catch (e) {
    console.log(e, configurationText);
  }
  return false;
}

/**
 * @returns {boolean}
 */
function loadUserConfigurationFromCache() {
  var configurationText = localStorage.getItem('cachedUserConfigurationText');
  if (configurationText) {
    return parserUserConfiguration(configurationText);
  }
  return false;
}

/**
 * @param {String} url
 */
function fetchUserConfiguration(url) {
  console.log('fetch user commands: ' + url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  function handleConfiguration() {
    var success = false;
    console.log('fetch user commands: ' + url + ' ' + xhr.status);
    if (xhr.status === 200) {
      success = parserUserConfiguration(xhr.responseText);
    }
    if (!success) {
      success = loadUserConfigurationFromCache();
    }
    if (!success) {
      sendMenuState(menuState.failed);
    }
  }

  xhr.onload = function (/*e*/) {
    if (xhr.readyState === 4) {
      handleConfiguration();
    }
  };
  xhr.onerror = function (/*e*/) {
    handleConfiguration();
  };

  sendMenuState(menuState.loading);
  xhr.send(null);
}

Pebble.addEventListener(
  'webviewclosed',
  function (e) {
    var settings = JSON.parse(decodeURIComponent(e.response));
    if (settings.configurationUrl && settings.configurationUrl.match(/^https?:\/\//)) {
      fetchUserConfiguration(settings.configurationUrl);
      localStorage.setItem('settings.configurationUrl', settings.configurationUrl);
    }
    console.log('Configuration window returned: ', JSON.stringify(settings));
  }
);

// --------------------------------------------------------
// initialize

Pebble.addEventListener(
  'ready',
  function (/*e*/) {
    console.log('js.ready!');
    var configurationUrl = localStorage.getItem('settings.configurationUrl');
    if (configurationUrl) {
      fetchUserConfiguration(configurationUrl);
    }
  }
);