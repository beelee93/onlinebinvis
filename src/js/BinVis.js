var BinVis = {};

// consts
BinVis.PANEL_BYTEMAP = 0;
BinVis.PANEL_DIGRAPH = 1;
BinVis.PANEL_DOTPLOT = 1;

// controls the analysis range
BinVis.BLOCK_SIZE = 512 * 512;
BinVis.fileLoadingPhase = Globals.FILE_NOFILE;
BinVis.dataOffset = 0;
BinVis.dataLength = 0;

// Panels
BinVis.selectedPanel = null;

BinVis.panelBytemap=null;
BinVis.panelDigraph=null;
BinVis.panelDotPlot=null;

BinVis.panels = [];

BinVis.hexViewerInitialized = false;
BinVis.hexViewerHighlight = -1;
BinVis.hexViewerOffset = -1;

// image buffers
BinVis.IMG_BUFFER_256 = {};
BinVis.IMG_BUFFER_512 = {};

///////////////////////////////////////////////////////////////////
// Initializes the binvis app
// id: main-canvas = canvas to draw the UI on
///////////////////////////////////////////////////////////////////
BinVis.initialize = function () {
    BinVis.initHexViewer();
    FileBuffer.initialize();
    FileBuffer.onsuccess = this.loadFileSuccessHandler;
    FileBuffer.onerror = this.loadFileErrorHandler;

    UserInterface.initialize("main-canvas");

    BinVis.IMG_BUFFER_256 = new ImageBuffer(256, 256, "256x256");
    BinVis.IMG_BUFFER_512 = new ImageBuffer(512, 512, "512x512");
}

///////////////////////////////////////////////////////////////////
// Opens a file for analysis
///////////////////////////////////////////////////////////////////
BinVis.loadFile = function (file) {
    jQuery("#offset-slider-container").css("display", "none");
    this.resetAllPanels();

    if (FileBuffer.file)
        FileBuffer.closeFile();

    FileBuffer.openFile(file);
    FileBuffer.asyncReadBytes();
    this.dataOffset = 0;
    this.dataLength = file.size; // file size in bytes
    console.log("Reading file...");
    Globals.FILE_LOADING;
}

///////////////////////////////////////////////////////////////////
// Handles successful file load - initialize all panels
///////////////////////////////////////////////////////////////////
BinVis.loadFileSuccessHandler = function () {
    // successful reading
    BinVis.fileLoadingPhase = Globals.FILE_LOADED;
    console.log("FILE FINISHED READING!");
    BinVis.initializePanels();

    jQuery("#offset-slider-container").css("display", "inline");

    // Hex viewer mechanics
		BinVis.updateHexViewer(0);
		
		// ScrollBar
		ScrollBar.updateDimension();
}

///////////////////////////////////////////////////////////////////
// Error loading file
///////////////////////////////////////////////////////////////////
BinVis.loadFileErrorHandler = function () {
    // error reading file
    console.log("ERROR READING!");
    BinVis.fileLoadingPhase = Globals.FILE_NOFILE;
    jQuery("#offset-slider-container").css("display", "none");
}

///////////////////////////////////////////////////////////////////
// Setter for data offset
///////////////////////////////////////////////////////////////////
BinVis.setDataOffset = function (newOffset) {
    if (newOffset < this.dataLength && newOffset >= 0) {
        this.dataOffset = newOffset;
        this.onOffsetChanged();
    }
}

///////////////////////////////////////////////////////////////////
// Signals to all panels to paint black and stop referencing the
// array buffer
///////////////////////////////////////////////////////////////////
BinVis.resetAllPanels = function () {
    for (var i = 0; i < this.panels.length; i++) {
        this.panels[i].renderEnabled = false;
        this.panels[i].invokeReset();
    }
}

///////////////////////////////////////////////////////////////////
// Update all panels based on current offset 
///////////////////////////////////////////////////////////////////
BinVis.onOffsetChanged = function () {
    if (this.selectedPanel) {
        this.selectedPanel.updateData();

        // force redraw
        this.selectedPanel.redraw = 1;
    }
}

///////////////////////////////////////////////////////////////////
// Signals to all panels to reference the array buffer
// Load up the default panel to be shown
///////////////////////////////////////////////////////////////////
BinVis.initializePanels = function () {

    // create the panels
    if (!this.panelBytemap) {
        this.panelBytemap = new BytemapPanel(UserInterface);
        this.panels.push(this.panelBytemap); // 0
    }
    
    if (!this.panelDigraph) {
        this.panelDigraph = new DigraphPanel(UserInterface);
        this.panels.push(this.panelDigraph); // 1
    }
    
    if (!this.panelDotPlot) {
        this.panelDotPlot = new DotPlotPanel(UserInterface);
        this.panels.push(this.panelDotPlot); // 2
    }

    // show the default panel
    this.showPanel(this.PANEL_BYTEMAP);
}

///////////////////////////////////////////////////////////////////
// Sets the respective panel to be displayed. All updates will also
// be routed to this panel
///////////////////////////////////////////////////////////////////
BinVis.showPanel = function (index) {
    if (this.selectedPanel) {
        this.selectedPanel.renderEnabled = false;
    }

    // flush the UI panels
    UserInterface.panels.length = 0;

    this.selectedPanel = this.panels[index];
    this.selectedPanel.renderEnabled = true;
    this.selectedPanel.updateData();

    // place this panel into UI to receive events
    UserInterface.panels = [];
    UserInterface.panels.push(this.selectedPanel);
};

///////////////////////////////////////////////////////////////////
// Initialises the hex viewer
///////////////////////////////////////////////////////////////////
BinVis.initHexViewer = function () {
    if (!BinVis.hexViewerInitialized) {

        var i, j;

        // create the hex viewer items

        // offset values
        for (i = 0; i < 32; i++) {
            var elem = document.createElement("span");
            elem.setAttribute("id", "offset-" + i);
            elem.appendChild(document.createTextNode(convertToHex(i * 16)));

            document.getElementById("hex-viewer-offset").appendChild(elem);


            for (j = 0; j < 16; j++) {
                // data values
                elem = document.createElement("span");
                elem.setAttribute("id", "data-" + (i * 16 + j));
                elem.appendChild(document.createTextNode("00"));

                document.getElementById("hex-viewer-hex").appendChild(elem);

                // text values
                elem = document.createElement("span");
                elem.setAttribute("id", "text-" + (i * 16 + j));
                elem.appendChild(document.createTextNode("."));

                document.getElementById("hex-viewer-text").appendChild(elem);
            }
        }

        BinVis.hexViewerInitialized = true;
    }
    else {
        // Set everything to 00
        for (i = 0; i < 32; i++) {
            $("#offset-" + i).text(convertToHex(i * 16));

            for (j = 0; j < 16; j++) {
                // data values
                $("#data-" + (i * 16 + j)).text("00");

                // text values
                $("#text-" + (i * 16 + j)).text(".");
            }
        }
    }
};

BinVis.updateHexViewer = function (offset) {

    // align to 4 bits
    offset = (offset & 0xFFFFFFF0);
		BinVis.hexViewerOffset = offset;
		
		if(FileBuffer.data) { // ensure data is loaded already
			var i,j, off,val;
			for (i = 0; i < 32; i++) {
				off = offset + i *16;
				$("#offset-" + i).text(convertToHex(off));
				
        for (j = 0; j < 16; j++) {
					if(off+j < FileBuffer.data.length) {
						val = FileBuffer.data[off + j];
						
						// data values
						$("#data-" + (i * 16 + j)).text(convertToHex(val, 2));
						// text values
						$("#text-" + (i * 16 + j)).text(Converter.getPrintable(val));
          }
					else {
						// data values
						$("#data-" + (i * 16 + j)).text("  ");
						// text values
						$("#text-" + (i * 16 + j)).text(" ");
					}
				}
      }
		}
};

// highlights corresponding span 
BinVis.highlightHex = function(offset) {
	if(this.hexViewerHighlight > -1) {
		$("#data-" + this.hexViewerHighlight).removeClass("hexHighlight");
		$("#text-" + this.hexViewerHighlight).removeClass("hexHighlight");
		this.hexViewerHighlight = -1;
	}
	
	if(offset>=BinVis.hexViewerOffset && offset<BinVis.hexViewerOffset + 512) {
		offset -= BinVis.hexViewerOffset;
		this.hexViewerHighlight = offset;
		$("#data-" + this.hexViewerHighlight).addClass("hexHighlight");
		$("#text-" + this.hexViewerHighlight).addClass("hexHighlight");
	}
};


// Helper functions

function setStartingOffset(num) {
    var i;
    for (i = 0; i < 32; i++) {
        document.getElementById("offset-" + i).textContent = convertToHex(num);
        num += 16;
    }
}

function setDataValue(offset, value) {
    // offset is zero-based from base offset
    if (offset < 0 || offset >= 512) return 0;

    if (value < 0) value = 0;
    if (value >= 256) value = 255;

    document.getElementById("data-" + offset).textContent = convertToHex(value,2);
    document.getElementById("text-" + offset).textContent = Converter.getPrintable(value);
} 

function convertToHex(num, length) {
    if (length === undefined) length = 8;

    var a = num.toString(16).toUpperCase();
    while(a.length < length) 
        a="0" + a;
    return a;
}

