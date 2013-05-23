//TODO: loading extra songs when scroll hits the bottom
//TODO: make searching nicer

SoundHub.ResultsApp = function(){
var ResultsApp = {};
var results;

var page_size = 15;
var page_offset = 16;
var loadingSongs = false;

	var Result = Backbone.Model.extend({});
	var Results = Backbone.Collection.extend({
		model: Result
	});

	var ResultView = Backbone.Marionette.ItemView.extend({
		template: '#result_item_template',
		tagName: 'li',
		className: 'songItem',
		events:{
			'click .addToPlaylist': 'addToPlaylist'
		},
		addToPlaylist: function(e){
			SoundHub.PlaylistApp.addSongToPlaylist(this.model);
			console.log(this.model)
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
			});
		});
		return list;

	}

	ResultsApp.addSongs = function(tracks){
		results.add(GetTracksByGenre(tracks))
		loadingSongs = false;
	}

	ResultsApp.initializeLayout = function(options, genre){
		//make new collection
		//calling function to generate models
		results = new Results(GetTracksByGenre(options));

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