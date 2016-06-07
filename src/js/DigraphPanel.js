// Displays the digraph plot of the bytemap

function DigraphPanel(parent) {
    Globals.superConstructor(this, VisualPanel, [parent]);
    
    this.name="Digraph";
    this.size.width = 512;
    this.size.height = 512;

    // create buffer
    this.imageBuffer = BinVis.IMG_BUFFER_256;
    this.digraph = new Uint8Array(256*256);
    this.clearByteArray();

    this.windowSize = 65536;

    this.contrastValue = 170;
    this.redraw=1;
}

// Inheritance
Globals.inherits(DigraphPanel, VisualPanel);

DigraphPanel.prototype.update = function(diffTime) {
    
};

DigraphPanel.prototype.invokeReset = function() {
    console.log("RESET DIGRAPH");
    this.imageBuffer.clearBuffer();
    this.clearByteArray(); 
};

DigraphPanel.prototype.updateData = function() {
    this.imageBuffer.clearBuffer();
    if(FileBuffer.data){
        
        var x,y,i,count,val,temp, szX, szY, maxValue;
        var fb=FileBuffer.data;

        // populate byte grid

        // first clear everything
        this.clearByteArray();

        count=0;
        maxValue = 1;
        for(i=BinVis.dataOffset;i<BinVis.dataLength-1 && count<this.windowSize-1;
            i++, count++) {
                val = this.incrementByte(fb[i],fb[i+1]);
                if(val>maxValue) maxValue = val;
            }
        this.firstUpdate = false;
     
        // render onto canvas
        szX = this.size.width >> 8;
        szY = this.size.height >> 8;

        for(y=0;y<256;y++) {
            for(x=0;x<256;x++) {
                i=y*256+x;
                
                if(this.digraph[i]>0)
                {    
                    temp = this.digraph[i]/maxValue*this.contrastValue +
                            255 - this.contrastValue;
                    this.imageBuffer.setPixel(x,y,0,temp,0);
                }
            }
        }
    }
    
};

DigraphPanel.prototype.render = function(ctx, diffTime) {
    if(this.redraw>0){
        this.imageBuffer.flush();
        console.log("DIGRAPH REDRAW");
        this.redraw--;
    }
    
    ctx.drawImage(this.imageBuffer.getCanvas(), 0,0,this.size.width, 
        this.size.height);
};


DigraphPanel.prototype.clearByteArray = function() {
  for(var i=0;i<65536;i++)
      this.digraph[i]=0;
};

DigraphPanel.prototype.incrementByte = function(x,y) {
    var k = y*256+x;
    if(this.digraph[k]<255)
        this.digraph[k] += 1;
    return this.digraph[k];
}

DigraphPanel.prototype.decrementByte = function(x,y) {
    var k = y*256+x;
    if(this.digraph[k]>0)
        this.digraph[k] -= 1;
    return this.digraph[k];
}