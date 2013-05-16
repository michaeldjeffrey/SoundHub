var audio = document.getElementById('audio-test');
audio.controls = true;
audio.addEventListener('timeupdate', updateProgress, false);
audio.addEventListener('ended', changeSong, false)
function togglePlayPause(){
  var playpause = document.getElementById('playpause');
  if(audio.paused || audio.ended){
    playpause.title = 'pause';
    playpause.innerHTML = 'pause';
    audio.play();
  } else {
    playpause.title = 'play';
    playpause.innerHTML = 'play';
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