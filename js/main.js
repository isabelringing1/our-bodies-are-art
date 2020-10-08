
videoWidth = 600;
videoHeight = 600;

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

async function setupCamera(){
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
      }
    
    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
          facingMode: 'user',
          width: videoWidth,
          height: videoHeight,
        },
      });
    video.srcObject = stream;

    return new Promise((resolve) => {
    video.onloadedmetadata = () => {
        resolve(video);
    };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    
    video.play();
    return video;
}
  
function renderVideoOutput(video, net){
    const canvas = document.getElementById('output');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');
    
    async function updateFrame(){
        const pose = await net.estimateSinglePose(video, {
            flipHorizontal: false
        });

        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.save();
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
        if (pose.score >= minPoseConfidence) {
            drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }

        requestAnimationFrame(updateFrame);
    }
    updateFrame();
}

// Toggles loading UI 
function showLoading(loading){
    console.log("loading is " + loading);
}

document.addEventListener("DOMContentLoaded", async function(){
    showLoading(true);
    const net = await getPosenet();
    showLoading(false);

    let video;
    try {
        video = await loadVideo();
      } catch (e) {
          console.log('this browser does not support video capture,' +
          'or this device does not have a camera')
        throw e;
      }
      renderVideoOutput(video, net);
});

