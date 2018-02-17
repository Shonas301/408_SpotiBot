/*
* This example shows how to search for a track. The endpoint is documented here:
* https://developer.spotify.com/web-api/search-item/
* Please note that this endpoint does not require authentication. However, using an access token
* when making requests will give your application a higher rate limit.
*/

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQCZgOTUG8xhKljLbspAZYmgA-Bmpge80eDjynuDTXXzEK1Tsyf5tJ9ugfy7tj1YhT1z-zePqKc3L3kG6EL6zb7BHJzAgsh1ucSnjdNAoJcRjgvo6KictCpxhnLc4tBr_XETlA3MsJYHi0c9cJ-cdeNS7NraRYgReRSQ5wxRYnEYHBmdcanEarjd19Msgn47R8Rcc89C1j2HUJ6E477Xt3N91FUBNaSZwOGGPHyyvZ7SiWpacGMLSgdD-A');

// Example get top 5 tracks
function getTopTracks() {
    return new Promise((resolve, reject) => {
        spotifyApi.getMyTopTracks({
            limit: 25
        }).then(function (data) {
            return resolve(data.body.items);
        }).catch(function (err) {
            console.error(err)
            reject(err)
        });
    });
}


// Example get top 5 artists (Using for Genre Stats)
function getTopArtists() {
    return spotifyApi.getMyTopArtists({
        limit: 5
    }).then(function (data) {
        return data.body.items
    }).catch(function (err) {
        console.error(err)
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
                    return resolve(data.body);
                }).catch(function (err) {
                    return reject(err);
                });
        }).catch(function (err) {
            return reject(err);
        })
    });
}

/*
var tracks = ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"];
// Create a playlist, then add the songs
createPlaylist("test playlist").then(function(data) {
    console.log(data)
    //addTracksToPlaylist(data.id, tracks);
}).catch((err) => {
    throw err;
});
*/

getTopKey().then((data) => {
    console.log("top key is = " + data);
});

var pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'A♭', 'A', 'B♭', 'B'];

// Returns a promise which contains the most common key
function getTopKey() {
    return new Promise((resolve, reject) => {
        getTopTracks().then((data) => {
            var keys = [];
            var promises = data.map((track) => {
                // return an array of promises getting an audio track keys
                return spotifyApi.getAudioFeaturesForTrack(track.id).then((res) => {
                    keys.push(res.body.key);
                }).catch((err) => {
                    throw err;
                });
            })

            Promise.all(promises).then(() => {
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
                //console.log("Most Common Key is %s", pitch_classes[mostFrequent]);
                resolve(pitch_classes[mostFrequent]);
            })
        });
    });
}