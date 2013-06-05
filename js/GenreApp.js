SoundHub.GenreApp = function(){
	var genres;
	var GenreApp = {};

	var genreList = [
		'Alternative', 'Anime', 'Blues', "Children's Music", 'Classical', "Comedy", "Country", "Dance", "Disney", "Easy Listening", "Electronic", "Enka", "French Pop", "German Folk", "German Pop", "Fitness & Workout", "Hip-Hop/Rap", "Holiday", "Indie Pop", "Industrial", "Inspirational - Christian & Gospel", "Instrumental", "J-Pop", "Jazz", "K-Pop", "Karaoke", "Kayokyoku", "Latino", "New Age", "OPera", "Pop", "R&B/Soul", "Reggae", "Rock", "Singer/Songwriter", "Soundtrack", "Spoken Word", "Vocal", "World"
	]

	var Genre = Backbone.Model.extend({});
	var Genres = Backbone.Collection.extend({
		model: Genre
	});
	var Playlist = Backbone.Model.extend({});
	var Playlists = Backbone.Collection.extend({
		model: Playlist
	});

	var GenreView = Backbone.Marionette.ItemView.extend({
		template: '#genre_item_template',
		tagName: 'li',
		className: 'genre_item',
		events:{
			'click .remove': 'removeGenre',
			'click': 'clicked',
		},
		clicked: function(e){
			var genre = this.model.get('name')
			SoundHub.SoundCloudAPI.searchByGenre(genre)
		},
		removeGenre: function(e){
			e.stopImmediatePropagation();
			genres.remove(this.model);
		}
	});
	var PlaylistView = Backbone.Marionette.ItemView.extend({
		template: "#playlist_item_template",
		tagName: 'li',
		className: 'genre_item',
	})
	var GenresView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		template: '#genres_template',
		itemView: GenreView,
		events:  {
			'click #getGenre': 'addGenre',
			'click .removeGenre': 'showRemoveGenres',
			'click #toPlaylist': 'switchToPlaylists',
		},
		switchToPlaylists: function(e){
			if($("#genreApp").parent().scrollLeft() < 180){
			$("#genreApp").parent().scrollLeft(180)
			} else {
				$("#genreApp").parent().scrollLeft(0)
			}
		},
		addGenre: function(e){
			console.log('addgenre clicked')
			var val = $("#genre").val()
			genres.add({name:val})
			SoundHub.SoundCloudAPI.searchByGenre(val)
		},
		showRemoveGenres: function(e){
			console.log("the X's should be showing")
			$(".genre_item").find('.remove').toggle();
		},
	});
	var PlaylistsView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		template: '#playlists_template',
		itemView: PlaylistView
	})
	var LayoutView = Backbone.Marionette.Layout.extend({
		template: "#genreApp_layout",
		regions: {
			genres: "#genres_list",
			playlists: "#playlists_list"
		}
	});

	var randomGenres = function(){
		console.log('randomGenres called');
		var list = [];
		for(var i = 0; i < 10; i++){
			var ran = Math.floor(Math.random()*genreList.length);
			list[i] = new Genre({name: genreList[ran]});
			console.log(ran, genreList[ran])
			genreList.splice(ran, 1)
		}
		return list;
	}

	GenreApp.initializeLayout = function(options){
		//make new collection
		//calling function to generate models
		genres = new Genres(randomGenres());
		playlists = new Playlists(randomGenres());
		console.log('playlists', playlists)
		console.log('genres', genres)

		//making new compositeview and passing 
		//previously made collection
		var genresView = new GenresView({
			collection: genres
		});
		var playlistsView = new PlaylistsView({
			collection: playlists
		})
		var layout = new LayoutView();

		//show the new view in the region for main app
		// SoundHub.genreApp.show(genresView)
		SoundHub.genreApp.show(layout);
		layout.genres.show(genresView);
		layout.playlists.show(playlistsView);
	}


	return GenreApp;
}();