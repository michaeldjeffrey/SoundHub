//TODO: click on seek timeline, without having to grab scrub

SoundHub.AudioPlayer = function(){

	var AudioPlayer = {};
	AudioPlayer.audio = SC.stream('');
	var lastVolume = false;
	var audioMuted = false;
	var shuffleEnabled = false;
	var repeatEnabled = false;

	AudioPlayer.repeatEnabled = false;

	var playheadSteps = 1000;

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
		if(AudioPlayer.audio.paused || AudioPlayer.audio.playState === 0){
			AudioPlayer.audio.play();
		} else {
			AudioPlayer.audio.pause();
		}
		AudioPlayer.updatePlayerButtons();
	};

	AudioPlayer.setVolume = function(){
		var volume = $('.volume-slider').slider('option', 'value');
		console.log("Setting volume to: ", volume);
		AudioPlayer.audio.setVolume(volume);
	};
	AudioPlayer.muteHandler = function() {
		var currentVolumeLevel = $('.volume-slider').slider('option', 'value');
		var newVolumeLevel = 0;
		if (audioMuted) {
			if (lastVolume) {
				newVolumeLevel = lastVolume;
			} else {
				newVolumeLevel = 100;
			}
			lastVolume = false;
			audioMuted = false;
		} else {
			lastVolume = currentVolumeLevel;
			newVolumeLevel = 0;
			audioMuted = true;
		}
		$('.volume-slider').slider('option', 'value', newVolumeLevel);
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
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.nextTrackInPlaylist());
			} else {
				console.log("Playing first track.");
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.firstTrackInPlaylist());
			}
		} else {
			if (SoundHub.PlaylistApp.nextTrackInPlaylist()) {
				console.log("Playing next track.");
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.nextTrackInPlaylist());
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
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.previousTrackInPlaylist());
			} else {
				console.log("Playing last track.");
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.lastTrackInPlaylist());
			}
		} else {
			if (SoundHub.PlaylistApp.previousTrackInPlaylist()) {
				console.log("Playing previous track.");
				SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.previousTrackInPlaylist());
			} else {
				console.log("I guess we're all done, going to sleep....");
				AudioPlayer.goToSleep();
			}
		}
	};

	AudioPlayer.goToSleep = function() {
		SoundHub.SoundCloudAPI.loadTrack(SoundHub.PlaylistApp.firstTrackInPlaylist());
	};

	AudioPlayer.updateProgress = function(){
		var value = 0;
		if(AudioPlayer.audio.position > 0 && AudioPlayer.audio.position != AudioPlayer.audio.durationEstimate) {
			value = Math.floor((playheadSteps / AudioPlayer.audio.durationEstimate) * AudioPlayer.audio.position);
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
		if(AudioPlayer.audio.paused || SoundHub.PlaylistApp.currentTrackNum() === 0) {
			console.log("Converting to playpause to play button.");
			playpause.attr('title', 'play');
			playpause.attr('class', 'button icon icon-play');
		} else {
			console.log("Converting playpause to pause button.");
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
				AudioPlayer.audio.setPosition((ui.value / playheadSteps) * AudioPlayer.audio.durationEstimate);
			},
			stop: function(event, ui) {
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
		$(".volume-slider").slider({
			orientation: "vertical",
			value: 100,
			range: 'min',
			min: 0,
			max: 100,
			change: function () {
				AudioPlayer.setVolume();
			}
		});
		$(".volume-wrapper").hoverIntent({
			over: function() {
				$(".volume-slider").fadeIn('fast');
			},
			out: function() {
				$(".volume-slider").fadeOut('fast');
			},
			timeout:500
		});

	});

	return AudioPlayer;

}();