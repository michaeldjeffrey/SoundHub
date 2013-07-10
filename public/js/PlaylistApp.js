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
			'click .trackInfo': 'play',
			'click .remove': 'removeSong'
		},
		play: function(e){
			songBlock = $(e.target).closest('.songBlock');
			SoundHub.SoundCloudAPI.playTrack(songBlock);
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

	PlaylistApp.currentTrackInPlaylist = function(){
		if ($('.currentTrack')) {
			return $('.currentTrack');
		}
	};
	PlaylistApp.nextTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').next().children(':first').attr('soundcloudid') != undefined) {
			return $('.currentTrack').next();
		}
		return false;
	};
	PlaylistApp.previousTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').prev().children(':first').attr('soundcloudid') != undefined) {
			return $('.currentTrack').prev();
		}
		return false;
	};
	PlaylistApp.firstTrackInPlaylist = function() {
		if ($('#playlist .songBlock').first()) {
			return $('#playlist .songBlock').first();
		}
		return false;
	};
	PlaylistApp.lastTrackInPlaylist = function() {
		if ($('#playlist .songBlock').last()) {
			return $('#playlist .songBlock').last();
		}
		return false;
	};


	PlaylistApp.addSongToPlaylist = function(song) {
		tracks.add(song.clone());
		if(tracks.length === 1){
			SoundHub.SoundCloudAPI.playTrack($( '[soundcloudid=' + tracks.first().get('soundcloudid') + ']').parent());
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
			},
			handle: '.handle'
		});

	};
	PlaylistApp.updatePlaylist = function() {
		console.log("Playing track num: ", currentTrackNum);
		console.log("Updating playlist.");
		songBlockWidth =
			Number($('#playlist .songBlock').width()) +
			Number($('#playlist .songBlock').css('margin-left').replace(/px/gi, "")) +
			Number($('#playlist .songBlock').css('margin-right').replace(/px/gi, "")) +
			Number($('#playlist .songBlock').css('padding-left').replace(/px/gi, "")) +
			Number($('#playlist .songBlock').css('padding-right').replace(/px/gi, ""));
		$('#playlist').css('width',
			(
				songBlockWidth *
				(
					PlaylistApp.tracksCount()+
					(
						Number($('body').width()) /
						songBlockWidth
					)
				) -
				songBlockWidth +'px'
			)
		);
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

	PlaylistApp.makeThisTrackCurrent = function(toBeCurrentTrack) {
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