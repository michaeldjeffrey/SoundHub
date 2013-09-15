SC.initialize({
	client_id: "d945fc936728c08f4e2b720cc5998fd9"
});

RETRY_LIMIT = 3;
CURRENT_TRY = 0;

SoundHub.SoundCloudAPI = function(){

	var SoundCloudAPI = {};

	var currentGenre;

	SoundCloudAPI.searchByGenre = function(genre) {
		var currentGenre = genre;
		SC.get('/tracks', {genres: genre.toLowerCase(), limit: 15, filter: 3},
		function(tracks, error) {
			if (error && CURRENT_TRY !== RETRY_LIMIT) {
				CURRENT_TRY++;
				setTimeout(SoundCloudAPI.searchByGenre(currentGenre), 300);
				console.log("Error: ", error.message);
			} else if(CURRENT_TRY == RETRY_LIMIT) {
				CURRENT_TRY = 0
				SoundHub.ResultsApp.initializeLayout('failed', currentGenre);
			} else {
			CURRENT_TRY = 0
			SoundHub.ResultsApp.initializeLayout(tracks, currentGenre);
			}
		}
	);
	};

	SoundCloudAPI.moreSongs = function(page_size, page_offset){
		SC.get('/tracks', {
			genres: currentGenre.toLowerCase(),
			limit: page_size,
			offset: page_offset,
			filter: 3
		}, function(tracks, error) {
			if(error){
				setTimeout(SoundCloudAPI.moreSongs(page_size, page_offset), 300);
				console.log("trying again in 300 milliseconds with same settings")
			} else {
			SoundHub.ResultsApp.addSongs(tracks);
			}
		});
	};
	SoundCloudAPI.loadTrack = function(songId) {
		SC.streamStopAll();
		SoundHub.AudioPlayer.audio = SC.stream('/tracks/'+songId, {
			useEQData: true,
			usePeakData: true
		});
		SoundHub.AudioPlayer.audio.play({
			whileplaying: function() {
				SoundHub.AudioPlayer.updateProgress();
			},
			onfinish: function() {
				SoundHub.AudioPlayer.playNextTrack();
			}
		});
		SoundHub.AudioPlayer.audio.pause();
		SoundHub.AudioPlayer.audio.setVolume($('.volume-slider').slider('option', 'value'));
		SoundHub.PlaylistApp.makeThisTrackCurrent(songId);
	};
	SoundCloudAPI.playTrack = function(songId) {
		SC.streamStopAll();
		SoundHub.AudioPlayer.audio = SC.stream('/tracks/'+songId, { 
			useEQData: true,
			usePeakData: true
		});
		SoundHub.AudioPlayer.audio.play({
			whileplaying: function() {
				SoundHub.AudioPlayer.updateProgress();
			},
			onfinish: function() {
				SoundHub.AudioPlayer.playNextTrack();
			}
		});
		SoundHub.AudioPlayer.audio.setVolume($('.volume-slider').slider('option', 'value'));
		SoundHub.PlaylistApp.makeThisTrackCurrent(songId);
		$("#progressBar").slider("value", 0);
		$("#progressBar").progressbar({
			value: false
		});
	};

	return SoundCloudAPI;

}();
