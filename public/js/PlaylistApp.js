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
		className: 'trackBlock',
		events:{
			'click .trackInfo': 'play',
			'click .remove': 'removeSong'
		},
		play: function(e){
			trackBlock = $(e.target).closest('.trackBlock');
			SoundHub.SoundCloudAPI.playTrack(trackBlock);
		},
		removeSong: function(e){
			console.log('remove called');
			tracks.remove(this.model);
		}
	});

	var TracksView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		id: 'playlist',
		className: "small-block-grid-24",
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
		if ($('#playlist .trackBlock').first().children(':first').attr('soundcloudid') != undefined) {
			return $('#playlist .trackBlock').first();
		}
		return false;
	};
	PlaylistApp.lastTrackInPlaylist = function() {
		if ($('#playlist .trackBlock').last().children(':first').attr('soundcloudid') != undefined) {
			return $('#playlist .trackBlock').last();
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
			axis: "x",
			revert: 77,
			tolerance: "pointer",
			stop: function(e,ui){
				PlaylistApp.updatePlaylist();
				SoundHub.AudioPlayer.updatePlayerButtons();
			},
			handle: '.handle'
		}).droppable({
			drop: function( event, ui ) {
				//
			}
		});

	};
	PlaylistApp.updatePlaylist = function() {
		console.log("Playing track num: ", currentTrackNum);
		console.log("Updating playlist.");
		trackBlockWidth =
			Number($('#playlist .trackBlock').width()) +
			Number($('#playlist .trackBlock').css('margin-left').replace(/px/gi, "")) +
			Number($('#playlist .trackBlock').css('margin-right').replace(/px/gi, "")) +
			Number($('#playlist .trackBlock').css('padding-left').replace(/px/gi, "")) +
			Number($('#playlist .trackBlock').css('padding-right').replace(/px/gi, ""));
		$('#playlist').css('width',
			(
				trackBlockWidth *
				(
					PlaylistApp.tracksCount()+
					(
						Number($('#playlistApp').width()) /
						trackBlockWidth
					)
				) -
				trackBlockWidth +'px'
			)
		);
		var passedCurrent = false;
		$('#playlist .trackBlock').each(function(index, element) {
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

	$("#playlist").droppable({
		drop: function(event,ui) {
			$(event.target).trigger('click');
		}
	})

	return PlaylistApp;

}();