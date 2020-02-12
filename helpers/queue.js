class Queue {
    elements = [];

    forEach(callback) {
        this.elements.forEach(callback);
    }

    enqueue(element) {
        this.elements.push(element);
    }

    dequeue(element) {
        this.elements.shift()
    }
}

module.exports = Queue;