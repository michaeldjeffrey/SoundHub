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

var newPlaylist = [];
var playlists = [];

if (localStorage["playlists"]) {
	playlists = JSON.parse(localStorage["playlists"]);
	console.log("if localstorage: " + playlists, localStorage["playlists"]);
}else {
	console.log("if not" + playlists);
}

if (localStorage["genresx"]) {
	customGenres = JSON.parse(localStorage["genresx"]);
	console.log("if localstorage: " + customGenres, localStorage["genresx"])
}else {
	customGenres = defaultGenres;
	console.log("if not" + customGenres)
}

$( function() {
	$("body").css({"min-height": $(document).innerHeight()})
	var height = $(window).innerHeight();
	$("#results").css({"max-height":height - 110 - 200});
	$("aside").css({"max-height":height - 110 - 140});

	$("#gpToggle select").change( function() {
		console.log($(this).val());
		if ($(this).val() == "playlists") {
			$("#genres").hide();
			$("#playlists").show();
		}else if ($(this).val() == "genres") {
			$("#genres").show();
			$("#playlists").hide();
		}
	})

	playlists.forEach( function(a, i) {
		appendGP(a.name, $("#playlists"), "playlist");
		$("aside .playlist").each( function(i) {
			$(this).find('.play').click( function() {
				fillResults(playlists[i].tracks, playlists[i].name, "playlist", "playlist");
				$(".current").removeClass('current');
				$(this).addClass('current');
			});
			$(this).find('.list').click( function() {
				fillResults(playlists[i].tracks, playlists[i].name, "resultsList", "playlist");
				$(".current").removeClass('current');
				$(this).addClass('current');
			})
		})
	});

	customGenres.forEach( function(a) {
		appendGP(a, $("#genres"), "genre");
		$("aside .genre").each( function(i) {
			$(this).click( function() {
				$(".current").removeClass('current');
				$(this).addClass('current');
				var genre = $(this).children('.text').html();
				searchByGenre(genre, $(this));
			});
		});
	});
	$("aside .playlist .delete").click( function() {
		var genreName = $(this).prev().prev().prev().html();
		playlists.forEach( function(a,i) {
			if (a.name == genreName) {
				playlists.splice(i, 1);
				console.log(playlists);
				localStorage["playlists"] = JSON.stringify(playlists);
			}
		});
		$(this).parent().remove();
	});
	$("aside .genre .delete").click( function() {	
		var index = customGenres.indexOf($(this).prev().html().replace('&amp;', "&"));
		customGenres.splice(index, 1);
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

	$("#savePlaylist").click( function() {
		$("<div />").attr('id','playlistDialog').html("Name this playlist: <input id='playlistName' placeholder='playlist name' /><div><input type='button' value='save' id='addPlaylist' /><input type='button' value='nvm' id='closeDialog' /></div>").appendTo("body");
		$("#addPlaylist").click( function() {
			var playlistName = $("#playlistName").val();
			savePlaylist(playlistName);
			$("#playlistDialog").remove();
		});
		$("#closeDialog").click( function() {
			$("#playlistDialog").remove();
		});
	});
});


function saveGenres() {
	localStorage["genresx"] = JSON.stringify(customGenres);
}
function searchByGenre(genre, thisItem) {
	SC.get('/tracks?limit=15', { genres: genre },
	    function(tracks) {
	    	fillResults(tracks, genre, "resultsList", "genre");
	    }
	);
}
function search(query) {
	SC.get('/tracks?limit=15', { q: query },
	    function(tracks) {
	    	fillResults(tracks, query);
	    }
	);
}

function fillResults(tracks, query, target, type) {
	//console.log(tracks);
	console.log(target);
	$("#results").scrollTop('0px')
	$("#results p").html("Showing results for <span class='query'>" + query + "</span>.");
	$("#resultsList").children().remove();
	tracks.forEach( function(a,i) {

		if (target == "playlist") {
			var shortTitle;
			if (tracks[i].title.length > 25) {
				shortTitle = tracks[i].title.substring(0, tracks[i].title.indexOf(" ", 25)) + "...";
			}else {
				shortTitle = tracks[i].title;
			}
			var vars = {
				shortTitle: shortTitle,
				title: tracks[i].title,
				id: tracks[i].id,
				albumArt: tracks[i].artwork_url || tracks[i].albumArt,

			};
			$('<li />').attr({
				'data-id':tracks[i].id,
				'class': 'songBlock'
			}).html(
			Mustache.to_html("<div class='albumArt'><span class='delete'>x</span><span class='play'>&raquo;</span><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><span class='title'>{{shortTitle}}</span></h3>", vars)

			).appendTo($("#" + target));
			$(".songBlock .delete").click( function() {
				$(this).parents(".songBlock").remove();
			});
			$(".songBlock .play").click( function() {
				var songId = $(this).parents(".songBlock").data().id;
				playSong(songId);
			});
		}else if(target == "resultsList") {
			if(tracks[i].streamable) {
				//console.log(tracks[i])
				var id = tracks[i].id;
				var vars = {
					title: tracks[i].title,
					artist: tracks[i].artist || tracks[i].user.username,
					id: id,
					albumArt: tracks[i].artwork_url || tracks[i].albumArt,
					listens: tracks[i].playback_count || tracks[i].listens
				};
				$('<li />').attr({
					'data-id':id,
					'class': 'songItem'
				}).html(
					Mustache.to_html("<div class='albumArt'><img src='{{albumArt}}' alt='{{title}}' title='{{title}}' /></div><h3><span class='title'>{{title}}</span> by <span class='artist'>{{artist}}</span></h3><div class='addToPlaylist' data-id='{{id}}'>add to playlist</div><div class='listens'>{{listens}} listens</div><hr class='clear'/>", vars)
				).appendTo($("#" + target));
			}

		}
		//console.log(a.streamable);
	});	


	$(".addToPlaylist").each( function() {
		$(this).click( function() {
			var songId = $(this).data().id;
			$("#savePlaylist").show();
			SC.get('/tracks/' + songId,
				function(track) {
					fillResults(track, null, $("#playlist"), "song");
				}
			);
		});
	});
}


function playSong(songId) {
	SC.get('/tracks/' + songId,
		function(song) {
			$("#player audio").attr({
				"src": song.stream_url + (/\?/.test(song.stream_url) ? '&' : '?') + 'consumer_key=' + 'htuiRd1JP11Ww0X72T1C3g',
				"autoplay": "autoplay"
			});
			$("#player audio").bind("ended", function() {
				var nextSong;
				$(".songBlock").each( function() {
					if ($(this).data('id') == songId) {
						nextSong = $(this).next().data('id')
					}
				})
				playSong(nextSong);
			})
		}
	);
}

function appendGP(name, target, type) {
	if (type == "genre") {
		$('<span />').attr("class",type).html("<span class='text'>" + name + "</span><span class='delete'>x</span><hr class='clear' />").appendTo(target);
	}else if (type == "playlist") {
		$('<span />').attr("class",type).html("<span class='text'>" + name + "</span><span class='list'>l</span><span class='play'>></span><span class='delete'>x</span><hr class='clear' />").appendTo(target);
	}
}

function savePlaylist(name) {
	var newPlaylist = '{"name":"' + name + '","tracks": []}';
	newPlaylist = JSON.parse(newPlaylist);
	$(".songBlock").each( function(i) {
		var songId = $(this).data('id');
		SC.get('/tracks/' + songId,
			function(track) {
				newPlaylist.tracks[i] = {"title" : track.title, "artist": track.user.username, "id": track.id, "albumArt": track.artwork_url, "listens": track.playback_count, "streamable": "true"};
				if (i == $(".songBlock").length - 1) {
					console.log(newPlaylist);
					playlists.push(newPlaylist);
					console.log(playlists);
					localStorage["playlists"] = JSON.stringify(playlists);
				}	
			}
		);
	});

}
