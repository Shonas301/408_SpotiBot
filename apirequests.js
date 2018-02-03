// Just a file to keep track of what we know is written
// insert below

// Sign into FB messenger account
// ???

// Sign into spotify
// ???

// As a user, I want to be able to input a number of months and get a playlist of my top tracks from that time period
    // endpoint: GET https://api.spotify.com/v1/me/top/{type}
    // type: 'tracks' or 'artists'
    /*  query params:
     *      limit:          num of entries returned (1-50)
     *      time_range:     'long_term' (several years of data),
                            'medium_term' (approx. 6 months of data),
                            'short_term' (approx 4 weeks)
     */



// As a user, I want to be able to view what is the most common genre that I listen to
// As a user, I want to be able to view the most common key of the music I listen to
// As a user, I want to be able to see the happiest songs that I listen to
// As a user, I want to be able to see the saddest songs that I listen to
// As a user I want to be able to view the slowest songs that I listen to
// As a user, I want to be able to view the fastest songs that I listen to

    // ^ For these, we will need to pull the top 50 most played songs and
    // store them in a list, running the "audio_features" function on each
    // song to sort them by genre/key/happiness/slowness/fastness.

    /*
       * Get the current user's top tracks based on calculated affinity.
       * @param {Object} [options] Options, being time_range, limit, offset.
       * @param {requestCallback} [callback] Optional callback method to be called instead of the promise.
       * @returns {Promise|undefined} A promise that if successful, resolves into a paging object of tracks,
       *          otherwise an error. Not returned if a callback is given.
       */
      getMyTopTracks: function(options, callback) {
        return WebApiRequest.builder(this.getAccessToken())
          .withPath('/v1/me/top/tracks')
          .withQueryParameters(options)
          .build()
          .execute(HttpManager.get, callback);
    },

    /* Potentially useful code Puja used to store and sort: */
    var multisort = function(sample){
    sample = sample.audio_features;
    window.danceable = sample.slice();
    window.fastest = sample.slice();
    window.happiness = sample.slice();
    window.key = sample.slice();

    window.danceable.sort(function(a,b){
        return parameterCompare(a,b,'danceability');
    });
    window.fastest.sort(function(a,b){
        return parameterCompare(a,b,'tempo');
    });
    window.happiness.sort(function(a,b){
        return parameterCompare(a,b,'valence');
    });
    window.key.sort(function(a,b){
        return parameterCompare(a,b,'key');
    });

    for (var i = 0; i < 50; i++){
        thiskey = window.key[i];
        pitch_counter[thiskey.key]++;
    }
    var max_index;
    var max = 0;
    for (index in pitch_counter){
        if(pitch_counter[index] > max){
            max = pitch_counter[index];
            max_index = index;
        }
    }

    var fastL = [];
    var slowL = [];
    var happyL = [];
    var sadL = [];
    var danceL = [];

    for(var i = 0; i < 10; i++){
        fastL[i] = getTrackByID(window.fastest[i].id);
        slowL[i] = getTrackByID(window.fastest[window.fastest.length - i - 1].id);
        happyL[i] = getTrackByID(window.happiness[i].id);
        sadL[i] = getTrackByID(window.happiness[window.happiness.length - i - 1].id);
        danceL[i] = getTrackByID(window.danceable[i].id);
}
