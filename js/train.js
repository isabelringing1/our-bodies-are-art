document.addEventListener('DOMContentLoaded', setup);

var userToken = '';
var images = [];

async function setup(){
    //const net = await getPosenet();
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
    })
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
    img.style.height = '50vh';
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

async function labelImage(img, div, net){
    console.log("labeling: " + img);
    var canvas = document.createElement('canvas');
    canvas.width = img.style.width;
    canvas.height = img.style.height;
    var ctx = canvas.getContext('2d');
    
   
    const segmentation = await net.segmentPersonParts(img, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.7
    });

    const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
    console.log(coloredPartImage);
    img.height = coloredPartImage.height;
    img.width = coloredPartImage.width;
    const opacity = 0.7;
    const flipHorizontal = false;
    const maskBlurAmount = 0;
    // Draw the colored part image on top of the original image onto a canvas.
    // The colored part image will be drawn semi-transparent, with an opacity of
    // 0.7, allowing for the original image to be visible under.
    bodyPix.drawMask(
        canvas, img, coloredPartImage, opacity, maskBlurAmount,
        flipHorizontal);
    div.appendChild(canvas);
    /*const pose = await net.estimateSinglePose(img, {
        flipHorizontal: false
    });
    console.log(pose);

    if (pose.score >= minPoseConfidence) {
        drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    } */
}