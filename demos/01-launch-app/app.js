// -----------------------------------------------------------------------------
// https://github.com/thibauts/node-castv2

var Client = require('castv2').Client

function ondeviceup(host) {

  var client = new Client();
  client.connect(host, function() {
    // create various namespace handlers
    var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
    var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

    // establish virtual connection to the receiver
    connection.send({ type: 'CONNECT' });

    // start heartbeating
    setInterval(function() {
      heartbeat.send({ type: 'PING' });
    }, 5000);

    // launch YouTube app
    receiver.send({ type: 'LAUNCH', appId: 'YouTube', requestId: 1 });

    // display receiver status updates
    receiver.on('message', function(data, broadcast) {
      if(data.type = 'RECEIVER_STATUS') {
        console.log(data.status);
      }
    });
  });

}

// -----------------------------------------------------------------------------
// https://github.com/futomi/node-dns-sd

const mDnsSd = require('node-dns-sd')

mDnsSd.discover({
  name: '_googlecast._tcp.local'
}).then((device_list) =>{
  if (!device_list || !device_list.length) {
    throw new Error('no Chromecast devices discovered on LAN')
  }
  else {
    const host = device_list[0].address
    ondeviceup(host)
  }
}).catch((error) => {
  console.error(error)
})

// -----------------------------------------------------------------------------
