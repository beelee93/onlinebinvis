function ImageBuffer(canvasContext, width, height, name) {
    this.name = name;
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("class", "buffer-canvas");
    this.canvas.setAttribute("id", name);
    this.canvas.setAttribute("width", width.toString());
    this.canvas.setAttribute("height", height.toString());
    this.context = this.canvas.getContext("2d");

    document.getElementById("buffer-container").appendChild(this.canvas);

    this.imgData = this.context.createImageData(width, height);

    this.clearBuffer();
}

ImageBuffer.prototype.clearBuffer = function () {
    for (var x = 0; x < this.imgData.width; x++) {
        for (var y = 0; y < this.imgData.height; y++) {
            this.setPixel(x, y, 0, 0, 0);
        }
    }
}

ImageBuffer.prototype.setPixel = function (x, y, r, g, b) {
    var i = (y * this.imgData.width + x) * 4;
    this.imgData.data[i] = r;
    this.imgData.data[i+1] = g;
    this.imgData.data[i+2] = b;
    this.imgData.data[i+3] = 255;
}

ImageBuffer.prototype.flush = function () {
    this.context.putImageData(this.imgData, 0, 0);
}

ImageBuffer.prototype.getCanvas = function () {
    return this.canvas;
}

ImageBuffer.prototype.dispose = function () {
    document.getElementById("buffer-container").removeChild(this.canvas);
    this.context = null;
    this.canvas = null;
    this.imgData = null;
    delete this.context;
    delete this.canvas;
    delete this.imgData;
}