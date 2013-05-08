var SoundHub = new Backbone.Marionette.Application();

SoundHub.addRegions({
	genreApp: "#genreApp"
})


SoundHub.GenreApp = function(){
	var GenreApp = {};

	var genreList = [
		'Alternative', 'Anime', 'Blues', "Children's Music", 'Classical', "Comedy", "Country", "Dance", "Disney", "Easy Listening", "Electronic", "Enka", "French Pop", "German Folk", "German Pop", "Fitness & Workout", "Gip-Gop/Rap", "Holiday", "Indie Pop", "Industrial", "Inspirational - Christian & Gospel", "Instrumental", "J-Pop", "Jazz", "K-Pop", "Karaoke", "Kayokyoku", "Latino", "New Age", "OPera", "Pop", "R&B/Soul", "Reggae", "Rock", "Singer/Songwriter", "Soundtrack", "Spoken Word", "Vocal", "World"
	]

	var Genre = Backbone.Model.extend({});
	var Genres = Backbone.Collection.extend({
		model: Genre
	});

	var GenreView = Backbone.Marionette.ItemView.extend({
		template: '#genre_item_template',
		tagName: 'li',
		className: 'genre_item',
		events:{
			'click': 'clicked'
		},
		clicked: function(e){
			console.log($(e.currentTarget).text());
		}
	});
	var GenresView = Backbone.Marionette.CompositeView.extend({
		tagName: 'ul',
		id: 'genre3',
		template: '#genres_template',
		itemView: GenreView,
		appendHTML: function(collectionView, itemView){
			console.log("genreapp.appendHTML called");
			collectionView.$('#genreList').append(itemView.el);
		}
	});

	var randomGenres = function(){
		console.log('randomGenres called');
		var list = [];
		for(var i = 0; i < 10; i++){
			console.log('generated', i, 'genres')
			var ran = Math.floor(Math.random()*genreList.length);
			list[i] = new Genre({name: genreList[ran]});
			genreList.splice(ran, 1)
		}
		return list;
	}

	GenreApp.initializeLayout = function(options){
		//make new collection
		//calling function to generate models
		var genres = new Genres(randomGenres());

		//making new compositeview and passing 
		//previously made collection
		var genresView = new GenresView({
			collection: genres
		});

		//show the new view in the region for main app
		SoundHub.genreApp.show(genresView)
	}




	return GenreApp;
}();

SoundHub.addInitializer(function(){
	SoundHub.GenreApp.initializeLayout();
})

	_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};

$(document).ready(function(){
	SoundHub.start()
})




