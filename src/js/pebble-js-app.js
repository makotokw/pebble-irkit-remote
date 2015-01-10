/*global Pebble*/
'use strict';

var appKeys = {
  'menu': 0,
  'commandIndex': 127,
  'result': 128
};

var globalConfig = {
  configurationUrl: 'http://192.168.1.31:9000/', // for debug
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
  xhr.open('POST', 'http://' + globalConfig.privateAddress + '/messages', true);
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
  xhr.open('POST', globalConfig.internetHttpApi + '/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function (/*e*/) {
    onApiResponseLoaded(xhr);
  };
  xhr.onerror = function (/*e*/) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send('clientkey=' + globalConfig.clientKey + '&deviceid=' + globalConfig.deviceId + '&message=' + message);
}

function sendCommandsToPebble() {
  var message = {};
  for (var i = 0; i < globalConfig.commands.length; i++) {
    message['' + i] = globalConfig.commands[i].name;
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
    var message = globalConfig.commands[commandIndex].message;
    console.log('js.appmessage.command:' + commandIndex);
    if (globalConfig.useDeviceAPI) {
      postMessageToIRKitByDeviceAPI(message);
    } else {
      postMessageToIRKitInternetAPI(message);
    }
  });

// Configuration

Pebble.addEventListener(
  'showConfiguration',
  function (/*e*/) {
    Pebble.openURL(globalConfig.configurationUrl);
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
      globalConfig.useDeviceAPI = userConfig.useDeviceAPI;
      globalConfig.privateAddress = userConfig.privateAddress || globalConfig.privateAddress;
      globalConfig.clientKey = userConfig.clientKey || globalConfig.clientKey;
      globalConfig.deviceId = userConfig.deviceId || globalConfig.deviceId;
      globalConfig.commands = userConfig.commands || globalConfig.commands;
      console.log('globalConfig.commands: ' + globalConfig.commands.length);
      sendCommandsToPebble();
      localStorage.setItem('userConfiguration', configurationText);
    }
  } catch (e) {
    console.log(e, configurationText);
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
        parserUserConfiguration(xhr.responseText);
      } else {
        console.log(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (/*e*/) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send(null);
}

Pebble.addEventListener(
  'webviewclosed',
  function (e) {
    var configuration = JSON.parse(decodeURIComponent(e.response));
    if (configuration.userConfigUrl && configuration.userConfigUrl.match(/^https?:\/\//)) {
      fetchUserConfiguration(configuration.userConfigUrl);
    }
    console.log('Configuration window returned: ', JSON.stringify(configuration));
  }
);

// initialize

Pebble.addEventListener(
  'ready',
  function (/*e*/) {
    console.log('js.ready!');
    var userConfiguration = localStorage.getItem('userConfiguration');
    if (userConfiguration) {
      parserUserConfiguration(userConfiguration);
    }
  }
);