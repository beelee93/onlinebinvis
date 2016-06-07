// Displays the Kaminsky plot of the bytemap

function DotPlotPanel(parent) {
    Globals.superConstructor(this, VisualPanel, [parent]);
    
    this.name="DotPlot";
    this.size.width = 512;
    this.size.height = 512;

    // create buffer
    this.imageBuffer = BinVis.IMG_BUFFER_512;

    this.contrastValue = 170;
    this.redraw=1;
}

// Inheritance
Globals.inherits(DotPlotPanel, VisualPanel);

DotPlotPanel.prototype.update = function(diffTime) {
    
};

DotPlotPanel.prototype.invokeReset = function() {

};

DotPlotPanel.prototype.updateData = function() {
    this.imageBuffer.clearBuffer();
    if(FileBuffer.data){
        
        var x,y,i;
        var fb=FileBuffer.data;
        i = BinVis.dataOffset;
        
        for(y=0;y<512 && y+i<BinVis.dataLength;y++) {
            for(x=0;x<512 && x+i<BinVis.dataLength;x++) {
                if(fb[i+y] == fb[i+x])
                    this.imageBuffer.setPixel(x,y,0,255,0);
            }
        }
    }
    
};

DotPlotPanel.prototype.render = function(ctx, diffTime) {
    if(this.redraw>0){
        this.imageBuffer.flush();
        console.log("DOTPLOT REDRAW");
        this.redraw--;
    }
    
    ctx.drawImage(this.imageBuffer.getCanvas(), 0,0,this.size.width, 
        this.size.height);
};