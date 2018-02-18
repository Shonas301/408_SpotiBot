/*
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()), // creates express http server
  fs = require('fs'),
  privateKey = fs.readFileSync('encryption/spotibot.tech.key', 'utf8'),
  privateCert = fs.readFileSync('encryption/spotibot_tech.crt', 'utf8'),
  privateCA = fs.readFileSync('encryption/spotibot_tech.ca-bundle', 'utf8'),
  PAGE_ACCESS_TOKEN = fs.readFileSync('encryption/pageaccess.token', 'utf8'),
  credentials = {
    ca: privateCA,
    key: privateKey,
    cert: privateCert
  },
  mongoUrl = "mongodb://localhost:27017/",
  dbDriver = require('./mongodriver.js'),
  MongoClient = require('mongodb').MongoClient,
  SpotifyWebApi = require('spotify-web-api-node'),
  pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];

var clientID = fs.readFileSync('encryption/client.id', 'utf8').replace(/\s/g, '');
var clientSecret = fs.readFileSync('encryption/client.secret', 'utf8').replace(/\s/g, '');
var db;

var http = require('http');
http = http.createServer(app);
var https = require('https');
https = https.createServer(credentials, app);
var spotifyApi;
// Create connection to the mongo server, and start the server
MongoClient.connect(mongoUrl, function (err, database) {
  if (err) throw err;
  db = database.db("users");
  //initialize api connection
  spotifyApi = new SpotifyWebApi({
    clientId: clientID,
    clientSecret: clientSecret,
    redirectUri: 'https://spotibot.tech/clientAuth'
  });
  //standard http listen
  http.listen(8080, '172.31.46.168');
  //standard https listen
  //https.listen(443, '172.31.46.168');

  console.log("HTTP and HTTPS running with database");
});

app.get('/', (req, res) => {
  res.send("Welcome to SpotiBot");
});

app.post('/clientAuth', (req, res) => {
  console.log(req);
  res.status(200).send('EVENT_RECIEVED');
});

app.get('/clientAuth', (req, res) => {
  var code = req.query.code;
  console.log(req);
  var sender_psid = req.query.state;
  var response = { 'text': "something wasn't initialized" };
  var rep = ""
  spotifyApi.authorizationCodeGrant(code)
    .then(function (data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      var time = new Date();
      time.setSeconds(time.getSeconds() + data.body['expires_in']);

      var user = {
        id: sender_psid,
        expires_at: time,
        access_token: data.body['access_token'],
        refresh_token: data.body['refresh_token']
      }

      dbDriver.addUser(db, user);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      response = {
        'text': "Great! Thanks for logging in!"
      }
      //TODO Add database storage
    }, function (err) {
      response = {
        'text': "Oops, I'm sorry there was an error, why don't you try emailing us at admin@spotibot.tech!"
      }
      console.log('Something went wrong!', err);
      reject(err);
    }).then(function () {
            callSendAPI(sender_psid, response) // sends response text "Great! Thanks ..."
    }).then(function () {
      response = {
        "text": `
                Type "playlist" to begin creating a playlist or "stats" to begin generating your various listening statistics."
            `
      }
    }).then(function () {
      setTimeout(function () {callSendAPI(sender_psid, response);},500) // sends response explaining how to give SpotiBot arguments
    }).then(function () {
      var rep = `
        <script type="text/javascript">
        if (window.addEventListener) { // Mozilla, Netscape, Firefox
          window.addEventListener('load', WindowLoad, false);
        } else if (window.attachEvent) { // IE
          window.attachEvent('onload', WindowLoad);
        }

      function WindowLoad(event) {
        window.close()
      }
        </script>`

      res.send(rep);
    });
});

app.post('/', (req, res) => {
  console.log(req);
  res.status(200).send('EVENT_RECEIVED');

});
// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {


  const VERIFY_TOKEN = "MY408DUDES";

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    //
    // TODO
    //var loggedIn = db.contains(sender_psid)
    if (received_message.text.toLowerCase() === "login") {
      handleLoginRequest(sender_psid)
      var url = getLoginUrl(sender_psid);
      response = {
        "text": `Great! Here is a link to get you started! \n\n "${url}"`
      }
    }
    else if (received_message.text.toLowerCase().substring(0, 12) === "top playlist") {
      var 
        res = received_message.text.split(" "),
        term = "";
      if (res[2] === "short") {
        term = "short_term"
        //response = { "text": `You sent command: "${received_message.text}".` }
        /*
        var songs = []
        var songlist = []
        var songlistUris = []
        var prettyString = "";
        var playlistObject = [];
        var playlistUrl = "";
        var playlistId = "";
        getTopSongs(50, 0, "short_term").then(function (data) {
          data.map(function (song) {
            songs.push(song)
          });
          console.log('bout to print some songs')
          for (var i = 0; i < 50; i++) {
            songlist.push(songs[i].name)
            songlistUris.push(songs[i].uri)
            prettyString = prettyString + "\t" + songs[i].name + "\n"
          }
        }).then(function () {
          response = { "text": `Your top songs are:\n "${prettyString}"` }
          callSendAPI(sender_psid, response);
        }).then(function() {
          var date = new Date()
          var
            month = date.getMonth()+1,
            day = date.getDate(),
            year = date.getFullYear();
          var dateString = month+"/"+day + "/"+ yer
          createPlaylist("Top Tracks: " + dateString).then(function (data) {
            data.map(function(playlist) {
              playlistObject.push(playlist)
            });
            console.log(playlistObject)
            playlistUrl = playlistObject[0].external_urls.spotify
            console.log(playlistUrl);
            playlistId = playlistObject[0].id
            console.log(playlistId);
          }).then(function () {
            addTracksToPlaylist(playlistId, songlistUris);
          }).then(function() {
            response = {"text": `Here's the playlist: \n ${playlistUrl}`}
            callSendAPI(sender_psid, response)
          });
        });
        */

        //response = {"text": getTopSongs(50, 0, "short_term").then(function(data) {data.toString()}); }
      }
      else if (res[2] === "long") {
        term = "long_term"
        response = { "text": `You sent command: "${received_message.text}".` }
      } else if (res[2] === "medium") {
        term = "medium_term"
        response = { "text": `You sent command: "${received_message.text}".` }
      } else {
        response = {
          "text": `You sent the message: "${received_message.text}".`
        }
      }
      handleTopPlaylist(sender_psid)
    }

    else if (received_message.text.toLowerCase() === "genre") {
      response = { "text": `You sent command: "${received_message.text}".` }
    } else if (received_message.text.toLowerCase() === "key") {
      getTopKey().then((key) => {
        response = { "text": `The most common musical key in your top songs is: \n ${key}` }
        callSendAPI(sender_psid, response);
      });
    } else if (received_message.text.toLowerCase() === "happiest") {
      response = { "text": `You sent command: "${received_message.text}".` }

    } else if (received_message.text.toLowerCase() === "saddest") {
      response = { "text": `You sent command: "${received_message.text}".` }

    } else if (received_message.text.toLowerCase() === "slowest") {
      response = { "text": `You sent command: "${received_message.text}".` }

    } else if (received_message.text.toLowerCase() === "fastest") {
      response = { "text": `You sent command: "${received_message.text}".` }

    }
    /*else if (!loggedIn) {
      response = {
        "text": "I'm sorry we haven't received your info yet, try logging in with the command: \"login\""
      }
    }*/
    else {
      response = { "text": `You sent the message: "${received_message.text}".` }
    }
    console.log('${received_message.text}')
  }
  /*else if (recieved_message.text === "login") {
    authToken = oAuth(recieved_message.text)
  }*/
  // Send the response message
}

function handleLoginRequest(sender_psid) {
  var 
    url = getLoginUrl(sender_psid),
    response = {
    "text": `Great! Here is a link to get you started \n\n ${url}`
    };
  callSendAPI(sender_psid, response)
}

function handleTopPlaylist(sender_psid, term) {
  //Declare variables in score that are populated throughout the promise chaining 
  var 
    songs = [],
    songlist = [],
    songlistUris = [],
    prettyString = "",
    playlistObject = [],
    playlistUrl = "",
    playlistId = "",
    response = "";

  //Call the API for their 50 top songs, can be changed to a variable number later
  //TODO Pagination
  //getTopSongs(50, 0, "short_term").then(function (data) {
  getTopSongs(50, 0, term).then(function (data) {
    //Because of ASynchroninity we force js to evaluate and poplate songs first so data doesn't
    //fall out of scope and lose object properties, pretty bizarre but it works
    data.map(function (song) {
      songs.push(song)
    });
    //TODO variable number must be changed here as well if we paginate
    for (var i = 0; i < 50; i++) {
      songlist.push(songs[i].name)
      songlistUris.push(songs[i].uri)
      prettyString = prettyString + "\t" + songs[i].name + "\n"
    }
  }).then(function () {
    response = { "text": `Your top songs are:\n "${prettyString}"` }
    callSendAPI(sender_psid, response);
  }).then(function() {
    var 
      date = new Date(),
      month = date.getMonth()+1,
      day = date.getDate(),
      year = date.getFullYear(),
      dateString = month+"/"+ day + "/"+ year;
    //Call the Promis to create the playlist needed with the title in the format:
    //Top Tracks: XX/XX/XXXX
    createPlaylist("Top Tracks: " + dateString).then(function (data) {
      data.map(function(playlist) {
        playlistObject.push(playlist)
      });
      console.log(playlistObject)
      playlistUrl = playlistObject[0].external_urls.spotify
      console.log(playlistUrl);
      playlistId = playlistObject[0].id
      console.log(playlistId);
    }).then(function () {
      //Add all the tracks in songlistUris to the playlist
      addTracksToPlaylist(playlistId, songlistUris);
    }).then(function() {
      //finally send the message it's been completed
      response = {"text": `Here's the playlist: \n ${playlistUrl}`}
      callSendAPI(sender_psid, response)
    });
  });
}

function getLoginUrl(sender_psid) {
  var scopes = ['user-read-private', 'user-read-email', 'user-top-read', 'user-library-read', 'playlist-modify-private', 'user-read-currently-playing', 'user-read-recently-played', 'user-follow-modify', 'user-follow-read', 'user-library-modify', 'playlist-modify-public', 'playlist-read-collaborative'],
    redirectUri = 'https://spotibot.tech/clientAuth',
    clientId = clientID,
    state = '10';
  var str = spotifyApi.createAuthorizeURL(scopes, sender_psid);
  return str;
};

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

//function to throw user's top 25 played songs in a list
// offset is optional (and not necessary for our implementation
// returns a promise which contains the top user's songs
function getTopSongs(limit, offset, time_range) {
  return new Promise((resolve, reject) => {
    spotifyApi.getMyTopTracks({
      limit: limit,
      offset: offset,
      time_range: time_range
    }).then(function (data) {
      return resolve(data.body.items);
    }).catch(function (err) {
      return reject(err)
    });
  });
}

// Example get top 5 artists (Using for Genre Stats)
function getTopArtists(limit, offset, time_range) {
  return new Promise((resolve, reject) => {
    spotifyApi.getMyTopArtists({
      limit: limit,
      offset: offset,
      time_range: time_range
    }).then(function (data) {
      return resolve(data.body.items)
    }).catch(function (err) {
      return reject(err)
    });
  });
}
/* !! PROBLEM !!  There is no 'genre' attribute in a track's
 'audio_features' list. Genres can only be extracted from
 full album objects, so singles cannot be used when determining
 a user's top genre.
*/

// @param timeframe: either 1 or 6 (number of months)
function getTopGenre(timeframe) {
  // TODO
  // parse the received_message

  if (timeframe != 1 && timeframe != 6) {
    return; // not sure how we're handling error handling yet
  }

  top50List = getTopSongs(50, 0, timeframe); // default to 50 for stat purposes

  // make sure to only use tracks that are associated with albums
  // or else the logic will fail & also might crash yoloswag
  for (var i = 0; i < 50; i++) {
    // check for album info
    /* unfortunately we can't go from track->album->genre, because
     * the genre is listed only in the album (full) object, which
     * is not in the scope of the track object. the track objects
     * only associate the album name, not the full object (i think)
     */
  }

}

// Returns a promise containing the link to the users playlist
function createPlaylist(playlist_name) {
  // Get the user's id
  var getMe = spotifyApi.getMe()
    .then(function (data) {
      return data.body.id;
    }).catch(function (err) {
      throw err;
    })

  // Create a playlist using the user's id
  return new Promise((resolve, reject) => {
    getMe.then(function (user_id) {
      // Create a public playlist
      spotifyApi.createPlaylist(user_id, playlist_name, { 'public': true })
        .then(function (data) {
          console.log(data)
          return resolve([data.body]);
        }).catch(function (err) {
          return reject(err);
        });
    }).catch(function (err) {
      return reject(err);
    })
  });
}

// Add an array of songs to a playlist
function addTracksToPlaylist(playlist_id, tracks) {
  // Get the user's id
  var promise = spotifyApi.getMe()
    .then(function (data) {
      return data.body.id;
    }).catch(function (err) {
      throw err;
    })

  // Add tracks to a playlist
  promise.then(function (user_id) {
    spotifyApi.addTracksToPlaylist(user_id, playlist_id, tracks)
      .then(function (data) {
        console.log('Added tracks to playlist!');
      }, function (err) {
        console.log('Something went wrong!', err);
      });
  });
}

// Returns a promise which contains the most common key
function getTopKey() {
    return new Promise((resolve, reject) => {
        getTopSongs(25,0,"short_term").then((data) => {
            var track_ids = [];
            for (var i = 0; i < data.length; i++) {
                track_ids.push(data[i].id)
            }
            var keys = [];
            spotifyApi.getAudioFeaturesForTracks(track_ids).then((res) => {
                res.body.audio_features.map((item) => {
                    keys.push(item.key)
                });
            }).then(() => {
                console.log(keys);
                // Find the most common item in the list
                var counts = {};
                var compare = 0;
                var mostFrequent;
                keys.map((item) => {
                    if (counts[item] === undefined) {
                        counts[item] = 1
                    } else {
                        counts[item] += 1
                    }
                    if (counts[item] > compare) {
                        compare = counts[item]
                        mostFrequent = item
                    }
                });
                console.log("Most Common Key is %s", pitch_classes[mostFrequent]);
                resolve(pitch_classes[mostFrequent]);
            }).catch((err) => {
                throw err;
            });
        });
    });
}
