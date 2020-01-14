// -----------------------------------------------------------------------------
// WebCast app
//   https://github.com/warren-bank/Android-WebCast/blob/05-chromecast-receiver-app/notes.txt#L82
//   https://github.com/warren-bank/Android-WebCast/blob/05-chromecast-receiver-app/CastReceiver/receiver.html#L6
//   https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js

const $configs = {
  device: {
    name: 'Living Room (Samsung)'
  },
  app: {
    id: '6BFED418'
  }
}

// -----------------------------------------------------------------------------
// https://github.com/thibauts/node-castv2-client
// https://github.com/thibauts/node-castv2-client/blob/master/lib/senders/default-media-receiver.js
// https://github.com/xat/castv2-youtube/blob/master/Youtube.js

const util                 = require('util')
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver

function WebCastReceiver(client, session) {
  DefaultMediaReceiver.apply(this, arguments)
}

WebCastReceiver.APP_ID = $configs.app.id

util.inherits(WebCastReceiver, DefaultMediaReceiver)

// -----------------------------------------------------------------------------
// https://github.com/thibauts/node-castv2-client

const Client = require('castv2-client').Client

function ondeviceup(host) {

  const client = new Client()

  client.connect(host, function() {
    console.log('connected, launching app ...')

    client.launch(WebCastReceiver, function(err, player) {
      // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.MediaInfo#contentId
      // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.MediaInfo#contentType
      // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.MediaInfo#streamType
      // https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media#.StreamType
      //   enum StreamType {'BUFFERED','LIVE','OTHER'}
      const media = {
        contentId:   'https://ipfs.io/ipfs/QmdpAidwAsBGptFB3b6A9Pyi5coEbgjHrL3K2Qrsutmj9K/master.m3u8',
        contentType: 'application/x-mpegURL',
        streamType:  'BUFFERED'
      }

      player.on('status', function(status) {
        console.log('status broadcast playerState=%s', status.playerState)
      })

      console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId)

      player.load(media, { autoplay: true }, function(err, status) {
        console.log('media loaded playerState=%s', status.playerState)
      })

    })
    
  })

  client.on('error', function(err) {
    console.log('Error: %s', err.message)
    client.close()
  })

}

// -----------------------------------------------------------------------------
// https://github.com/futomi/node-dns-sd

const mDnsSd = require('node-dns-sd')

mDnsSd.discover({
  name: '_googlecast._tcp.local'
}).then((device_list) =>{
  let device

  if (!device_list || !device_list.length) {
    throw new Error('no Chromecast devices discovered on LAN')
  }

  if (!$configs.device.name) {
    device = device_list[0]
  }
  else {
    device = device_list.find(el => ((el instanceof Object) && el.familyName) ? (el.familyName === $configs.device.name) : false)

    if (!device) {
      throw new Error('specific Chromecast device not discovered on LAN')
    }
  }

  if (!((device instanceof Object) && device.address)) {
    throw new Error('Chromecast device discovered on LAN does not identify its IP address')
  }
  else {
    const host = device.address
    ondeviceup(host)
  }
}).catch((error) => {
  console.error(error)
})

// -----------------------------------------------------------------------------
