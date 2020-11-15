//adpated from https://www.tutorialspoint.com/The-PriorityQueue-Class-in-Javascript

class PriorityQueue {
    constructor(maxSize, size) {
       this.maxSize = maxSize;
       this.vps =  new Array(size).fill(false);
       this.container = [];
    }

    isEmpty() {
       return this.container.length === 0;
    }

    isFull() {
        return this.container.length >= this.maxSize;
    }

    length() {
        return this.container.length;
    }

    enqueue(data, dist) {
       let currElem = new this.Element(data, dist);
       if (this.vps[currElem.data.vp]) { //vp already in queue
           return;
       }
       let addedFlag = false;
       // Order elements as [farthest ... closest]
       for (let i = 0; i < this.container.length; i++) {
          if (currElem.dist > this.container[i].dist) {
            this.container.splice(i, 0, currElem);
            this.vps[currElem.data.vp] = true;
            addedFlag = true; 
            break;
          }
       }
       if (!addedFlag) {
          this.container.push(currElem);
          this.vps[currElem.data.vp] = true;
       }
       if (this.length() > this.maxSize) {
            this.vps[this.first().vp] =  false;
            this.container.shift();
        }
    }

    dequeue() {
        if (this.isEmpty()) {
            console.log("Queue Underflow!");
            return;
        }
        return this.container.pop();
    }

    peek() {
        if (this.isEmpty()) {
            console.log("Queue Underflow!");
            return;
        }
        return this.container[this.container.length - 1];
    }

    first(){
        if (this.isEmpty()) {
            console.log("Queue Underflow!");
            return;
        }
        return this.container[0];
    }

    clear(){
        this.container = [];
        this.vps = new Array(size).fill(false);
    }
}

 PriorityQueue.prototype.Element = class {
    constructor(data, dist) {
       this.data = data;
       this.dist = dist;
    }
 };