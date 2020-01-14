// -----------------------------------------------------------------------------
// https://github.com/thibauts/node-castv2-client

var Client                = require('castv2-client').Client;
var DefaultMediaReceiver  = require('castv2-client').DefaultMediaReceiver;

function ondeviceup(host) {

  var client = new Client();

  client.connect(host, function() {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, function(err, player) {
      var media = {

      	// Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
        contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
        contentType: 'video/mp4',
        streamType: 'BUFFERED', // or LIVE

        // Title and cover displayed while buffering
        metadata: {
          type: 0,
          metadataType: 0,
          title: "Big Buck Bunny", 
          images: [
            { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
          ]
        }        
      };

      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState);
      });

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

      player.load(media, { autoplay: true }, function(err, status) {
        console.log('media loaded playerState=%s', status.playerState);

        // Seek to 2 minutes after 15 seconds playing.
        setTimeout(function() {
          player.seek(2*60, function(err, status) {
            //
          });
        }, 15000);

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
