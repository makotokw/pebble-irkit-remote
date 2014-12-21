/*global Pebble*/

var irkit = {
  internetHttpApi: 'https://api.getirkit.com',
  privateAddress: '192.168.1.43',
  clientKey: '',
  deviceId: '',
  commands: [
    {'name': 'AirCold', 'message': '{"format":"raw","data":[6881,3458,787,2626,787,968,787,873,787,873,873,2537,787,968,787,873,873,873,735,873,735,2626,787,904,787,2626,787,2626,787,873,873,2537,787,2626,787,2626,787,2626,787,2626,787,873,873,873,873,2537,873,873,873,873,787,968,787,968,787,873,787,873,873,2537,843,2537,843,2537,843,2537,843,968,787,873,873,873,787,968,735,968,815,815,815,904,735,968,735,968,815,815,815,815,815,935,815,815,815,815,815,935,815,815,815,935,735,904,815,815,815,904,735,904,815,815,815,815,815,935,815,935,815,2537,787,904,815,904,735,904,735,904,815,935,735,968,735,58076,6881,3458,843,2537,787,968,735,968,815,815,815,2537,815,904,787,904,904,904,787,904,787,2626,843,843,843,2626,843,2626,843,935,815,2537,843,2537,843,2537,843,2537,843,2537,843,935,815,935,815,2537,843,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,935,787,2537,843,843,843,843,843,968,787,2626,787,2626,787,904,787,904,787,904,787,904,787,2537,787,968,787,2537,787,2537,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,2537,787,2537,787,2537,787,2537,787,904,735,2626,787,968,787,2537,843,843,843,843,843,843,843,843,843,968,787,968,787,968,787,968,787,968,787,873,873,873,735,873,735,873,735,968,787,968,787,873,787,873,787,968,735,968,735,968,735,873,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,873,873,873,787,873,873,873,873,873,787,873,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,968,787,873,787,968,787,968,787,968,787,968,787,968,787,968,787,2626,815,2626,815,904,735,904,735,904,735,904,735,904,904,904,815,904,735,968,735,968,735,968,735,968,735,968,735,968,735,968,735,968,735,968,735,968,735,2537,787,2537,787,968,787,968,787,2626,787,2626,787,2626,787],"freq":38}'},
    {'name': 'AirWarm', 'messsage': '{"freq":38,"format":"raw","data":[6881,3341,873,2537,873,787,873,787,873,787,873,2451,873,873,873,873,873,873,873,873,873,2451,873,787,873,2537,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,873,873,787,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,873,873,873,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,2537,904,787,873,787,873,787,873,787,873,787,873,787,873,58076,6881,3341,873,2537,873,873,873,873,873,873,873,2537,873,873,873,873,873,873,873,873,873,2537,873,873,873,2537,873,2537,873,873,873,2537,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,2537,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,2537,873,873,873,873,873,873,873,873,873,873,873,2537,873,873,873,873,873,873,873,787,873,787,873,2537,873,2537,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,873,2537,873,2537,873,2537,873,2537,873,873,873,2537,873,873,873,2537,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,2537,904,2537,904,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,787,787,873,787,873,787,873,787,873,787,873,787,873,2537,873,873,873,787,873,2537,873,2537,873,2537,873,2537,873]}'},
    {'name': 'AirOff', 'message': '{"format":"raw","data":[6881,3341,904,2451,904,904,904,904,904,904,904,2451,904,904,904,904,904,904,904,904,904,2451,904,904,904,2451,904,2451,904,904,904,2451,904,2451,904,2451,904,2451,904,2451,904,787,873,787,873,2451,873,873,873,873,873,787,873,787,873,787,873,787,873,2451,904,2451,904,2451,904,2451,904,787,873,787,873,787,873,787,787,787,873,787,873,787,873,787,873,787,873,787,787,787,873,787,787,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,873,2451,873,873,873,873,873,873,873,873,873,787,904,787,787,58076,6881,3341,873,2537,904,787,904,787,904,787,787,2537,904,787,787,787,873,787,873,787,787,2537,873,873,873,2537,873,2537,873,787,787,2537,873,2537,873,2537,873,2537,873,2537,873,873,873,873,873,2537,873,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,904,787,787,787,904,787,904,787,904,787,904,787,787,787,904,787,904,787,904,787,904,2537,873,873,873,873,873,787,873,787,873,2537,904,2537,904,2537,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,2537,904,2537,904,2537,904,2537,904,904,904,2537,904,904,904,2537,904,904,904,904,904,904,904,787,873,787,873,787,873,787,873,787,873,787,873,787,873,787,787,787,873,787,873,787,873,787,873,787,787,787,787,787,873,787,787,787,787,787,873,787,787,787,873,787,873,787,787,787,873,787,873,787,787,787,873,787,787,787,873,787,873,787,873,787,787,787,787,787,873,787,787,787,787,787,873,787,873,787,787,787,787,787,787,787,787,787,873,787,787,787,787,787,787,787,787,787,873,787,787,787,787,787,873,787,787,2537,904,2537,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,904,787,787,787,904,787,787,787,787,787,787,787,787,787,787,787,787,2537,873,873,873,787,787,2537,873,2537,873,2537,873,2537,873,2537,873],"freq":38}'}
  ]
};

function postMessageToIrkitByDeviceAPI(message) {
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
  }
  xhr.onerror = function (e) {
    console.log(xhr.statusText);
    sendCommandResult(0);
  };
  xhr.send(message);
}

function postMessageToIrkitInternetAPI(message) {
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
  }
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
      console.log("Successfully delivered message with transactionId="
        + e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver message with transactionId="
        + e.data.transactionId
        + " Error is: " + e.error.message);
    }
  );
}

function sendCommandResult(result) {
  var transactionId = Pebble.sendAppMessage(
    { '128': result },
    function(e) {
      console.log("Successfully delivered message with transactionId="
        + e.data.transactionId);
    },
    function(e) {
      console.log("Unable to deliver message with transactionId="
        + e.data.transactionId
        + " Error is: " + e.error.message);
    }
  );
}

Pebble.addEventListener("appmessage",
  function(e) {
    var commandIndex = e.payload.commandIndex;
    console.log("js.appmessage.command:" + commandIndex);
    postMessageToIrkitInternetAPI(irkit.commands[commandIndex].message);
  });

Pebble.addEventListener("ready",
  function (e) {
    console.log("js.ready!");
    sendCommandsToPebble();
  }
);
