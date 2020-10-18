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
    var name = '';
    $.ajax('https://api.box.com/2.0/files/' + id + '/?access_token=' + userToken, 
    {
        type: 'GET',
        fields: ['name'],
        success: function(data, status, xhr) {
            name = data.name;
        },
    });

    $.ajax('https://api.box.com/2.0/files/' + id + '/content?access_token=' + userToken, 
    {
        type: 'GET',
        success: function(data, status, xhr) {
            create_image(data, net, name);
        },
        xhr:function(){
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob'
            return xhr;
        },
        error: function(xhr, status, error) { 
            console.log("Error loading image from Box.");
        }
    });
}

async function processImages(raw_images, net){
    for (i in raw_images){
        await getImage(raw_images[i].id, net);
    }
    
}

function create_image(data, net, name){
    var div = document.createElement('div');
    div.className = "container";
    var img = document.createElement('img'); 
    img.style.height = '80vh';
    div.style.height = img.style.height;
    var url = window.URL || window.webkitURL;
    img.src = url.createObjectURL(data);
    img.className = "artwork";
    img.id = name.split(".")[0]; //strips off the .jpg, etc.

    document.getElementById('main-container').appendChild(div);
    div.appendChild(img);
    return new Promise((resolve, reject) => {
        img.addEventListener('load', function(){
            labelImage(img, div, net);
            resolve(img);
        });
    });
}

async function labelImage(img, div, net, pose){
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.className = 'canvas';
    canvas.id = "canvas" + img.id;
    const ctx = canvas.getContext('2d');
    div.appendChild(canvas);
    const segmentation = await net.segmentPersonParts(img, {
        flipHorizontal: false,
        internalResolution: 'high',
        segmentationThreshold: 0.7,
        maxDetections: 1
    });
    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
    img.height = coloredPartImage.height;
    img.width = coloredPartImage.width;
    const opacity = 0.6;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    var blank = document.createElement('img'); 
    blank.height = coloredPartImage.height;
    blank.width = coloredPartImage.width;
    bodyPix.drawMask(
        canvas, blank, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal);
    
    var posecanvas = document.createElement('canvas');
    posecanvas.width = img.width;
    posecanvas.height = img.height;
    posecanvas.className = 'canvas pose-canvas';
    posecanvas.id = "posecanvas" + img.id;
    const posectx = posecanvas.getContext('2d');
    div.appendChild(posecanvas);
    const click_handler = (event, posecanvas) => changeImage(event, posecanvas);
    const move_handler = (event, posecanvas) => dragPoint(event, posecanvas);
    posecanvas.addEventListener('mousedown', (event) => click_handler(event, posecanvas)); 
    posecanvas.addEventListener('mousemove', (event) => move_handler(event, posecanvas)); 
    posecanvas.addEventListener('mouseup', function(){clickedPt="";})

    create_buttons(div, img, canvas, posecanvas);

    pose = segmentation.allPoses[0];
    var vertices = drawKeypoints(pose.keypoints, minPartConfidence, posectx);
    drawSkeleton(pose.keypoints, minPartConfidence, posectx);
    all_vertices.set(posecanvas, vertices)
}

function create_buttons(div, img, canvas, posecanvas){
    var data_button = document.createElement('input');
    data_button.setAttribute('type', 'submit');
    data_button.setAttribute('ID', 'databutton-' + String(img.id));
    data_button.setAttribute('class', 'button send-data');
    data_button.setAttribute('value', 'Send Data');
    data_button.onclick = function () { send_data(posecanvas); };
    div.appendChild(data_button);

    var delete_button = document.createElement('input');
    delete_button.setAttribute('type', 'submit');
    delete_button.setAttribute('ID', 'delbutton-' + String(img.id));
    delete_button.setAttribute('class', 'button delete');
    delete_button.setAttribute('value', 'Delete');
    delete_button.onclick = function () { img.parentElement.remove() };
    div.appendChild(delete_button);

    var seg_label = document.createElement("label");
    var pose_label = document.createElement("label");
    var seg_button = document.createElement('input');
    var pose_button = document.createElement('input');
    seg_button.setAttribute('type', 'radio');
    pose_button.setAttribute('type', 'radio');
    seg_button.setAttribute('ID', 'segbutton-' + String(img.id));
    pose_button.setAttribute('ID', 'posebutton-' + String(img.id));
    seg_button.setAttribute('name', 'toggle');
    pose_button.setAttribute('name', 'toggle');
    seg_label.setAttribute('class', 'toggle');
    pose_label.setAttribute('class', 'toggle');
    seg_button.setAttribute('value', 'Segmentation');
    pose_button.setAttribute('value', 'Pose');
    seg_button.onclick = function () { 
        canvas.style.display = 'inline';
        posecanvas.style.display = 'none'; 
    };
    pose_button.onclick = function () { 
        canvas.style.display = 'none';
        posecanvas.style.display = 'inline'; 
    };
    seg_label.appendChild(seg_button);
    pose_label.appendChild(pose_button);
    seg_label.appendChild(document.createTextNode("Segmentation"));
    pose_label.appendChild(document.createTextNode("Pose"));
    div.appendChild(seg_label);
    div.appendChild(pose_label);
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

function send_data(canvas){
    console.log(all_vertices.get(canvas))

    let vertices = all_vertices.get(canvas)
    vertices = new Map([...vertices].sort((a, b) => a[1] - b[1]))
    vertexArray = Array.from(vertices.keys());

    torsoHeight = (point_dist(vertexArray[BP.get("leftShoulder")], vertexArray[BP.get("leftHip")])
    + point_dist(vertexArray[BP.get("rightShoulder")], vertexArray[BP.get("rightHip")])) / 2
    shoulderWidth = point_dist(vertexArray[BP.get("leftShoulder")], vertexArray[BP.get("rightShoulder")])
    hipWidth = point_dist(vertexArray[BP.get("rightHip")], vertexArray[BP.get("leftHip")])

    stRatio = shoulderWidth / torsoHeight;
    shRatio = shoulderWidth / hipWidth;

    console.log(stRatio, shRatio);
    var id = canvas.id.slice(-1);
    if (!isNaN(id)) {
        console.log("writing data for image " + id);
        sendData(id, [stRatio, shRatio]);
    }
}

function point_dist(a1, a2){
    p1 = [a1.split(",")[0], a1.split(",")[1]]
    p2 = [a2.split(",")[0], a2.split(",")[1]]
    return Math.sqrt(Math.pow(Math.abs(p1[0]-p2[0]), 2) + Math.pow(Math.abs(p1[1]-p2[1]), 2))
}