'use strict';

var appKeys = {
  'menu': 0,
  'commandIndex': 127,
  'result': 128
};

var irkitConfig = {
  settingsUrl: 'http://192.168.1.31:9000/', // for debug
  internetHttpApi: 'https://api.getirkit.com/1',
  useDeviceAPI: false, // for local
  privateAddress: '', // for local
  clientKey: '',
  deviceId: '',
  commands: []
};

/**
 * @param {Number} result
 */
function sendCommandResult(result) {
  var message = {};
  message[appKeys.result] = result;
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
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send(message);
}

/**
 * @param {String} message
 */
function postMessageToIRKitInternetAPI(message) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', irkitConfig.internetHttpApi + '/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function (/*e*/) {
    onApiResponseLoaded(xhr);
  };
  xhr.onerror = function (/*e*/) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send('clientkey=' + irkitConfig.clientKey + '&deviceid=' + irkitConfig.deviceId + '&message=' + message);
}

function sendCommandsToPebble() {
  var message = {};
  for (var i = 0; i < irkitConfig.commands.length; i++) {
    message['' + i] = irkitConfig.commands[i].name;
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
    var commandIndex = e.payload.commandIndex;
    var message = irkitConfig.commands[commandIndex].message;
    console.log('js.appmessage.command:' + commandIndex);
    if (irkitConfig.useDeviceAPI) {
      postMessageToIRKitByDeviceAPI(message);
    } else {
      postMessageToIRKitInternetAPI(message);
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
      sendCommandsToPebble();
      // save
      localStorage.setItem('cachedUserConfigurationText', configurationText);
      return true;
    }
  } catch (e) {
    console.log(e, configurationText);
  }
  return false;
}

function loadUserConfigurationFromCache() {
  var configurationText = localStorage.getItem('cachedUserConfigurationText');
  if (configurationText) {
    parserUserConfiguration(configurationText);
  }
}

/**
 * @param {String} url
 */
function fetchUserConfiguration(url) {
  console.log('fetch user commands: ', url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function (/*e*/) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (!parserUserConfiguration(xhr.responseText)) {
          loadUserConfigurationFromCache();
        }
      }
    }
  };
  xhr.onerror = function (/*e*/) {
    console.log(xhr.statusText);
    loadUserConfigurationFromCache();
  };
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