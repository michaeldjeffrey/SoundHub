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

// SC.stream("/tracks/293", function(sound){
// 	console.log('sound loaded', sound)
// 	// $("audio").append("<source src="+sound.url+" type='audio/mpeg'>")
// });

function playSong(songId){
	SC.stream('/tracks/'+songId, function(sound){
		console.log('playing: ' , sound);
		$("audio").attr('src',sound.url);
		$("audio").attr('autoplay','autoplay');
	});
}
