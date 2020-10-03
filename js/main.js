
videoWidth = 600;
videoHeight = 600;
minPartConfidence = 0.2;
minPoseConfidence = 0.2;
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
    const net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    });
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

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
        continue;
        }

        const {y, x} = keypoint.position;
        drawPoint(ctx, y * scale, x * scale, 3, "aqua");
    }
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints =
        posenet.getAdjacentKeyPoints(keypoints, minConfidence);
  
    function toTuple({y, x}) {
      return [y, x];
    }
  
    adjacentKeyPoints.forEach((keypoints) => {
      drawSegment(
          toTuple(keypoints[0].position), toTuple(keypoints[1].position), "aqua",
          scale, ctx);
    });
}

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
}