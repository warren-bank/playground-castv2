// -----------------------------------------------------------------------------
// https://github.com/thibauts/node-castv2-client

var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;

function ondeviceup(host) {

  var client = new Client();

  client.connect(host, function() {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, function(err, player) {
      // CBSN
      //   https://www.cbsnews.com/live/
      var media = {
        contentId:   'https://www.cbsnews.com/common/video/cbsn_header_prod.m3u8',
        contentType: 'application/x-mpegURL',
        streamType:  'LIVE'
      };

      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      player.load(media, { autoplay: true }, function(err, status) {
        console.log('media loaded playerState=%s', status.playerState);
      });

    });
    
  });

  client.on('error', function(err) {
    console.log('Error: %s', err.message);
    client.close();
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
