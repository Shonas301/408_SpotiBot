/*
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()), // creates express http server
  fs = require('fs'),
  privateKey = fs.readFileSync('encryption/spotibot.tech.key', 'utf8'),
  privateCert = fs.readFileSync( 'encryption/spotibot_tech.crt', 'utf8' ),
  privateCA = fs.readFileSync('encryption/spotibot_tech.ca-bundle', 'utf8'),
  credentials = {
    ca: privateCA,
    key: privateKey, 
    cert: privateCert },
  mongoUrl = "mongodb://localhost:27017/",
  dbDriver = require('./mongodriver.js'),
  MongoClient = require('mongodb').MongoClient,
  SpotifyWebApi = require('spotify-web-api-node');

var clientID = fs.readFileSync('encryption/client.id', 'utf8');
var clientSecret = fs.readFileSync('encryption/client.id','utf8');
var db;

var http = require('http');
http = http.createServer(app);
var https = require('https');
https = https.createServer(credentials,app);
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
  var scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'https://spotibot.tech/clientAuth',
    clientId = clientID,
    state = '10';
  var str = spotifyApi.createAuthorizeURL(scopes, 10);
  res.send("hello World " + str);
});

app.post('/clientAuth', (req,res) => {
  console.log(req);
  res.status(200).send('EVENT_RECIEVED');
});

app.get('/clientAuth' (req, res) => {
  res.send("mayb worked");
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
    if (recieved_message.text === "login") {
      getLoginUrl(sender_psid);
    }
    response = {
      "text": `You sent the message: "${received_message.text}".`
    }
    console.log('${recieved_message.text}')
  }
  /*else if (recieved_message.text === "login") {
    authToken = oAuth(recieved_message.text)
  }*/
  // Send the response message
  callSendAPI(sender_psid, response);
}

function getLoginUrl(sender_psid) {
  var authorizeURL = spotifyApi.createAuthorizeUrl(['user-read-private', 'user-read-email', sender_psid], sender_psid);
  console.log(authorizeURL);
  res.status(200).send(authorizeURl + "\n");
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

//function to throw user's top 50 played songs in a list
// offset is optional (and not necessary for our implementation)
function getTopSongs(limit, offset, time_range) {
	// TODO (helper function)
	// call the endpoint with the params
	// return array to caller
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

function getTopKey(timeframe) {
    // TODO
    // parse the received_message to get timeframe & args

    if (timeframe != 1 && timeframe != 6) {
        return; // not sure how we're handling error handling yet
    }

    top50List = getTopSongs(50, 0, timeframe);

    // magical sorting shit
    for (var i = 0; i < 50; i++) {
        // syntax is top50List[i].key
    }
}
