// Displays the bytemap of the current range of analysis

function BytemapPanel(parent) {
    Globals.superConstructor(this, VisualPanel, [parent]);

    this.name = "Bytemap";
    this.size.width = 512;
    this.size.height = 512;

    this.scanwidth = 512; // number of bytes displayed in a line

    // create buffer
    this.imageBuffer = new ImageBuffer(parent.context, 512, 512, "bytemap-panel");

    this.redraw = 1;
}

// Inheritance
Globals.inherits(BytemapPanel, VisualPanel);

BytemapPanel.prototype.setScanWidth = function (newScanWidth) {
    if (newScanWidth < 1) newScanWidth = 1;
    if (newScanWidth > 512) newScanWidth = 512;
    this.scanwidth = newScanWidth;
    this.updateData();
    this.redraw = 1;
}

BytemapPanel.prototype.update = function (diffTime) {

}

BytemapPanel.prototype.updateData = function () {
    // draw data from FileBuffer data
    this.imageBuffer.clearBuffer();
    if (FileBuffer.data) {
        var i;
        var stop = false;
        for (var y = 0; y < this.size.height && !stop; y++) {
            for (var x = 0; x < this.scanwidth; x++) {
                i = y * this.scanwidth + x;
                if (BinVis.dataOffset + i >= BinVis.dataLength) {
                    stop = true;
                    break;
                }
                this.imageBuffer.setPixel(x, y, 0, FileBuffer.data[BinVis.dataOffset + i], 0);
            }
        }
        this.redraw = 1;
    }
}

BytemapPanel.prototype.render = function (ctx, diffTime) {
    if (this.redraw > 0) {
        console.log("REDRAW BYTEMAP");
        this.imageBuffer.flush();
        this.redraw--;
    }

    ctx.drawImage(this.imageBuffer.getCanvas(), 0, 0);
}