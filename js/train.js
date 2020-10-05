document.addEventListener('DOMContentLoaded', setup);

var userToken = '';;

function setup(){
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
            processImages(result.entries);
        },
        error: function(xhr, status, error) { 
            alert("Something went wrong, trying again.");
            sessionStorage.removeItem('userToken');
            setup();
         }
    })
}

function getImage(id){
    $.ajax('https://api.box.com/2.0/files/' + id + '/content?access_token=' + userToken, 
    {
        type: 'GET',
        success: function(data, status, xhr) {
            var img = document.createElement('img');            
            var url = window.URL || window.webkitURL;
            img.src = url.createObjectURL(data);
            img.style.width = '50vw'; 
            document.body.appendChild(img);
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

function processImages(images){
    for (i in images){
        getImage(images[i].id);
    }
}