var audio = document.getElementById('audio-test');
audio.controls = false;
audio.addEventListener('timeupdate', updateProgress, false);
audio.addEventListener('ended', changeSong, false)
function togglePlayPause(){
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
function setVolume(){
  var volume = document.getElementById('volume');
  audio.volume = volume.value;
}
function updateProgress(){
  var progress = document.getElementById('progress');
  var value = 0;
  if(audio.currentTime > 0){
    value = Math.floor((100 / audio.duration) * audio.currentTime);
  }
  progress.style.width = value + "%";
}
function changeSong(){
  console.log('changed called')
  SoundHub.PlaylistApp.nextSong();
}





$( function() {
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
});


