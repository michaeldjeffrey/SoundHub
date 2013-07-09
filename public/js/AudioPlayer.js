//TODO: click on seek timeline, without having to grab scrub

SoundHub.AudioPlayer = function(){

	var AudioPlayer = {};
	AudioPlayer.audio = SC.stream('');
	var lastVolume = false;
	var audioMuted = false;
	AudioPlayer.shuffleEnabled = false;
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
	$("#audioPlayer .volume-wrapper").on('click', function() {
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
		try {
			AudioPlayer.audio.setVolume(volume);
		} catch (error) {
			//
		}
		AudioPlayer.updatePlayerButtons();
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
		$('.volume-slider').slider('value', newVolumeLevel);
		AudioPlayer.setVolume();
	};
	AudioPlayer.shuffleButtonHandler = function(e) {
		if (AudioPlayer.shuffleEnabled) {
			AudioPlayer.shuffleEnabled = false;
			$(e.target).attr('status', 'inactive');
			SoundHub.PlaylistApp.initializeLayout();
		} else {
			AudioPlayer.shuffleEnabled = true;
			$("#playlist").shuffle();
			$(e.target).attr('status', 'active');
		}
		if (SoundHub.PlaylistApp.firstTrackInPlaylist()) {
			SoundHub.SoundCloudAPI.playTrack(SoundHub.PlaylistApp.firstTrackInPlaylist());
		}
		AudioPlayer.updatePlayerButtons();
		SoundHub.PlaylistApp.updatePlaylist();
	};
	AudioPlayer.repeatButtonHandler = function(e) {
		if (AudioPlayer.repeatEnabled) {
			AudioPlayer.repeatEnabled = false;
			$(e.target).attr('status', 'inactive');
		} else {
			AudioPlayer.repeatEnabled = true;
			$(e.target).attr('status', 'active');
		}
		AudioPlayer.updatePlayerButtons();
		SoundHub.PlaylistApp.updatePlaylist();
	};

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
		code = Math.max(Math.min(Math.round((AudioPlayer.audio.eqData[64]+AudioPlayer.audio.eqData[42]+AudioPlayer.audio.eqData[128]+AudioPlayer.audio.eqData[222]+AudioPlayer.audio.eqData[77]+AudioPlayer.audio.eqData[192])*10000000), 999999), 100000);
		$('input').css('background', '#'+code);
		console.log(code);
		if(AudioPlayer.audio.position > 0 && AudioPlayer.audio.position != AudioPlayer.audio.durationEstimate) {
			value = Math.floor((playheadSteps / AudioPlayer.audio.durationEstimate) * AudioPlayer.audio.position);
			$("#progressBar").slider( "option", "value", value );
			$("#progressBar").slider( "option", "disabled", false );
		} else {
			$("#progressBar").slider( "option", "value", 0 );
			$("#progressBar").slider( "option", "disabled", true );
		}
		$("#progressBar").progressbar("destroy");

	}
	AudioPlayer.updatePlayerButtons = function() {
		console.log("Updating player buttons.");
		var playpause = $('#playpause');
		if(AudioPlayer.audio.paused || SoundHub.PlaylistApp.currentTrackNum() === 0) {
			console.log("Converting  playpause to play button.");
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

		console.log(SoundHub.PlaylistApp.tracksCount());
		if (SoundHub.PlaylistApp.currentTrackNum() === 1 || SoundHub.PlaylistApp.tracksCount() === 0) {
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

		if (AudioPlayer.repeatEnabled) {
			if (SoundHub.PlaylistApp.tracksCount() > 0) {
				prevBtn.removeAttr('disabled');
				nextBtn.removeAttr('disabled');
			}
		}

		var muteBtn = $('#audioPlayer .mute-icon');
		var curVol = $('.volume-slider').slider('option', 'value');
		if (curVol < 55) {
			$(muteBtn).removeClass('icon-volume-up')
			.removeClass('icon-volume-off')
			.addClass('icon-volume-down')
			.attr('status', 'active');
		} else {
			$(muteBtn).removeClass('icon-volume-down')
			.removeClass('icon-volume-off')
			.addClass('icon-volume-up')
			.attr('status', 'active');
		}
		if (audioMuted || curVol === 0) {
			$(muteBtn).removeClass('icon-volume-up')
			.removeClass('icon-volume-down')
			.addClass('icon-volume-off')
			.attr('status', 'inactive');
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
		volumeSlider = $(".volume-slider").slider({
			orientation: "vertical",
			value: 100,
			range: 'min',
			min: 0,
			max: 100,
			change: function () {
				AudioPlayer.setVolume();
			},
			slide: function() {
				AudioPlayer.setVolume();
			}
		});
		volumeSlider.find(".ui-slider-handle")
		.wrap("<div class='ui-handle-helper-parent'></div>");

		$(".volume-wrapper").hoverIntent({
			over: function() {
				$(".volume-slider-wrapper").fadeIn('fast');
			},
			out: function() {
				$(".volume-slider-wrapper").fadeOut('fast');
			},
			timeout:500
		});

	});

	return AudioPlayer;

}();