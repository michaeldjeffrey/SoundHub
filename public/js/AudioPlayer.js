//TODO: click on seek timeline, without having to grab scrub

SoundHub.AudioPlayer = function(){

	var AudioPlayer = {};
	var audio = document.getElementById('sh-html5-audio-player');
	audio.controls = false;
	var lastVolume = false;
	var audioMuted = false;
	var shuffleEnabled = false;
	var repeatEnabled = false;

	AudioPlayer.repeatEnabled = false;

	var playheadSteps = 1000;

	$(audio).on('timeupdate', function(){
		updateProgress();
	});
	$(audio).on('ended', function(){
		AudioPlayer.playNextTrack();
	});

	$("#playpause").on('click', function(){
		if (!$(this).attr('disabled')) {
			AudioPlayer.togglePlayPause();
		}
	});
	$(".icon-step-backward").on('click', function(){
		if (!$(this).attr('disabled')) {
			AudioPlayer.playPreviousTrack();
		}
	});
	$(".icon-step-forward").on('click', function(){
		if (!$(this).attr('disabled')) {
			AudioPlayer.playNextTrack();
		}
	});
	$("#volume").on('change', function(){
		AudioPlayer.setVolume();
	});
	$(".icon-volume-up").on('click', function() {
		AudioPlayer.muteHandler();
	});

	$(".icon-random").on('click', function(e) {
		AudioPlayer.shuffleButtonHandler(e);
	});
	$(".icon-repeat").on('click', function(e) {
		AudioPlayer.repeatButtonHandler(e);
	});

	AudioPlayer.togglePlayPause = function(){
		if(audio.paused || audio.ended){
			audio.play();
		} else {
			audio.pause();
		}
		AudioPlayer.updatePlayerButtons();
	};

	AudioPlayer.setVolume = function(){
		var volume = document.getElementById('volume');
		audio.volume = volume.value;
	};
	AudioPlayer.muteHandler = function() {
		var volume = document.getElementById('volume');
		if (audioMuted) {
			if (lastVolume) {
				volume.value = lastVolume;
			} else {
				volume.value = 100;
			}
			lastVolume = false;
			audioMuted = false;
		} else {
			lastVolume = volume.value;
			volume.value = 0;
			audioMuted = true;
		}
		AudioPlayer.setVolume();
	};
	AudioPlayer.shuffleButtonHandler = function(e) {
		if (shuffleEnabled) {
			shuffleEnabled = false;
			$(e.target).attr('status', 'inactive');
		} else {
			shuffleEnabled = true;
			$(e.target).attr('status', 'active');
		}
	}
	AudioPlayer.repeatButtonHandler = function(e) {
		if (repeatEnabled) {
			repeatEnabled = false;
			$(e.target).attr('status', 'inactive');
		} else {
			repeatEnabled = true;
			$(e.target).attr('status', 'active');
		}
	}

	AudioPlayer.playNextTrack = function() {
		if (AudioPlayer.repeatEnabled) {
			if (SoundHub.PlaylistApp.nextTrackInPlaylist()) {
				console.log("Playing next track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.nextTrackInPlaylist());
			} else {
				console.log("Playing first track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.firstTrackInPlaylist());
			}
		} else {
			if (SoundHub.PlaylistApp.nextTrackInPlaylist()) {
				console.log("Playing next track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.nextTrackInPlaylist());
			} else {
				console.log("I guess we're all done, going to sleep....");
				AudioPlayer.goToSleep();
			}
		}
	};

	AudioPlayer.playPreviousTrack = function() {
		if (AudioPlayer.repeatEnabled) {
			if (SoundHub.PlaylistApp.previousTrackInPlaylist()) {
				console.log("Playing previous track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.previousTrackInPlaylist());
			} else {
				console.log("Playing last track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.lastTrackInPlaylist());
			}
		} else {
			if (SoundHub.PlaylistApp.previousTrackInPlaylist()) {
				console.log("Playing previous track.");
				SoundHub.SoundCloudAPI.playSong(SoundHub.PlaylistApp.previousTrackInPlaylist());
			} else {
				console.log("I guess we're all done, going to sleep....");
				AudioPlayer.goToSleep();
			}
		}
	};

	AudioPlayer.goToSleep = function() {
		SoundHub.SoundCloudAPI.loadTrack(SoundHub.PlaylistApp.firstTrackInPlaylist());
	};

	function updateProgress(){
		var value = 0;
		if(audio.currentTime > 0 && audio.currentTime != audio.duration) {
			value = Math.floor((playheadSteps / audio.duration) * audio.currentTime);
			$("#progressBar").slider( "option", "value", value );
			$("#progressBar").slider( "option", "disabled", false );
		} else {
			$("#progressBar").slider( "option", "value", 0 );
			$("#progressBar").slider( "option", "disabled", true );
		}
	}
	AudioPlayer.updatePlayerButtons = function() {
		console.log("Updating player buttons.");
		var playpause = $('#playpause');
		if(audio.paused || audio.ended || SoundHub.PlaylistApp.currentTrackNum() == 0) {
			console.log("Converting to playpause to play button.");
			playpause.attr('title', 'play');
			playpause.attr('class', 'button icon icon-play');
		} else {
			console.log("Converting to playpause to pause button.");
			playpause.attr('title', 'pause');
			playpause.attr('class', 'button icon icon-pause');
		}

		if (SoundHub.PlaylistApp.tracksCount() > 0) {
			console.log("Enabling playpause button.");
			playpause.removeAttr('disabled');
		} else {
			console.log("Disabling playpause button.");
			playpause.attr('disabled', 'disabled');
		}

		var nextBtn = $('#audioPlayer .icon-step-forward');
		var prevBtn = $('#audioPlayer .icon-step-backward');

		if (SoundHub.PlaylistApp.currentTrackNum() === 1) {
			console.log("Disabling previous-track button.");
			prevBtn.attr('disabled', 'disabled');
		} else {
			console.log("Enabling previous-track button.");
			prevBtn.removeAttr('disabled');
		}
		if (SoundHub.PlaylistApp.currentTrackNum() == SoundHub.PlaylistApp.tracksCount()) {
			console.log("Disabling next-track button.");
			nextBtn.attr('disabled', 'disabled');
		} else {
			console.log("Enabling next-track button.");
			nextBtn.removeAttr('disabled');
		}
	};

	$(function() {
		$("#progressBar").slider({
			range: "min",
			value: 0,
			min: 1,
			max: playheadSteps,
			disabled: true,
			slide: function(event, ui) {
				$("#amount").val('$' + ui.value);
				audio.currentTime = (ui.value / playheadSteps) * audio.duration;
				audio.removeEventListener('timeupdate', updateProgress, false);
			},
			stop: function(event, ui) {
				audio.addEventListener('timeupdate', updateProgress, false);
			}
		});
		$("#amount").val('$' + $("#progressBar").slider("value"));
	});
	$(function() {
		$("#progressBar .ui-slider-handle").button({
			icons: {
				primary: "ui-icon-grip-solid-vertical"
			},
			text: false
		});
	});

	return AudioPlayer;

}();