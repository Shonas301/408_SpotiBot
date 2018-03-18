var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQD9aFV82qOK1l46TjuMb0CNNY20cwPWJCYANXLddhz4XbNjDyEoA24SuYrtCyyQEJcAUTE0pUFzbUAj3MRJXB5Mb8qff3Nhh-W9qlgv7fcT5MpMSq_yeqdD_sKCCtZ1Oy3pRkh9vvy84reCPxeepubAPZRV2kiyXUVIB0vTyxt0KrenS7JIQwxxKgCBtK1mmoqvKGrC0uicBDgSHGSgoDjWNXEfnujwVL4RcwQk7c-dBTaM9gHrlyHsSQK2zR-0cT8Jm0-y');
// takes a name of song and artist in the format "Curious - Hayley Kiyoko" and searches for the song
//returns the first result's song id (should be accurate almost all the time)
function searchForSongByArtist(query) {
	return new Promise((resolve, reject) => {
		var result
		spotifyApi.searchTracks(query).then(function(data) {
			result = data.body.tracks.items[0].id;
			console.log("here: " + result)
		}, function(err) {
			console.log(err)
		}).then(function() {
			return resolve(result)
		})
	});
}

//takes in an array of song names from user and returns an array of song IDs
//PROBLEM: I can't get it to return a list of all the song ID's 
//right now it adds the first song ID to the array, returns the array and then gets the IDS for the rest of the songs
function getSongIDArray(song_array) {
	console.log(typeof song_array)
	var song_id_array = []
	return new Promise((resolve, reject) => {
		for (var index = 0; index < song_array.length; ++index) {
			searchForSongByArtist(song_array[index]).then(function(data) {
				song_id_array.push(data)
				resolve(song_id_array);
			})
		}
	});
	console.log(typeof song_id_array)
	return song_id_array;
}


//takes in array of song id's and returns and object that is a list of tracks in recommended playlist
//TODO list could be converted to song uri's to work with creating a playlist that we have in app.js
function getPlaylist(tracks) {
	return new Promise((resolve, reject) => {
		spotifyApi.getRecommendations({
			min_energy: 0.4, 
			seed_tracks: tracks, 
			min_popularity: 50 
		}).then(function(data) {
			return resolve(data.body.tracks)
		})
	});
}

//function takes in a string from user like this 'Just Dance - Lady Gaga, Strange Love - Halsey'
//returns a playlist object
//TODO or here list could be converted to song uri's to work with creating a playlist that we have in app.js
function playlistFromSongs(input) {
	return new Promise((resolve, reject) => {
		var song_array = input.split(',');
		getSongIDArray(song_array).then(function(song_id_array) {
			console.log('song array is: ' + song_id_array)
			getPlaylist(song_id_array).then(function(playlist) {
				return resolve(playlist);
			})
		}).catch(function (err) {
			console.error(err)
		});
	});
}

//tests these functions
var songs = 'Humble - Kendrick Lamar, Psycho - Muse, Gravity - John Mayer';
buildSongPlaylist(songs).then(res => {
	console.log(res)
}).catch(err => {
	console.log(err)
})

// This function combines everything and generates a playlist, and returns a promise contiaining the url
function buildSongPlaylist(songs) {
	return new Promise((resolve, reject) => {
		playlistFromSongs(songs).then(function (tracks) {
			var song_ids = [];
			for (var i =0; i < tracks.length;i++) {
				song_ids.push("spotify:track:" + tracks[i].id)
			}
			var getMe = spotifyApi.getMe()
				.then(function (data) {
					return data.body.id;
				}).catch(function (err) {
					throw err;
				})

			// Create a playlist using the user's id
			getMe.then(function (user_id) {
				// Create a public playlist
				return spotifyApi.createPlaylist(user_id, songs, { 'public': true })
					.then(function (data) {
						// Return array of playlist_id and user_id
						return [data.body.id, user_id];
					}).catch(function (err) {
						throw err;
					});
			}).then((result) => {
				console.log(result)
				spotifyApi.addTracksToPlaylist(result[1], result[0], song_ids)
					.then((res) => {
						resolve(true)
					}).catch((err) => {
						reject(err);
					})
			}).catch((err) => {
				reject(err);
			})
		})
	})
}