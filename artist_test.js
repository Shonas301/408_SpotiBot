var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQAlECIpkrHKrGFC7wkGAUhtX3ePAt7s5QrWLzCWv_0ojOSGY6sB8Vb433pwUBtyVPeKorxD1uCICble-Y0GGv4G5F3wpn3ZwvIDpx2used0OfagcjWDZ-v_AWgqQMovaehinMWgubfcrBKA70lktBSWBRna_s6-rqELQ_qOf5erZu6u6omeS0M_DY9cRwdHIDGefkOQSp-472WtFISAISoHKqWwdOaA11yuapc-n8rRrDKPhi81LjmN1sJTJPKs1fCimQdN');
// takes a name of artist in the format 'Hayley Kiyoko' and searches for the artist
//returns the first result's artist id (should be accurate almost all the time)
function searchForArtist(query) {
	return new Promise((resolve, reject) => {
		var result
		spotifyApi.searchArtists(query).then(function (data) {
			//console.log(data)
			result = data.body.artists.items[0].id;
			console.log("here: " + result)
		}, function (err) {
			console.log(err)
		}).then(function () {
			return resolve(result)
		})
	});
}


//takes in an array of artist names from user and returns an array of artist IDs
//PROBLEM: I can't get it to return a list of all the song ID's 
//right now it adds the first artist ID to the array, returns the array and then gets the IDS for the rest of the artists
function getArtistIDArray(artist_array) {
	var artist_id_array = []
	return new Promise((resolve, reject) => {
		for (var index = 0; index < artist_array.length; ++index) {
			searchForArtist(artist_array[index]).then(function (data) {
				artist_id_array.push(data)
				resolve(artist_id_array);
			})
		}
	});
	return artist_id_array;
}


//takes in array of artist id's and returns and object that is a list of tracks in recommended playlist
//TODO list could be converted to song uri's to work with creating a playlist that we have in app.js
function getPlaylist(artists) {
	return new Promise((resolve, reject) => {
		spotifyApi.getRecommendations({
			min_energy: 0.4,
			seed_artists: artists,
			min_popularity: 50
		}).then(function (data) {
			return resolve(data.body.tracks)
		})
	});
}


//function takes in a string from user like this 'Lady Gaga, Halsey'
//returns a playlist object
//TODO or here list could be converted to song uri's to work with creating a playlist that we have in app.js
function playlistFromArtists(input) {
	return new Promise((resolve, reject) => {
		var artist_array = input.split(',');
		getArtistIDArray(artist_array).then(function (artist_id_array) {
			console.log('artist array is: ' + artist_id_array)
			getPlaylist(artist_id_array).then(function (playlist) {
				return resolve(playlist);
			})
		}).catch(function (err) {
			console.error(err)
		});
	});
}

var artists = 'Muse'
// If this returns true that means the playlist was added to the users account
buildArtistPlaylists(artists).then(res => {
	console.log(res)
})

// This function combines everything and generates a playlist, and returns a promise contiaining the url
function buildArtistPlaylists(artists) {
	return new Promise((resolve, reject) => {
		playlistFromArtists(artists).then(function (tracks) {
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
				return spotifyApi.createPlaylist(user_id, artists, { 'public': true })
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