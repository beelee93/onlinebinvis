// Displays the bytemap of the current range of analysis

function BytemapPanel(parent) {
    Globals.superConstructor(this, VisualPanel, [parent]);

    this.name = "Bytemap";
    this.size.width = 512;
    this.size.height = 512;

    this.scanwidth = 512; // number of bytes displayed in a line

    // create buffer
    this.imageBuffer = BinVis.IMG_BUFFER_512;

    this.pixelFormat = Globals.PF8BPP;
    this.pixelFormatAlpha = 0;
    this.pixelFormatText = "8 bpp";
		this.classifyBytes = false;
		
    this.lastMouse = [0, 0, 0, 0,0]; // cx,cy,mappedx,mappedy,offset

    this.redraw = 1;
		this.drawMouseInfo = false;
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

BytemapPanel.prototype.setPixelFormat = function (newpf) {
		this.pixelFormat = newpf % 6;
		this.setPixelFormatText();
		this.pixelFormatAlpha = 2;
		this.updateData();
			
		if(this.pixelFormat==0) { // 8BPP
			$(".byte-class-check").css("display","inline");
			$("#check-classify")[0].checked = this.classifyBytes;
		} else {
			$(".byte-class-check").css("display","none");
		}
};

BytemapPanel.prototype.setClassifyBytes = function(classify) {
	this.classifyBytes = classify;
	this.updateData();
}

BytemapPanel.prototype.update = function (diffTime) {
    if (this.pixelFormatAlpha > 0) {
        this.pixelFormatAlpha -= diffTime;
    }
}

BytemapPanel.prototype.updateData = function () {
    // draw data from FileBuffer data
    this.imageBuffer.clearBuffer();
    if (FileBuffer.data) {
        var i, x, y, temp, centering;
				var r,g,b;
        var fb = FileBuffer.data;
        var stop = false;

        centering = Math.floor(( this.imageBuffer.getWidth() - this.scanwidth ) / 2);
        switch (this.pixelFormat) {
            case Globals.PF8BPP:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = y * this.scanwidth + x;
                        if (BinVis.dataOffset + i >= BinVis.dataLength) {
                            stop = true;
                            break;
                        }
												
												if(this.classifyBytes) {
													temp = fb[BinVis.dataOffset + i];
													if(temp == 0) this.imageBuffer.setPixel(centering + x, y, 0, 0, 0); // NUL byte
													else if(temp == 255) this.imageBuffer.setPixel(centering + x, y, 255,255,255); // 0xFF byte
													else {
														if (temp >=32 && temp < 128) { // ASCII range
															this.imageBuffer.setPixel(centering + x, y, 0,0,128 + (temp-32) * 128 / 95);
														} else { // Any other bytes
															this.imageBuffer.setPixel(centering + x, y, temp,0,0);
														}
													}
														
												}else {
													 this.imageBuffer.setPixel(centering + x, y, 0, fb[BinVis.dataOffset + i], 0);
												}  
                    }
                }
                break;

            case Globals.PF16BPP:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = (y * this.scanwidth + x) * 2 + BinVis.dataOffset;
                        if (i >= BinVis.dataLength - 1) {
                            stop = true;
                            break;
                        }

                        // get green
                        temp = (fb[i] & 0x7) << 3;
                        temp |= (fb[i + 1] & 0xE0) >> 5;
                        temp = temp * 255 / 63;

                        this.imageBuffer.setPixel(centering + x, y, ((fb[i] & 0xF8) >> 3) * 255 / 31, temp,
                                                         (fb[i + 1] & 0x1F) * 255 / 31);
                    }
                }
                break;

            case Globals.PF24BPP_RGB:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = (y * this.scanwidth + x) * 3 + BinVis.dataOffset;
                        if (i >= BinVis.dataLength - 2) {
                            stop = true;
                            break;
                        }
                        this.imageBuffer.setPixel(centering + x, y, fb[i], fb[i + 1], fb[i + 2]);
                    }
                }
                break;

            case Globals.PF24BPP_BGR:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = (y * this.scanwidth + x) * 3 + BinVis.dataOffset;
                        if (i >= BinVis.dataLength - 2) {
                            stop = true;
                            break;
                        }
                        this.imageBuffer.setPixel(centering + x, y, fb[i + 2], fb[i + 1], fb[i]);
                    }
                }
                break;

            case Globals.PF32BPP_ARGB:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = (y * this.scanwidth + x) * 4 + BinVis.dataOffset;
                        if (i >= BinVis.dataLength - 3) {
                            stop = true;
                            break;
                        }
                        temp = fb[i] / 255;
                        this.imageBuffer.setPixel(centering + x, y, fb[i + 1] * temp, fb[i + 2] * temp, fb[i + 3] * temp);
                    }
                }
                break;

            case Globals.PF32BPP_BGRA:
                for (y = 0; y < this.size.height && !stop; y++) {
                    for (x = 0; x < this.scanwidth; x++) {
                        i = (y * this.scanwidth + x) * 4 + BinVis.dataOffset;
                        if (i >= BinVis.dataLength - 3) {
                            stop = true;
                            break;
                        }
                        temp = fb[i + 3] / 255;
                        this.imageBuffer.setPixel(centering + x, y, fb[i + 3] * temp, fb[i + 2] * temp, fb[i + 1] * temp);
                    }
                }
                break;
        }

        this.redraw = 1;
    }
}

BytemapPanel.prototype.setPixelFormatText = function () {
    switch (this.pixelFormat) {
        case Globals.PF8BPP:
            this.pixelFormatText = "8 bpp";
            break;
        case Globals.PF16BPP:
            this.pixelFormatText = "16 bpp";
            break;

        case Globals.PF24BPP_RGB:
            this.pixelFormatText = "24 bpp RGB";
            break;

        case Globals.PF24BPP_BGR:
            this.pixelFormatText = "24 bpp BGR";
            break;

        case Globals.PF32BPP_ARGB:
            this.pixelFormatText = "32 bpp ARGB";
            break;

        case Globals.PF32BPP_BGRA:
            this.pixelFormatText = "32 bpp BGRA";
            break;
    }
}

BytemapPanel.prototype.render = function (ctx, diffTime) {
    if (this.redraw > 0) {
        console.log("REDRAW BYTEMAP");
        this.imageBuffer.flush();
        this.redraw--;
    }

    ctx.drawImage(this.imageBuffer.getCanvas(), 0, 0);

    // draw the mouse position - offset indicator
    if (this.drawMouseInfo && this.lastMouse[2] >= 0 && this.lastMouse[2] <= (this.size.width + this.scanwidth) / 2) {

        // TODO: Make this text look clearer!!
        var offX = 20, offY = 32;

        if (this.lastMouse[0] < 400) ctx.textAlign = "left";
        else { ctx.textAlign = "right"; offX = 0; }
        if (this.lastMouse[1] < 400) ctx.textBaseLine = "top";
        else { ctx.textBaseLine = "bottom"; offY = -2; }

        offX = this.lastMouse[0] / UserInterface.canvas.clientWidth * 512 + offX;
        offY = this.lastMouse[1] / UserInterface.canvas.clientHeight * 512 + offY;

        var txt = this.lastMouse[4].toString();

        ctx.font = "14px monospace bold";
        ctx.strokeStyle = "black";
        ctx.strokeText(txt, offX, offY);

        ctx.fillStyle = "white";
        ctx.fillText(txt, offX, offY);
    }

    // draw the pixel format notifier
    if (this.pixelFormatAlpha > 0) {
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "white";
        ctx.globalAlpha = Math.min(this.pixelFormatAlpha, 1);
        ctx.font = "32px monospace bolder";
        ctx.textBaseline = "top";
				ctx.textAlign = "left";

        ctx.fillText(this.pixelFormatText, 10, 10);
        ctx.strokeText(this.pixelFormatText, 10, 10);

        ctx.globalAlpha = 1;
    }
}

BytemapPanel.prototype.onkeypress = function (evt) {
    switch (evt.key) {
        case 'p': // P - cycle pixel formats
            this.setPixelFormat(this.pixelFormat+1);
						$("#select-pixelformat")[0].selectedIndex = this.pixelFormat;
            break;

        case 'a':
            if (evt.ctrlKey)
                this.setScanWidth(this.scanwidth - 10);
            else
                this.setScanWidth(this.scanwidth - 1);
            evt.preventDefault();
            this.onMouseMove(this.lastMouse[0], this.lastMouse[1]);
						
						$("#scanwidth-slider")[0].value=this.scanwidth.toString();
						$("#scanwidth-text")[0].value=this.scanwidth.toString();
						
            break;
        case 'd':
            if (evt.ctrlKey)
                this.setScanWidth(this.scanwidth + 10);
            else
                this.setScanWidth(this.scanwidth + 1);
            evt.preventDefault();
            this.onMouseMove(this.lastMouse[0], this.lastMouse[1]);
						$("#scanwidth-slider")[0].value=this.scanwidth.toString();
						$("#scanwidth-text")[0].value=this.scanwidth.toString();
            break;
    }
}

BytemapPanel.prototype.onMouseMove = function (x, y) {
    this.lastMouse[0] = x;
    this.lastMouse[1] = y;

    var x0 = (this.size.width - this.scanwidth) / 2;

    this.lastMouse[2] = Math.floor(x / UserInterface.canvas.clientWidth * this.size.width - x0);
    this.lastMouse[3] = Math.floor(y / UserInterface.canvas.clientHeight * this.size.height);

    // gotta take into account pixel format
    var mult = 1;
    switch (this.pixelFormat) {
        case Globals.PF16BPP:
            mult = 2;
            break;

        case Globals.PF24BPP_RGB:
        case Globals.PF24BPP_BGR:
            mult = 3;
            break;

        case Globals.PF32BPP_ARGB:
        case Globals.PF32BPP_BGRA:
            mult = 4;
            break;
    }

    this.lastMouse[4] = (this.lastMouse[3] * this.scanwidth + this.lastMouse[2]) * mult + BinVis.dataOffset;
};

BytemapPanel.prototype.onMouseDown = function (x, y) {
    this.onMouseMove(x, y);
		
		if(this.lastMouse[2] < 0 || this.lastMouse[2] > this.scanwidth) 
			return 0;
		
		// invoke the Hex Viewer to display current offset

		// let's align to 9 bits
		var off = (this.lastMouse[4] & 0xFFFFFE00);
		BinVis.updateHexViewer(off);
		
		// update track position
		ScrollBar.updateTrackPosition();
		
		// now highlight the corresponding offset
		BinVis.highlightHex(this.lastMouse[4]);
};