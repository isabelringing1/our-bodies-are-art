var data = false;
var datatree = false;

function set_data(points){
    data = points;
}

// Points is an array of data arrays, one per piece
function make_tree(points){
    let queue = [];
    let d = [...points.keys()];
    let root = {
        data: d, 
        vp: Math.floor(Math.random() * (d.length+1)),
    };
    root.name = "VP " + root.vp + " (" + root.data.length + ")";
    let sep = separate(points, root.data, root.vp);
    root.mu = sep[0];
    root.inside = sep[1];
    root.outside = sep[2];
    queue.push(root);
    console.log(root);
    while (queue.length != 0){
        node = queue.pop();
        if (node.data.length > 1 && node.inside.length != 0){
            node.left = {
                data: node.inside,
                vp: node.inside[Math.floor(Math.random() * node.inside.length)],
            }
            node.left.name = "VP " + node.left.vp + " (" + node.left.data.length + ")";
            let [l_mu, l_inside, l_outside] = separate(points, node.left.data, node.left.vp);
            node.left.mu = l_mu;
            node.left.inside = l_inside;
            node.left.outside = l_outside;
            queue.push(node.left);
        }
        if (node.data.length > 1 && node.outside.length != 0){
            node.right = {
                data: node.outside,
                vp: node.outside[Math.floor(Math.random() * node.outside.length)],
            }
            node.right.name = "VP " + node.right.vp + " (" + node.right.data.length + ")";
            let [r_mu, r_inside, r_outside] = separate(points, node.right.data, node.right.vp);
            node.right.mu = r_mu;
            node.right.inside = r_inside;
            node.right.outside = r_outside;
            queue.push(node.right);
        }
    }
    datatree = root;
    return root;
}

function separate(points, data, vp){
    center = points[vp];
    dists = [];
    for (var i = 0; i < data.length; i++){
        if (center != points[data[i]]){ //we don't include the center
            dists.push(dist(points[data[i]], center));
        }
    }
    dists.sort();
    let mu = 0;
    if (dists.length % 2  == 1){ 
        mu = dists[Math.floor(dists.length/2)];
    }
    else {
        mu = (dists[dists.length/2] + dists[dists.length/2 - 1]) / 2;
    }
    inside = [];
    outside = [];
    for (var i = 0; i < data.length; i++){
        d = dist(points[data[i]], center);
        if (d < mu){ 
            inside.push(data[i]); //this should also include center
        }
        else{
            outside.push(data[i]);
        }
    }
    return [mu, inside, outside]
}

function dist(p1, p2){ 
    let d = 0;
    for (i = 0; i < p1.length; i++){ //len of point = dimensions
        d += Math.pow(p1[i] - p2[i], 2);
    }
    return Math.sqrt(d);
}

//function returns the k closest points from query
function knn(root, k, query, points){
    var tau = Number.MAX_SAFE_INTEGER;
    var search = [root];
    var closest = new PriorityQueue(k, points.length);
    while (search.length != 0){
        node = search.pop();
        d = dist(points[node.vp], query);
        if (d < tau){
            closest.enqueue(node, d);
            if (closest.isFull()){
                tau = dist(query, points[closest.first().data.vp]);
            }
        }
        if (d < node.mu + tau && node.data.length > 1){ //need to search inside subtree
            search.push(node.left);
        }
        if (d >= node.mu - tau && node.data.length > 1){ //need to search outside subtree
            search.push(node.right);
        }
    }
    return closest;
}

function print_tree(root){
    print_node(root);
    if (root.left){
        console.log("LEFT")        
        print_tree(root.left);
    }
    if (root.right){
        console.log("RIGHT");
        print_tree(root.right);
    }
}

function print_node(node){
    console.log(node);
}

