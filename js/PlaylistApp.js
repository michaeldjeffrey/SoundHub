SoundHub.PlaylistApp = function(){
	var tracks;
	var PlaylistApp = {};

	var Track = Backbone.Model.extend({});
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
			playSong(this.model.id)
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
		itemView: TrackView
	});

	PlaylistApp.addSongToPlaylist = function(song){
		// console.log('add song to playlist called: ',song)
		tracks.add(song)
	}


	PlaylistApp.initializeLayout = function(options){
		//make new collection

		tracks = new Tracks();
		console.log('new playlist view');

		var tracksView = new TracksView({
			collection: tracks
		});

		SoundHub.playlistApp.show(tracksView)
	}
	return PlaylistApp;

}();