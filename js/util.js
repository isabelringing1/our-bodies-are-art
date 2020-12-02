function gethbRatio(data){
    var h = 0; var b = 0;
    for (var i = 0; i < data.length; i+=4){
        if (data[i] == GREEN[0]){
            b++;
        }
        else if (data[i] == PURPLE[0]){
            h++;
        }
    }
    if (b==0) {return 0;}
    return h / b;
}

function point_dist(a1, a2){
    p1 = [a1.split(",")[0], a1.split(",")[1]]
    p2 = [a2.split(",")[0], a2.split(",")[1]]
    return Math.sqrt(Math.pow(Math.abs(p1[0]-p2[0]), 2) + Math.pow(Math.abs(p1[1]-p2[1]), 2))
}

function loadJSON(loc, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', loc, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 