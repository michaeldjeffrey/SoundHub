SC.initialize({
	client_id: "d945fc936728c08f4e2b720cc5998fd9"
});

function searchByGenre(genre, thisItem) {
	SC.get('/tracks?limit=10', { genres: genre},
	    function(tracks) {
	    	SoundHub.ResultsApp.initializeLayout(tracks, genre);
	    	// fillResults(tracks, genre)
	    }
	);
}