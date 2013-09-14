SoundHub.PlaylistApp = function(){
	var tracks;
	var PlaylistApp = {};
	var currentTrackNum = 0;

	var Track = Backbone.Model.extend({});
	var Tracks = Backbone.Collection.extend({
		model: Track
	});

	var TrackView = Backbone.Marionette.ItemView.extend({
		template: '#tracks_item_template',
		tagName: 'li',
		className: 'songBlock',
		events:{
			'click .albumArt': 'play',
			'click .remove': 'removeSong'
		},
		play: function(e){
			songId = $(e.target).closest('.songBlock').children(':first').attr('id');
			SoundHub.SoundCloudAPI.playTrack(songId);
		},
		removeSong: function(e){
			console.log('remove called');
			tracks.remove(this.model);
		}
	});

	var TracksView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		id: 'playlist',
		template: '#tracks_template',
		itemView: TrackView
	});

	$(function() {
	});

	PlaylistApp.currentTrackInPlaylist = function(){
		if ($('.currentTrack')) {
			return $('.currentTrack').children(':first').attr('id');
		}
	};
	PlaylistApp.nextTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').next()) {
			return $('.currentTrack').next().children(':first').attr('id');
		}
		return false;
	};
	PlaylistApp.previousTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').prev()) {
			return $('.currentTrack').prev().children(':first').attr('id');
		}
		return false;
	};
	PlaylistApp.firstTrackInPlaylist = function() {
		if ($('#playlist .songBlock').first()) {
			return $('#playlist .songBlock').first().children(':first').attr('id');
		}
		return false;
	};
	PlaylistApp.lastTrackInPlaylist = function() {
		if ($('#playlist .songBlock').last()) {
			return $('#playlist .songBlock').last().children(':first').attr('id');
		}
		return false;
	};


	PlaylistApp.addSongToPlaylist = function(song) {
		tracks.add(song);
		if(tracks.length === 1){
			$("#"+tracks.first().get('id')).parent().addClass('currentTrack');
			SoundHub.SoundCloudAPI.playTrack(tracks.first().get('id'));
		}
		PlaylistApp.updatePlaylist();
		SoundHub.AudioPlayer.updatePlayerButtons();
	};

	PlaylistApp.initializeLayout = function(options){
		if (!tracks) {
			tracks = new Tracks();
		}

		var tracksView = new TracksView({
			collection: tracks
		});

		SoundHub.playlistApp.show(tracksView);

		$('#playlist').sortable({
			revert: 77,
			tolerance: "pointer",
			stop: function(e,ui){
				PlaylistApp.updatePlaylist();
				SoundHub.AudioPlayer.updatePlayerButtons();
			}
		});

	};
	PlaylistApp.updatePlaylist = function() {
		console.log("Playing track num: ", currentTrackNum);
		console.log("Updating playlist.");
		var passedCurrent = false;
		$('#playlist .songBlock').each(function(index, element) {
			if (!passedCurrent && $(element).hasClass('currentTrack')) {
				passedCurrent = true;
				currentTrackNum = index+1;
				$(element).removeClass('faded');
			} else {
				if (passedCurrent) {
					$(element).removeClass('faded');
				} else {
					if (!SoundHub.AudioPlayer.repeatEnabled) {
						$(element).addClass('faded');
					} else {
						$(element).removeClass('faded');
					}
				}
			}
		});
	};

	PlaylistApp.makeThisTrackCurrent = function(songId) {
		toBeCurrentTrack = $('#'+songId).parent();
		if ($('.currentTrack')) {
			$('.currentTrack').each(function(index,element) {
				$(element).removeClass('currentTrack');
			});
		}
		toBeCurrentTrack.addClass('currentTrack');
		PlaylistApp.updatePlaylist();
		SoundHub.AudioPlayer.updatePlayerButtons();
	};

	PlaylistApp.tracksCount = function() {
		return tracks.length;
	};
	PlaylistApp.currentTrackNum = function() {
		return currentTrackNum;
	};

	return PlaylistApp;

}();