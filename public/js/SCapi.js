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
						$('body').html('NETWORK COMMUNICATION POOPERSNITZEL');
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
	SoundCloudAPI.loadTrack = function(song) {
		songId = $(song).attr('soundcloudid');
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
		SoundHub.PlaylistApp.makeThisTrackCurrent(song);
	};
	SoundCloudAPI.playTrack = function(song) {
		songId = $(song).children(':first').attr('soundcloudid');
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
		SoundHub.PlaylistApp.makeThisTrackCurrent(song);
		$("#progressBar").slider("value", 0);
		$("#progressBar").progressbar({
			value: false
		});
	};

	return SoundCloudAPI;

}();