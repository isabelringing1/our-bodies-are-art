document.addEventListener('DOMContentLoaded', setup);

var userToken = '';
var images = [];
var all_vertices = new Map();
var clickedPt = "";

async function setup(){
    document.getElementById('color-checkbox').addEventListener('change', function(){
        if(this.checked) {
            $('.canvas').css('display', 'inline');
        } else {
            $('.canvas').css('display', 'none');
        }
    });
    const net = await bodyPix.load();
    if (!sessionStorage.getItem('userToken')){ 
        userToken = prompt("Please enter the generated developer token.");
        sessionStorage.setItem('userToken', userToken);
    }
    userToken = sessionStorage.getItem('userToken');
    $.ajax('https://api.box.com/2.0/folders/123366833733/items', 
    {
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + userToken);
        },
        success: function(result) {
            console.log(result);
            processImages(result.entries, net);
        },
        error: function(xhr, status, error) { 
            alert("Something went wrong, trying again.");
            sessionStorage.removeItem('userToken');
            setup();
         }
    })
}

function getImage(id, net){
    $.ajax('https://api.box.com/2.0/files/' + id + '/content?access_token=' + userToken, 
    {
        type: 'GET',
        success: function(data, status, xhr) {
            create_image(data, net);
        },
        xhr:function(){
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob'
            return xhr;
        },
        error: function(xhr, status, error) { 
            console.log(xhr);
         }
    });
}

function processImages(raw_images, net){
    for (i in raw_images){
        getImage(raw_images[i].id, net);
    }
    
}

function create_image(data, net){
    var div = document.createElement('div');
    div.className = "container";
    var img = document.createElement('img'); 
    img.style.height = '80vh';
    div.style.height = img.style.height;
    img.addEventListener("load", function () {
        labelImage(img, div, net);
    });
    var url = window.URL || window.webkitURL;
    img.src = url.createObjectURL(data);
    img.className = "artwork";
    img.id = 'image' + String(images.length);
    images.push('image' + String(images.length));
    document.getElementById('main-container').appendChild(div);
    div.appendChild(img);
}

async function labelImage(img, div, net, pose){
    console.log(img);
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.className = 'canvas';
    const ctx = canvas.getContext('2d');
    console.log(canvas);
    div.appendChild(canvas);
    const segmentation = await net.segmentPersonParts(img, {
        flipHorizontal: false,
        internalResolution: 'high',
        segmentationThreshold: 0.7,
        maxDetections: 1
    });
    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
    console.log(coloredPartImage);
    img.height = coloredPartImage.height;
    img.width = coloredPartImage.width;
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    var blank = document.createElement('img'); 
    blank.height = coloredPartImage.height;
    blank.width = coloredPartImage.width;
    bodyPix.drawMask(
        canvas, blank, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal);
    
    /*const pose = await net.estimateSinglePose(img, {
        flipHorizontal: false
    });*/

    var posecanvas = document.createElement('canvas');
    posecanvas.width = img.width;
    posecanvas.height = img.height;
    posecanvas.className = 'canvas pose-canvas';
    const posectx = posecanvas.getContext('2d');
    div.appendChild(posecanvas);
    const click_handler = (event, posecanvas) => changeImage(event, posecanvas);
    const move_handler = (event, posecanvas) => dragPoint(event, posecanvas);
    posecanvas.addEventListener('mousedown', (event) => click_handler(event, posecanvas)); 
    posecanvas.addEventListener('mousemove', (event) => move_handler(event, posecanvas)); 
    posecanvas.addEventListener('mouseup', function(){clickedPt="";})
   
    poses = segmentation.allPoses;
    console.log(segmentation)
    var vertices = drawKeypoints(poses[0].keypoints, minPartConfidence, posectx);
    drawSkeleton(poses[0].keypoints, minPartConfidence, posectx);
    all_vertices.set(posecanvas, vertices)
}

function changeImage(e, canvas){
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    vertices = all_vertices.get(canvas)
    console.log('clicked ' + y + ', ' + x);
    var points = [];
    for (var i = -3; i <  3; i++){
        for (var j = -3; j <  3; j++){
            points.push((y + i) + "," + (x + j));
        }
    }

    for (var i = 0; i < points.length; i++){
        if (vertices.has(points[i])){
            console.log("found " + points[i] + " as " + vertices.get(points[i]));
            clickedPt = points[i];
            break;
        }
    }
}

function dragPoint(e, canvas){
    if (clickedPt == "") return;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    vertices = all_vertices.get(canvas)

    let i = vertices.get(clickedPt)
    vertices.delete(clickedPt);
    let newPt = y+","+x
    vertices.set(newPt, i);
    clickedPt = newPt;
    vertices = new Map([...vertices].sort((a, b) => a[1] - b[1]))
    vertexArray = Array.from(vertices.keys());
    
    drawKPfromVertices(vertexArray, ctx);
    drawSKfromVertices(vertexArray, ctx);
}