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

getTopTracks().then(function(data){
    console.log(data)
})

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
