SC.initialize({
	client_id: "d945fc936728c08f4e2b720cc5998fd9"
});

var genres = [
	// "World",
	// "Jazz & Blues",
	// "Pop",
	// "Urban",
	// "Classical",
	// "Electronic",
	// "Metal",
	// "Rock",
	// "Reggae"
	"Metal",
	"Death Metal",
	"Lovecraft",
	"Metalcore",
	"Drum and Bass",
	"Hardstyle",
	"Doom Metal"
];


$( function() {
	console.log($(document).height())
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
	genres.forEach( function(a) {
		$('<span />').html(a).insertBefore($('#genreSearch'));
		$("aside span").each( function(i) {
			$(this).click( function() {
				$(".current").removeClass('current');
				$(this).addClass('current');
				var genre = $(this).html();
				searchByGenre(genre, $(this));
			});
		});
	});
	$("#getGenre").click( function() {
		var thisG = $("#genre").val();
		if (thisG) {
			var newG = $('<span />').html(thisG).appendTo($("aside"));
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
			listens: tracks[i].playback_count,
			stream: tracks[i].stream_url
		};
		$('<li />').attr({
			'data-id':id,
			'class': 'songItem'
		}).html(
			Mustache.to_html("<div class='albumArt'><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><h3><span class='title'>{{title}}</span> by <span class='artist'>{{artist}}</span></h3><div class='addToPlaylist' data-id='{{id}}'' data-title='{{title}}' data-albumart='{{albumArt}}' data-stream='{{stream}}'>add to playlist</div><div class='listens'>{{listens}} listens</div><hr class='clear'/>", vars)
		).appendTo($("#resultsList"));


    	/*var track_url = tracks[i].permalink_url;
    	SC.oEmbed(track_url, {auto_play: false, color: "e6873a"}, document.getElementById(id));
    	console.log(genre, tracks[i].title, tracks[i].genre)*/
	});	
	$(".addToPlaylist").each( function() {
		$(this).click( function() {
			var shortTitle;
			if ($(this).data().title.length > 25) {
				shortTitle = $(this).data().title.substring(0, $(this).data().title.indexOf(" ", 25)) + "...";
			}else {
				shortTitle = $(this).data().title;
			}
			var song = $(this).data().stream;
			console.log(song)
			var vars = {
				shortTitle: shortTitle,
				title: $(this).data().title,
				id: $(this).data().id,
				albumArt: $(this).data().albumart,
				stream: song,
			};
			$('<li />').attr({
				'data-id':$(this).attr('id'),
				'class': 'songBlock'
			}).html(
				Mustache.to_html("<audio controls><source src='{{stream}}' type='audio/mpeg'>Your browser does not support the audio element.</audio><div class='albumArt'><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><span class='title'>{{shortTitle}}</span></h3>", vars)

			).appendTo($("#playlist"));
		});
	});
}