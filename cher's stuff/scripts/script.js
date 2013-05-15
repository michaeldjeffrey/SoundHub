SC.initialize({
	client_id: "d945fc936728c08f4e2b720cc5998fd9"
});

var defaultGenres = [
	"World",
	"Jazz & Blues",
	"Pop",
	"Urban",
	"Classical",
	"Electronic",
	"Metal",
	"Rock",
	"Reggae"
];

//localStorage["genres"] = JSON.stringify(defaultGenres);

if (localStorage["genres"]) {
	customGenres = JSON.parse(localStorage["genres"]);
	console.log("if localstorage: " + customGenres, localStorage["genres"])
}else {
	customGenres = defaultGenres;
	console.log("if not" + customGenres)
}
/*localStorage["genres"] = JSON.stringify(defaultGenres);
console.log(defaultGenres);
console.log(typeof localStorage["genres"], localStorage["genres"]);
console.log(JSON.parse("[" + localStorage["genres"] + "]"));*/

/* 

save playlists w/ title, artist, length, albumart url, track url, ID


*/

$( function() {
	$("body").css({"min-height": $(document).innerHeight()})
	var height = $(window).innerHeight();
	$("#results").css({"max-height":height - 110 - 200});
	$("aside").css({"max-height":height - 110 - 140});
	// randomize a list of genres from list of returned tracks
	/*SC.get('/tracks?limit=50', { },
	    function(tracks) {
	    	var genres = [];
	    	tracks.forEach( function(a) {
		    	if(genres.length < 15) {
		    		genres.forEach( function(b) {

		    		});
		    		var thisG = a.genre;
			    	if (thisG) {
			    		genres.push(thisG);
			    		$('<span />').html(thisG).appendTo($('aside'));
			    	}	
	    		}
	    	});
	    	$("aside span").each( function(i) {
				$(this).click( function() {
					$(".current").removeClass('current');
					$(this).addClass('current');
					var genre = $(this).html();
					playMusic(genre, $(this));
				});
			});
	    }
	);*/

	customGenres.forEach( function(a) {
		appendGenre(a);
		$("aside span:first").each( function(i) {
			$(this).click( function() {
				$(".current").removeClass('current');
				$(this).addClass('current');
				var genre = $(this).find('.text').html();
				searchByGenre(genre, $(this));
			});
		});
	});
	$("aside .delete").click( function() {	
		var index = customGenres.indexOf($(this).prev().html().replace('&amp;', "&"));
		customGenres.splice(index, 1);
		console.log(customGenres, $(this).prev().html().replace('&amp;', "&"), index)
		$(this).parent().remove();
		saveGenres();
	});
	$("#getGenre").click( function() {
		var thisG = $("#genre").val();
		if (thisG) {
			var newG = appendGenre(thisG);
			customGenres.push(thisG);
			saveGenres();
			searchByGenre(thisG, newG);
		}
	});
	$("#getQuery").click( function() {
		var thisQ = $("#query").val();
		if (thisQ) {
			search(thisQ);
		}
	});
});





function saveGenres() {
	localStorage["genres"] = JSON.stringify(customGenres);
}
function searchByGenre(genre, thisItem) {
	SC.get('/tracks?limit=10', { genres: genre},
	    function(tracks) {
	    	fillResults(tracks, genre)
	    }
	);
}
function search(query) {
	SC.get('/tracks?limit=10', { q: query},
	    function(tracks) {
	    	fillResults(tracks, query)
	    }
	);
}

function fillResults(tracks, query) {
	$("#results p").html("Showing results for <span class='query'>" + query + "</span>.");
	$("#resultsList").children().remove();
	tracks.forEach( function(a,i) {
		var id = tracks[i].id;
		var vars = {
			title: tracks[i].title,
			artist: tracks[i].user.username,
			id: id,
			albumArt: tracks[i].artwork_url,
			listens: tracks[i].playback_count
		};
		$('<li />').attr({
			'data-id':id,
			'class': 'songItem'
		}).html(
			Mustache.to_html("<div class='albumArt'><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><h3><span class='title'>{{title}}</span> by <span class='artist'>{{artist}}</span></h3><div class='addToPlaylist' data-id='{{id}}'>add to playlist</div><div class='listens'>{{listens}} listens</div><hr class='clear'/>", vars)
		).appendTo($("#resultsList"));
	});	


	$(".addToPlaylist").each( function() {
		$(this).click( function() {
			var songId = $(this).data().id;
			addToPlaylist(songId);
		});
	});
}

function addToPlaylist(songId) {
	SC.get('/tracks/' + songId,
		function(track) {
			var shortTitle;
			if (track.title.length > 25) {
				shortTitle = track.title.substring(0, track.title.indexOf(" ", 25)) + "...";
			}else {
				shortTitle = track.title;
			}
			var vars = {
				shortTitle: shortTitle,
				title: track.title,
				id: songId,
				albumArt: track.artwork_url
			};
			console.log(track);
			$('<li />').attr({
				'data-id':songId,
				'class': 'songBlock'
			}).html(
			Mustache.to_html("<div class='albumArt'><span class='delete'>x</span><span class='play'>&raquo;</span><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><span class='title'>{{shortTitle}}</span></h3>", vars)

			).appendTo($("#playlist"));
			$(".songBlock .delete").click( function() {
				$(this).parents(".songBlock").remove();
			});
			$(".songBlock .play").click( function() {
				var songId = $(this).parents(".songBlock").data().id;
				playSong(songId);
			});
		}
		);
}

function playSong(songId) {
	SC.get('/tracks/' + songId,
		function(song) {
			$("#player audio").attr({
				"src": song.stream_url + (/\?/.test(song.stream_url) ? '&' : '?') + 'consumer_key=' + 'htuiRd1JP11Ww0X72T1C3g',
				"autoplay": "autoplay"
			});
		}
	);
}

function appendGenre(genre) {
	$('<span />').html("<span class='text'>" + genre + "</span><span class='delete'>x</span><hr class='clear' />").insertBefore($('#genreSearch'));
}
