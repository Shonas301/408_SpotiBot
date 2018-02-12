/*
* This example shows how to search for a track. The endpoint is documented here:
* https://developer.spotify.com/web-api/search-item/
* Please note that this endpoint does not require authentication. However, using an access token
* when making requests will give your application a higher rate limit.
*/

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQDkUTqsz7Y46WJjAWsz25RSgZ5RcIorwDlJ7uAPvne5o-0EvF4_zjYTmyp12HvEV2lf9GPMCUZbxDH6bnDdfk8G3JCc-EwRtQHtusX4ZL0OjM8_Wu3hlJerHrEjx2l6wb4BbVQ0RRpkUf82y8bLD1aiCcA8v0e1mTj5wMF3Vz_UR9Enxw3wvzZSNv5NvHc1TuRl9q4fEmPFzJhWb2cg30NcIEHg6Bk41dBl8fw1lIWO0w2IKdcaJfwXXLk');

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
                console.log(data.body.external_urls.spotify)
                return data.body.external_urls.spotify;
            }).catch(function (err) {
                console.log('Something went wrong!', err);
            });
    }).catch(function (err) {
        throw err;
    })
}

/*
createPlaylist("testing").then(function(data){
    console.log(data)
});

getTopTracks().then(function(data){
    var songs = []
    data.map(function(t) {
        songs.push(t)
    })
    console.log(songs)
})
*/

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

getTopArtists().then(function(data){
    console.log(data)
})