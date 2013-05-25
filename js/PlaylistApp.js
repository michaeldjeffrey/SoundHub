SoundHub.PlaylistApp = function(){
	var tracks;
	var PlaylistApp = {};
	var currentTrackNum = 0;
	var currentTrack = function(){
		return tracks.at(currentTrackNum).get('id').toString();
	}
	var nextTrack = function(){
		return tracks.at(currentTrackNum + 1).get('id').toString();
	}
	var previousTrack = function(){
		return tracks.at(currentTrackNum - 1).get('id').toString();
	}


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
			SoundHub.SoundCloudAPI.playSong(this.model.id)
		},
		removeSong: function(e){
			console.log('remove called')
			tracks.remove(this.model)
		}
	});

	var TracksView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		id: 'playlist',
		template: '#tracks_template',
		itemView: TrackView,
	});

	PlaylistApp.addSongToPlaylist = function(song){
		tracks.add(song)
		if(tracks.length === 1){
			console.log('there is one track in the playlist')
			$("#"+tracks.first().get('id')).parent().addClass('currentTrack')
			SoundHub.SoundCloudAPI.playSong(tracks.first().get('id'))
		}
	}
	PlaylistApp.nextSong = function(){
			tracks.remove(tracks.first());
			SoundHub.SoundCloudAPI.playSong(tracks.first().id)
			// console.log(tracks.first().id)
	}


	PlaylistApp.initializeLayout = function(options){
		//make new collection

		tracks = new Tracks();

		var tracksView = new TracksView({
			collection: tracks
		});

		SoundHub.playlistApp.show(tracksView)
	}
	return PlaylistApp;

}();