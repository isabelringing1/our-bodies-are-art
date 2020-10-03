document.addEventListener('DOMContentLoaded', setup);

function setup(){
    $.get('https://isabel-senior-project.herokuapp.com/folders/123366833733/items', function(info) {
        console.log(info);
     });
}