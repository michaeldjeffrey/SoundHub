SoundHub.ResultsApp = function(){
var ResultsApp = {};

	var Result = Backbone.Model.extend({});
	var Results = Backbone.Collection.extend({
		model: Result
	});

	var ResultView = Backbone.Marionette.ItemView.extend({
		template: '#result_item_template',
		tagName: 'li',
		className: 'songItem',
		events:{
			'click .addToPlaylist': 'clicked'
		},
		clicked: function(e){
			// console.log(this.model.id)
			// playSong(this.model.id)
			SoundHub.PlaylistApp.addSongToPlaylist(this.model);
		}
	});
	var ResultsView = Backbone.Marionette.CompositeView.extend({
		initialize: function(){
			genre = this.options.genre
		},
		tagName: 'ul',
		id: 'resultsList',
		template: '#results_template',
		itemView: ResultView,
		appendHTML: function(collectionView, itemView){
			console.log("genreapp.appendHTML called");
			collectionView.$('#genreList').append(itemView.el);
		},
	});

	var GetTracksByGenre = function(tracks){
		var list = [];
		tracks.forEach(function(a, i){
			list[i] = new Result({
				title: tracks[i].title,
				artist: tracks[i].user.username,
				id: tracks[i].id,
				albumArt: tracks[i].artwork_url,
				listens: tracks[i].playback_count
			})
		})

		return list;
	}

	ResultsApp.initializeLayout = function(options, genre){
		//make new collection
		//calling function to generate models
		var results = new Results(GetTracksByGenre(options));
		console.log('new results view')

		//making new compositeview and passing 
		//previously made collection
		var resultsView = new ResultsView({
			// collection: results
			collection: results,
			genre: genre
		});

		//show the new view in the region for main app
		SoundHub.resultsApp.show(resultsView)
	}

	return ResultsApp;

}();