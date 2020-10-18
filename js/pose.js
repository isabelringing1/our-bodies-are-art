minPartConfidence = 0.0;
minPoseConfidence = 0.0;

// Body part name to index hash map for easy access
BP = new Map([ 
    ["nose", 0],
    ["leftEye", 1],
    ["rightEye", 2],
    ["leftEar", 3],
    ["rightEar", 4],
    ["leftShoulder", 5],
    ["rightShoulder", 6],
    ["leftElbow", 7],
    ["rightElbow", 8],
    ["leftWrist", 9],
    ["rightWrist", 10],
    ["leftHip", 11],
    ["rightHip", 12],
    ["leftKnee", 13],
    ["rightKnee", 14],
    ["leftAnkle", 15],
    ["rightAnkle", 16]
]);

connections = [[5, 6], [5, 11], [6, 12], [11,12], [6, 8], [8, 10], [5, 7], [7, 9], [11, 13], [13, 15], [12, 14], [14, 16]];

function getPosenet(){
    return posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    });
}

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    vertices = new Map()
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        const {y, x} = keypoint.position;        
        drawPoint(ctx, y * scale, x * scale, 3, "aqua");
        //how we will reference our vertex in future uses; point on canvas and index
        vertices.set(parseInt(y * scale) + "," + parseInt(x * scale), i);
        
    }
    //console.log(vertices)
    return vertices;
}

function drawKPfromVertices(vertices, ctx, scale = 1){
    for (let i = 0; i < vertices.length; i++){
        var pts = vertices[i].split(",");
        let y = pts[0]
        let x = pts[1]
        drawPoint(ctx, y * scale, x * scale, 3, "aqua");
    }
}

function drawSKfromVertices(vertices, ctx, scale=1){
   // console.log(vertices)
    for (let i = 0; i < connections.length; i++){
        var part1 = vertices[connections[i][0]].split(",");
        var part2 = vertices[connections[i][1]].split(",");
        drawSegment([part1[0], part1[1]], [part2[0], part2[1]], "aqua", scale, ctx)
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