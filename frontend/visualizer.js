// document.addEventListener('click', async () => {

//   const audioContext = new AudioContext();

//   var mediaStreamDestination = audioContext.createMediaStreamDestination();
  
//   console.log(1);
  
//   // audioContext.destination.connect(mediaStreamDestination);
  
//   console.log(2);
  
//   var audioStream = mediaStreamDestination.stream;
  
//   var audioSource = audioContext.createMediaStreamSource(audioStream);
  
//   console.log(3);

//   const analyser = audioContext.createAnalyser();
//   audioSource.connect(analyser);
//   analyser.fftSize = 2048;
  
//   console.log(4);
  
//   const bufferLength = analyser.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);

//   function draw() {
//     analyser.getByteFrequencyData(dataArray);
//     console.log(dataArray);
//     requestAnimationFrame(draw);
//   }

//   draw();
  
// });
