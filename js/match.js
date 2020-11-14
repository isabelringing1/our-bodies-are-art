
function make_tree(points){
    let queue = [];
    let d = [...points.keys()];
    let root = {
        data: d, 
        vp: Math.floor(Math.random() * (d.length+1)),
    };
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
            let [r_mu, r_inside, r_outside] = separate(points, node.right.data, node.right.vp);
            node.right.mu = r_mu;
            node.right.inside = r_inside;
            node.right.outside = r_outside;
            queue.push(node.right);
        }
    }
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
    inside = []
    outside = []
    for (var i = 0; i < data.length; i++){
        d = dist(points[data[i]], center);
        if (d < mu){ 
            inside.push(data[i]) //this should also include center
        }
        else{
            outside.push(data[i])
        }
    }
    return [mu, inside, outside]
}

function dist(p1, p2){ //must change to multi-dimensional distance
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
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
    console.log(node)
}