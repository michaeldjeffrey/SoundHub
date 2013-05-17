//initialize underscore to read templates like mustache
_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};


//Make app
var SoundHub = new Backbone.Marionette.Application();

//assign regions
SoundHub.addRegions({
	genreApp: "#genreApp",
	resultsApp: "#resultsApp",
	playlistApp: "#playlistApp"
});

//initialize regions
SoundHub.addInitializer(function(){
	SoundHub.GenreApp.initializeLayout();
	SoundHub.PlaylistApp.initializeLayout();
});

//start application
$(document).ready(function(){
	SoundHub.start()
})



