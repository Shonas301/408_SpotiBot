var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQApyZIH0D60-C3hppsROVv3mHDXXtJbpee0HOtJfUzqo-5kCExuiEmMTf3CiRr7ob-VrNRK4ZFIy6_nsIj7SI3wfrM31KxoE2Zk_0WnQ_MlwcjOnrG4nIY4JngZ4fEnpVl6C5TrsRGGRxEiu1TbTbrdHbotwM0f7ZJvMtXXzXFgIhRDxXcf--n5oeCcF4vWZ2EuPxKSwAqpdgacTep3MRKQ6mSqUDpzdbHQWg_s4_4N7Sr6QXQ_wMs6SyBZ3-_YDIJncOLaLTs');

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
playlistFromSongs('Just Dance - Lady Gaga, Strange Love - Halsey, Hold My Girl - George Ezra').then(function(data) {
	console.log(data) //uncomment this line to get result playlist
})