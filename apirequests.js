/*
* This example shows how to search for a track. The endpoint is documented here:
* https://developer.spotify.com/web-api/search-item/
* Please note that this endpoint does not require authentication. However, using an access token
* when making requests will give your application a higher rate limit.
*/

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQAIfQ2n4HuNL971xQ-ILGsvzZmyjgzfFVv8m00UzUnhIlLeXkhxkGApAwxCokIh8qjlFyxPpp8HR3DM3AbcXkonFMBRfPq65_cROMVsWAeF3VoJq5Zw38-9m9WM3ECkrmtUxl8O0xEDlhyC_3aDWhZM_0qXNx5mOLUI0pNrrc903qE3xt2DWfUiMIqmx49ENhkQCqeYzfDIDFIiAoxrSUdCeC_GRzwdurjc6YsoYjNVjbE3LivDY8ifMEk');

// Example get top 5 tracks
function getTopTracks() {
    return spotifyApi.getMyTopTracks({
        limit: 5
    }).then(function (data) {
        return data.body.items
    }).catch(function (err) {
        console.error(err)
    });
}

// Returns a promise containing the link to the users playlist
function createPlaylist(playlist_name) {
    // Get the user's id
    var promise = spotifyApi.getMe()
        .then(function (data) {
            return data.body.id;
        }).catch(function (err) {
            throw err;
        })

    // Create a playlist using the user's id
    return promise.then(function (user_id) {
        // Create a public playlist
        spotifyApi.createPlaylist(user_id, playlist_name, { 'public': true })
            .then(function (data) {
                console.log('Created playlist!');
                console.log(data.body)
                return data.body;
            }).catch(function (err) {
                console.log('Something went wrong!', err);
            });
    });
}

createPlaylist("test playlist").then(function(data) {
    console.log(data)
});
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
        spotifyApi.addTracksToPlaylist(user_id, playlist_id, ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
            .then(function (data) {
                console.log('Added tracks to playlist!');
            }, function (err) {
                console.log('Something went wrong!', err);
            });
    });
}