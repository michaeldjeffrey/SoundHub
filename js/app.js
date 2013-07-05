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
  console.log('localstorage from app.js', localStorage);
  for ( var i = 0; i < localStorage.length; i++){
    a.push(JSON.parse(localStorage.getItem(i)));
  }
  // console.log('from retrieve localStorage',a);
  return a;
}

function retrieve_playlist (playlistName) {
  var json = JSON.parse(localStorage[playlistName]);
  return json;
}

// var json = JSON.parse(localStorage["results"]);
// for (i=0;i<json.length;i++)
//             if (json[i].id == 'item-3') json.splice(i,1);
// localStorage["results"] = JSON.stringify(json);