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
	SoundHub.start();
});

function saveTask_localStorage (song) {
  localStorage.setItem(localStorage.length, JSON.stringify(song));
}

function retrieve_localStorage(){
  var a = [];
  for ( var i = 0; i < localStorage.length; i++){
    a.push(JSON.parse(localStorage.getItem(i)));
  }
  return a;
}

function retrieve_playlist (playlistName) {
  var json = JSON.parse(localStorage[playlistName]);
  return json;
}
