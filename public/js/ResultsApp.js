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
			saveTask_localStorage(this.model);
			$(e.currentTarget).addClass('faded');
		}
	});

	var ResultsView = Backbone.Marionette.CompositeView.extend({
		initialize: function(){
			genre = this.options.genre;
			_.bindAll(this, 'detect_scroll');
			$("#resultsApp").scroll(this.detect_scroll);
		},
		tagName: 'ul',
		id: 'resultsList',
		template: '#results_template',
		itemView: ResultView,
		appendHTML: function(collectionView, itemView){
			console.log("genreapp.appendHTML called");
			collectionView.$('#genreList').append(itemView.el);
		},
		detect_scroll: function(){
			var height = $("#resultsList")[0].scrollHeight;
			var scrollP = $("#resultsApp")[0].scrollTop;
			if((scrollP + 700) > height && loadingSongs === false){
				loadingSongs = true;
				SoundHub.SoundCloudAPI.moreSongs(page_size, page_offset);
				page_offset += 15;
			}
		}
	});

	var GetTracksByGenre = function(tracks){
		var list = [];
		tracks.forEach(function(a, i){
			list[i] = new Result({
				title: tracks[i].title,
				artist: tracks[i].user.username,
				id: tracks[i].id,
				albumArt: tracks[i].artwork_url,
				listens: tracks[i].playback_count,
				soundcloudWebURL: tracks[i].permalink_url,
				waveformImageURL: tracks[i].waveform_url,
				duration: tracks[i].duration
			});
		});
		return list;

	};

	ResultsApp.addSongs = function(tracks){
		results.add(GetTracksByGenre(tracks));
		loadingSongs = false;
	};

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
		SoundHub.resultsApp.show(resultsView);
	};




	$("#query").on('focus', function(){

		var history = results.clone();

		$(this).on('keyup', function(){
			var val = $(this).val();
			var matched = history.filter(function(model) {
				return model.attributes.title.toLowerCase().indexOf(val.toLowerCase()) > -1;
			});
			results.reset(matched);
		});
	});

	return ResultsApp;
}();
