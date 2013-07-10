SoundHub.PlaylistApp = function(){
	var tracks;
	var PlaylistApp = {};
	var currentTrackNum = 0;

	var Track = Backbone.Model.extend({
		idAttribute: "_id"
	});
	var Tracks = Backbone.Collection.extend({
		model: Track
	});

	var TrackView = Backbone.Marionette.ItemView.extend({
		template: '#tracks_item_template',
		tagName: 'li',
		className: 'songBlock',
		events:{
			'click': 'play',
			'click .remove': 'removeSong'
		},
		play: function(e){
			songId = $(e.target).closest('.songBlock').children(':first').attr('soundcloudid');
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

	PlaylistApp.currentTrackInPlaylist = function(){
		if ($('.currentTrack')) {
			return $('.currentTrack').children(':first').attr('soundcloudid');
		}
	};
	PlaylistApp.nextTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').next()) {
			return $('.currentTrack').next().children(':first').attr('soundcloudid');
		}
		return false;
	};
	PlaylistApp.previousTrackInPlaylist = function(){
		if ($('.currentTrack') && $('.currentTrack').prev()) {
			return $('.currentTrack').prev().children(':first').attr('soundcloudid');
		}
		return false;
	};
	PlaylistApp.firstTrackInPlaylist = function() {
		if ($('#playlist .songBlock').first()) {
			return $('#playlist .songBlock').first().children(':first').attr('soundcloudid');
		}
		return false;
	};
	PlaylistApp.lastTrackInPlaylist = function() {
		if ($('#playlist .songBlock').last()) {
			return $('#playlist .songBlock').last().children(':first').attr('soundcloudid');
		}
		return false;
	};


	PlaylistApp.addSongToPlaylist = function(song) {
		song.soundcloudid = song.id;
		song.unset('id');
		tracks.add(song);
		if(tracks.length === 1){
			$( '[soundcloudid=' + tracks.first().get('soundcloudid') + ']').parent().addClass('currentTrack');
			SoundHub.SoundCloudAPI.playTrack(tracks.first().get('soundcloudid'));
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

	PlaylistApp.makeThisTrackCurrent = function(songId) {
		toBeCurrentTrack = $('[soundcloudid='+songId+']').parent();
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