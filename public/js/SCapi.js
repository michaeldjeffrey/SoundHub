SC.initialize({
	client_id: "d945fc936728c08f4e2b720cc5998fd9"
});

SoundHub.SoundCloudAPI = function(){

	var SoundCloudAPI = {};

	var currentGenre;

	SoundCloudAPI.searchByGenre = function(genre) {
		currentGenre = genre;
			SC.get('/tracks', {genres: genre, limit: 15},
				function(tracks, error) {
					if (error) {
						alert("Error: " + error.message);
					}
					SoundHub.ResultsApp.initializeLayout(tracks, genre);
				}
			);
	};

	SoundCloudAPI.moreSongs = function(page_size, page_offset){
		SC.get('/tracks', {
			genres: currentGenre,
			limit: page_size,
			offset: page_offset
		},
		function(tracks) {
			SoundHub.ResultsApp.addSongs(tracks);
		});
	};
	SoundCloudAPI.loadTrack = function(songId) {
		SC.stream('/tracks/'+songId, function(sound) {
			$("audio").attr('src', sound.url);
			$("audio").attr('scid', songId);
			SoundHub.PlaylistApp.makeThisTrackCurrent(songId);
		});
	} 
	SoundCloudAPI.playSong = function(songId) {
		SC.stream('/tracks/'+songId, function(sound) {
			$("audio").attr('src', sound.url);
			$("audio").attr('scid', songId);
			SoundHub.AudioPlayer.togglePlayPause();
			SoundHub.PlaylistApp.makeThisTrackCurrent(songId);
		});
	};

	return SoundCloudAPI;

}();