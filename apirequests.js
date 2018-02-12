/*
* This example shows how to search for a track. The endpoint is documented here:
* https://developer.spotify.com/web-api/search-item/
* Please note that this endpoint does not require authentication. However, using an access token
* when making requests will give your application a higher rate limit.
*/

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQB9vhsmggEdecU7KeSFHUBPo63EF5IkIotxosB4b6oBQwvfaMAkb5YyrpJC2rEWGvA5wOukN_vgPHMQY4drO-VBV0b100haGnr-qmdsUYdz8PhBS7LsHnTIn6W_btSNp3M53L0UKrAYxPZqrVkWk2-LMH222mZH_6dY6NRF3ehGh2JWrOIMQVXKFz2zCqLggHySg-Jr6IcuJfzvKrbG9l0q_1aRf8QehFV4ni6KwqkW6ryviHq_EotSAg');

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