SoundHub.PlaylistApp = function(){
	var tracks;
	var PlaylistApp = {};
	var currentTrackNum = 0;
	var currentTrack = function(){
		return $('.currentTrack').children(':first').attr('id');
	};
	var nextTrack = function(){
		return $('.currentTrack').next().children(':first').attr('id');
	};
	var previousTrack = function(){
		return $('.currentTrack').prev().children(':first').attr('id');
	};


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
			$('#'+currentTrack())
			.parent()
			.removeClass('currentTrack')
			.addClass('faded');
			$($(e.target).closest('.songBlock')[0])
			.removeClass('faded')
			.addClass('currentTrack');
			SoundHub.SoundCloudAPI.playSong(currentTrack())
			SoundHub.PlaylistApp.updatePlaylist();
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
		$('#playlist').sortable({
			tolerance: "pointer",
			handle: ".icon-ellipsis-horizontal",
			stop: function(e,ui){
				SoundHub.PlaylistApp.updatePlaylist();
				SoundHub.AudioPlayer.updatePlayerButtons();
			}
		});
	});

	PlaylistApp.addSongToPlaylist = function(song){
		tracks.add(song);
		// play the first song that is added to the playlist
		if(tracks.length === 1){
			$("#"+tracks.first().get('id')).parent().addClass('currentTrack');
			SoundHub.SoundCloudAPI.playSong(tracks.first().get('id'));
		}
	};
	PlaylistApp.nextSong = function(){
		$("#"+nextTrack())
		.parent()
		.addClass('currentTrack');
		SoundHub.SoundCloudAPI.playSong(nextTrack());
		$("#"+currentTrack())
		.parent()
		.removeClass('currentTrack')
		.addClass('faded');
		currentTrackNum++;
		SoundHub.AudioPlayer.updatePlayerButtons();
	};
	PlaylistApp.previousSong = function(){
		var cTrack = currentTrack();
		$("#"+previousTrack())
		.parent()
		.removeClass('faded')
		.addClass('currentTrack');
		SoundHub.SoundCloudAPI.playSong(previousTrack());
		$("#"+cTrack)
		.parent()
		.removeClass('currentTrack');
		currentTrackNum--;
		SoundHub.AudioPlayer.updatePlayerButtons();
	};


	PlaylistApp.initializeLayout = function(options){
		//make new collection

		tracks = new Tracks();

		var tracksView = new TracksView({
			collection: tracks
		});

		SoundHub.playlistApp.show(tracksView);
	};
	PlaylistApp.updatePlaylist = function() {
		var passedCurrent = false;
		$('#playlist .songBlock').each(function(index, element) {
			if (!passedCurrent && $(element).hasClass('currentTrack')) {
				passedCurrent = true;
				currentTrackNum = index;
				$(element).removeClass('faded');
			} else {
				$(element).removeClass('currentTrack');
				if (passedCurrent) {
					$(element).removeClass('faded');
				} else {
					$(element).addClass('faded');
				}
			}
		});
	};

	PlaylistApp.tracksCount = function() {
		return tracks.length;
	};
	PlaylistApp.currentTrackNum = function() {
		return currentTrackNum;
	};

	return PlaylistApp;

}();