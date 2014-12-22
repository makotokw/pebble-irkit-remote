/*global Pebble*/

var irkit = {
  internetHttpApi: 'https://api.getirkit.com',
  privateAddress: '',
  clientKey: '',
  deviceId: '',
  commands: []
};

function postMessageToIRKitByDeviceAPI(message) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://' + irkit.privateAddress + '/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function (e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        sendCommandResult(1);
      } else {
        sendCommandResult(0);
      }
    }
  };
  xhr.onerror = function (e) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send(message);
}

function postMessageToIRKitInternetAPI(message) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', irkit.internetHttpApi + '/1/messages', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function (e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        sendCommandResult(1);
      } else {
        sendCommandResult(0);
      }
    }
  };
  xhr.onerror = function (e) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send('clientkey=' + irkit.clientKey + '&deviceid=' + irkit.deviceId + '&message=' + message);
}

function sendCommandsToPebble() {
  var message = {};
  for (var i = 0; i < irkit.commands.length; i++) {
    message['' + i] = irkit.commands[i].name;
  }
  var transactionId = Pebble.sendAppMessage(
    message,
    function(e) {
      console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver message with transactionId=" + e.data.transactionId + " Error is: " + e.error.message);
    }
  );
}

function sendCommandResult(result) {
  var transactionId = Pebble.sendAppMessage(
    { '128': result },
    function(e) {
      console.log("Successfully delivered message with transactionId=" + e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver message with transactionId=" + e.data.transactionId + " Error is: " + e.error.message);
    }
  );
}

Pebble.addEventListener("appmessage",
  function(e) {
    var commandIndex = e.payload.commandIndex;
    console.log("js.appmessage.command:" + commandIndex);
    postMessageToIRKitInternetAPI(irkit.commands[commandIndex].message);
  });

Pebble.addEventListener("ready",
  function (e) {
    console.log("js.ready!");
    var userConfiguration = localStorage.getItem("userConfiguration");
    if (userConfiguration) {
      parserUserConfiguration(userConfiguration);
    }
  }
);

Pebble.addEventListener(
  'showConfiguration',
  function (e) {
    Pebble.openURL('http://192.168.1.31:9000/');
  }
);

function parserUserConfiguration(configurationText) {
  try {
    var userConfig = JSON.parse(configurationText);
    if (userConfig) {
      console.log(userConfig);
      irkit.privateAddress = userConfig.privateAddress || irkit.privateAddress;
      irkit.clientKey = userConfig.clientKey || irkit.clientKey;
      irkit.deviceId = userConfig.deviceId || irkit.deviceId;
      irkit.commands = userConfig.commands || irkit.commands;
      console.log('irkit.commands: ' + irkit.commands.length);
      sendCommandsToPebble();
      localStorage.setItem('userConfiguration', configurationText);
    }
  } catch (e) {
    console.log(e, configurationText);
  }
}

function fetchUserConfiguration(url) {
  console.log('fetch user commands: ', url);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function (e) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        parserUserConfiguration(xhr.responseText);
      } else {
        console.log(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send(null);
}

Pebble.addEventListener(
  'webviewclosed',
  function(e) {
    var configuration = JSON.parse(decodeURIComponent(e.response));
    if (configuration.userConfigUrl && configuration.userConfigUrl.match(/^https?:\/\//)) {
      fetchUserConfiguration(configuration.userConfigUrl);
    }
    console.log('Configuration window returned: ', JSON.stringify(configuration));
  }
);
