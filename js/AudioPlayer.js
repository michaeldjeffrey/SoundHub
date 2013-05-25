//TODO: click on seek timeline, without having to grab scrub

SoundHub.AudioPlayer = function(){

var AudioPlayer = {};
var audio = document.getElementById('audio-test');
audio.controls = false;

$(audio).on('timeupdate', function(){
  updateProgress();
});
$(audio).on('ended', function(){
  SoundHub.PlaylistApp.nextSong();
})

$("#playpause").on('click', function(){
  AudioPlayer.togglePlayPause();
});
$(".icon-step-backward").on('click', function(){
  SoundHub.PlaylistApp.previousSong()
});
$(".icon-step-forward").on('click', function(){
  SoundHub.PlaylistApp.nextSong();
})
$("#volume").on('change', function(){
  AudioPlayer.setVolume();
})

AudioPlayer.togglePlayPause = function(){
  var playpause = document.getElementById('playpause');
  if(audio.paused || audio.ended){
    playpause.title = 'pause';
    playpause.className = 'icon-pause';
    audio.play();
  } else {
    playpause.title = 'play';
    playpause.className = 'icon-play';
    audio.pause();
  }
}

AudioPlayer.setVolume = function(){
  var volume = document.getElementById('volume');
  audio.volume = volume.value;
}

function updateProgress(){
  var progress = document.getElementById('progress');
  var value = 0;
  if(audio.currentTime > 0){
    value = Math.floor((100 / audio.duration) * audio.currentTime);
    // value = (100 / audio.duration) * audio.currentTime;
  }
  progress.style.width = value + "%";
}



$('#drag').each(function(){
  var $drag = $(this);

  $drag.on('mousedown', function(ev) {
    audio.removeEventListener('timeupdate', updateProgress, false);
    var $this = $( this );
    var $parent = $this.parent();
    var poffs = $parent.position();
    var pwidth = $parent.width();
    var ppwidth = $parent.parent().width()

    var x = ev.pageX;
    var y = ev.pageY;

    $this.parent();

    $(document).on('mousemove.dragging', function(ev){
      var mx = ev.pageX;
      var my = ev.pageY;

      var rx = mx - x;
      var ry = my - y;

      var value = Math.floor((100 / ppwidth) * (pwidth + rx));

      $parent.css({
        'width' : (pwidth + rx) + 'px'
      });
      // console.log(value);
      audio.currentTime = (value / 100) * audio.duration;
    }).on('mouseup.dragging mouseleave.dragging', function(ev){
      audio.addEventListener('timeupdate', updateProgress, false);
      $(document).off('.dragging');
    });
  });
});





return AudioPlayer;

}();