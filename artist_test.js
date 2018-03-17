var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken('BQApyZIH0D60-C3hppsROVv3mHDXXtJbpee0HOtJfUzqo-5kCExuiEmMTf3CiRr7ob-VrNRK4ZFIy6_nsIj7SI3wfrM31KxoE2Zk_0WnQ_MlwcjOnrG4nIY4JngZ4fEnpVl6C5TrsRGGRxEiu1TbTbrdHbotwM0f7ZJvMtXXzXFgIhRDxXcf--n5oeCcF4vWZ2EuPxKSwAqpdgacTep3MRKQ6mSqUDpzdbHQWg_s4_4N7Sr6QXQ_wMs6SyBZ3-_YDIJncOLaLTs');

// takes a name of artist in the format 'Hayley Kiyoko' and searches for the artist
//returns the first result's artist id (should be accurate almost all the time)
function searchForArtist(query) {
	return new Promise((resolve, reject) => {
		var result
		spotifyApi.searchArtists(query).then(function(data) {
			//console.log(data)
			result = data.body.artists.items[0].id;
			console.log("here: " + result)
		}, function(err) {
			console.log(err)
		}).then(function() {
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
			searchForArtist(artist_array[index]).then(function(data) {
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
		}).then(function(data) {
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
		getArtistIDArray(artist_array).then(function(artist_id_array) {
			console.log('artist array is: ' + artist_id_array)
			getPlaylist(artist_id_array).then(function(playlist) {
				return resolve(playlist);
			})
		}).catch(function (err) {
			console.error(err)
		});
	});
}

//tests these functions
playlistFromArtists('Lady Gaga, Halsey').then(function(data) {
	console.log(data) //uncomment this line to get result playlist
})